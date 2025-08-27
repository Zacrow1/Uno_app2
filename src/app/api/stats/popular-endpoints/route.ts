import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withTracking } from '@/middleware'

export const GET = withTracking(async (req: NextRequest) => {
  try {
    // Get all tracking data
    const trackingData = await db.apiTracking.findMany({
      orderBy: { timestamp: 'desc' },
    })
    
    // Group by endpoint and sum the request counts
    const endpointCounts = trackingData.reduce((acc, item) => {
      const endpoint = item.endpointAccess
      
      if (!acc[endpoint]) {
        acc[endpoint] = 0
      }
      
      acc[endpoint] += item.requestCount
      
      return acc
    }, {} as Record<string, number>)
    
    // Find the most popular endpoint
    let mostPopular = ''
    let requestCount = 0
    
    Object.entries(endpointCounts).forEach(([endpoint, count]) => {
      if (count > requestCount) {
        mostPopular = endpoint
        requestCount = count
      }
    })
    
    return NextResponse.json({
      most_popular: mostPopular,
      request_count: requestCount,
    })
  } catch (error) {
    console.error('Error fetching popular endpoints statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular endpoints statistics' },
      { status: 500 }
    )
  }
})