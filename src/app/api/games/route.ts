import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withTracking } from '@/middleware'

export const GET = withTracking(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    
    const skip = (page - 1) * limit
    
    const where = status ? { status } : {}
    
    const [games, total] = await Promise.all([
      db.game.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          players: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.game.count({ where }),
    ])
    
    return NextResponse.json({
      games,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
})

export const POST = withTracking(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { name, maxPlayers, creatorId } = body
    
    if (!name || !maxPlayers || !creatorId) {
      return NextResponse.json(
        { error: 'Name, maxPlayers, and creatorId are required' },
        { status: 400 }
      )
    }
    
    if (maxPlayers < 2 || maxPlayers > 8) {
      return NextResponse.json(
        { error: 'Max players must be between 2 and 8' },
        { status: 400 }
      )
    }
    
    // Verify creator exists
    const creator = await db.player.findUnique({
      where: { id: creatorId },
    })
    
    if (!creator) {
      return NextResponse.json(
        { error: 'Creator not found' },
        { status: 404 }
      )
    }
    
    // Create new game
    const game = await db.game.create({
      data: {
        name,
        maxPlayers,
        creatorId,
        status: 'waiting',
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    })
    
    return NextResponse.json(game, { status: 201 })
  } catch (error) {
    console.error('Error creating game:', error)
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    )
  }
})