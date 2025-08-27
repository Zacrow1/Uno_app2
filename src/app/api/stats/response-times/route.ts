import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withTracking } from '@/middleware'

export const GET = withTracking(async (req: NextRequest) => {
  try {
    // Get all tracking data
    const trackingData = await db.apiTracking.findMany({
      orderBy: { timestamp: 'desc' },
    })
    
    // Group by endpoint and calculate response time statistics
    const responseTimes = trackingData.reduce((acc, item) => {
      const endpoint = item.endpointAccess
      
      if (!acc[endpoint]) {
        acc[endpoint] = {
          avg: 0,
          min: Infinity,
          max: 0,
          totalRequests: 0,
          totalTime: 0,
        }
      }
      
      const endpointData = acc[endpoint]
      
      // Update min and max
      endpointData.min = Math.min(endpointData.min, item.responseTimeMin)
      endpointData.max = Math.max(endpointData.max, item.responseTimeMax)
      
      // Calculate weighted average
      endpointData.totalTime += item.responseTimeAvg * item.requestCount
      endpointData.totalRequests += item.requestCount
      endpointData.avg = endpointData.totalTime / endpointData.totalRequests
      
      return acc
    }, {} as Record<string, {
      avg: number
      min: number
      max: number
      totalRequests: number
      totalTime: number
    }>)
    
    // Format the response to match the required structure
    const formattedResponse = Object.entries(responseTimes).reduce((acc, [endpoint, data]) => {
      acc[endpoint] = {
        avg: Math.round(data.avg * 100) / 100, // Round to 2 decimal places
        min: Math.round(data.min * 100) / 100,
        max: Math.round(data.max * 100) / 100,
      }
      return acc
    }, {} as Record<string, {
      avg: number
      min: number
      max: number
    }>)
    
    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error('Error fetching response time statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch response time statistics' },
      { status: 500 }
    )
  }
})