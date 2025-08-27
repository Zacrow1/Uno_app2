import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withTracking } from '@/middleware'

export const GET = withTracking(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const gameId = searchParams.get('gameId')
    const playerId = searchParams.get('playerId')
    
    const skip = (page - 1) * limit
    
    const where = {
      ...(gameId && { gameId }),
      ...(playerId && { playerId }),
    }
    
    const [scores, total] = await Promise.all([
      db.score.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { position: 'asc' },
          { score: 'desc' },
        ],
        include: {
          player: {
            select: { id: true, name: true, email: true },
          },
          game: {
            select: { id: true, name: true, status: true },
          },
        },
      }),
      db.score.count({ where }),
    ])
    
    return NextResponse.json({
      scores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
})

export const POST = withTracking(async (req: NextRequest) => {
  try {
    const body = await req.json()
    const { score, position, playerId, gameId } = body
    
    if (!score || !position || !playerId || !gameId) {
      return NextResponse.json(
        { error: 'Score, position, playerId, and gameId are required' },
        { status: 400 }
      )
    }
    
    // Verify player and game exist
    const [player, game] = await Promise.all([
      db.player.findUnique({ where: { id: playerId } }),
      db.game.findUnique({ where: { id: gameId } }),
    ])
    
    if (!player || !game) {
      return NextResponse.json(
        { error: 'Player or game not found' },
        { status: 404 }
      )
    }
    
    // Create new score
    const newScore = await db.score.create({
      data: {
        score,
        position,
        playerId,
        gameId,
      },
      include: {
        player: {
          select: { id: true, name: true, email: true },
        },
        game: {
          select: { id: true, name: true, status: true },
        },
      },
    })
    
    return NextResponse.json(newScore, { status: 201 })
  } catch (error) {
    console.error('Error creating score:', error)
    return NextResponse.json(
      { error: 'Failed to create score' },
      { status: 500 }
    )
  }
})