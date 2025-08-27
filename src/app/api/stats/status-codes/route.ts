import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withTracking } from '@/middleware'

export const GET = withTracking(async (req: NextRequest) => {
  try {
    // Get all tracking data
    const trackingData = await db.apiTracking.findMany({
      orderBy: { timestamp: 'desc' },
    })
    
    // Group by status code and sum the request counts
    const statusCodes = trackingData.reduce((acc, item) => {
      const statusCode = item.statusCode.toString()
      
      if (!acc[statusCode]) {
        acc[statusCode] = 0
      }
      
      acc[statusCode] += item.requestCount
      
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json(statusCodes)
  } catch (error) {
    console.error('Error fetching status code statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status code statistics' },
      { status: 500 }
    )
  }
})