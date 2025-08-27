import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db'

interface ResponseTimeData {
  avg: number
  min: number
  max: number
}

export async function middleware(request: NextRequest) {
  const startTime = Date.now()
  
  // Only track API routes
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // Clone the response to modify it
  const response = NextResponse.next()
  
  // Track when the response finishes
  response.headers.set('X-Tracking-Start', startTime.toString())
  
  return response
}

export async function trackingMiddleware(request: NextRequest, response: Response) {
  const startTime = parseInt(response.headers.get('X-Tracking-Start') || '0')
  const endTime = Date.now()
  const responseTime = endTime - startTime
  
  const endpointAccess = request.nextUrl.pathname
  const requestMethod = request.method
  const statusCode = response.status
  
  // Get user ID from Authorization header if available
  const authHeader = request.headers.get('authorization')
  const userId = authHeader ? extractUserIdFromToken(authHeader) : null
  
  try {
    // Check if we already have tracking data for this endpoint
    const existingTracking = await db.apiTracking.findFirst({
      where: {
        endpointAccess,
        requestMethod,
        statusCode,
      },
    })
    
    if (existingTracking) {
      // Update existing tracking data
      const newCount = existingTracking.requestCount + 1
      const newAvg = (existingTracking.responseTimeAvg * existingTracking.requestCount + responseTime) / newCount
      const newMin = Math.min(existingTracking.responseTimeMin, responseTime)
      const newMax = Math.max(existingTracking.responseTimeMax, responseTime)
      
      await db.apiTracking.update({
        where: { id: existingTracking.id },
        data: {
          requestCount: newCount,
          responseTimeAvg: newAvg,
          responseTimeMin: newMin,
          responseTimeMax: newMax,
          timestamp: new Date(),
          userId,
        },
      })
    } else {
      // Create new tracking entry
      await db.apiTracking.create({
        data: {
          endpointAccess,
          requestMethod,
          statusCode,
          requestCount: 1,
          responseTimeAvg: responseTime,
          responseTimeMin: responseTime,
          responseTimeMax: responseTime,
          timestamp: new Date(),
          userId,
        },
      })
    }
  } catch (error) {
    console.error('Error tracking API request:', error)
    // Don't throw error to avoid breaking the API response
  }
}

function extractUserIdFromToken(authHeader: string): string | null {
  try {
    // Simple token extraction - in a real app, you'd verify JWT tokens
    const token = authHeader.replace('Bearer ', '')
    // This is a simplified version - implement proper JWT verification
    return token.split('-')[0] || null
  } catch {
    return null
  }
}

// Higher-order function to wrap API handlers with tracking
export function withTracking(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    
    try {
      const response = await handler(req, ...args)
      
      // Track the request
      await trackRequest(req, response, startTime)
      
      return response
    } catch (error) {
      // Track failed requests
      const errorResponse = new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500 }
      )
      await trackRequest(req, errorResponse, startTime)
      throw error
    }
  }
}

async function trackRequest(req: NextRequest, response: Response, startTime: number) {
  const endTime = Date.now()
  const responseTime = endTime - startTime
  
  const endpointAccess = req.nextUrl.pathname
  const requestMethod = req.method
  const statusCode = response.status
  
  // Get user ID from Authorization header if available
  const authHeader = req.headers.get('authorization')
  const userId = authHeader ? extractUserIdFromToken(authHeader) : null
  
  try {
    // Check if we already have tracking data for this endpoint
    const existingTracking = await db.apiTracking.findFirst({
      where: {
        endpointAccess,
        requestMethod,
        statusCode,
      },
    })
    
    if (existingTracking) {
      // Update existing tracking data
      const newCount = existingTracking.requestCount + 1
      const newAvg = (existingTracking.responseTimeAvg * existingTracking.requestCount + responseTime) / newCount
      const newMin = Math.min(existingTracking.responseTimeMin, responseTime)
      const newMax = Math.max(existingTracking.responseTimeMax, responseTime)
      
      await db.apiTracking.update({
        where: { id: existingTracking.id },
        data: {
          requestCount: newCount,
          responseTimeAvg: newAvg,
          responseTimeMin: newMin,
          responseTimeMax: newMax,
          timestamp: new Date(),
          userId,
        },
      })
    } else {
      // Create new tracking entry
      await db.apiTracking.create({
        data: {
          endpointAccess,
          requestMethod,
          statusCode,
          requestCount: 1,
          responseTimeAvg: responseTime,
          responseTimeMin: responseTime,
          responseTimeMax: responseTime,
          timestamp: new Date(),
          userId,
        },
      })
    }
  } catch (error) {
    console.error('Error tracking API request:', error)
    // Don't throw error to avoid breaking the API response
  }
}