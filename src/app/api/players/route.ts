import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withTracking } from '@/middleware'

export const GET = withTracking(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    
    const skip = (page - 1) * limit
    
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}
    
    const [players, total] = await Promise.all([
      db.player.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.player.count({ where }),
    ])
    
    return NextResponse.json({
      players,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
})

export const POST = withTracking(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, email, password } = body
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }
    
    // Check if player already exists
    const existingPlayer = await db.player.findUnique({
      where: { email },
    })
    
    if (existingPlayer) {
      return NextResponse.json(
        { error: 'Player with this email already exists' },
        { status: 409 }
      )
    }
    
    // Create new player (in a real app, you'd hash the password)
    const player = await db.player.create({
      data: {
        name,
        email,
        password, // TODO: Hash password in production
      },
    })
    
    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { error: 'Failed to create player' },
      { status: 500 }
    )
  }
})