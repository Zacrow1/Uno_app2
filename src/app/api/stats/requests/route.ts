import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withTracking } from '@/middleware'

export const GET = withTracking(async (req: NextRequest) => {
  try {
    // Get all tracking data
    const trackingData = await db.apiTracking.findMany({
      orderBy: { timestamp: 'desc' },
    })
    
    // Calculate total requests
    const totalRequests = trackingData.reduce((sum, item) => sum + item.requestCount, 0)
    
    // Group by endpoint and method
    const breakdown = trackingData.reduce((acc, item) => {
      const endpoint = item.endpointAccess
      const method = item.requestMethod
      
      if (!acc[endpoint]) {
        acc[endpoint] = {}
      }
      
      if (!acc[endpoint][method]) {
        acc[endpoint][method] = 0
      }
      
      acc[endpoint][method] += item.requestCount
      
      return acc
    }, {} as Record<string, Record<string, number>>)
    
    return NextResponse.json({
      total_requests: totalRequests,
      breakdown,
    })
  } catch (error) {
    console.error('Error fetching request statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch request statistics' },
      { status: 500 }
    )
  }
})