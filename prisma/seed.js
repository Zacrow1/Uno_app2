const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  
  // Create some sample players
  const player1 = await prisma.player.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password_1',
    },
  })
  
  const player2 = await prisma.player.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'hashed_password_2',
    },
  })
  
  // Create a sample game
  const game = await prisma.game.create({
    data: {
      name: 'Sample UNO Game',
      maxPlayers: 4,
      status: 'waiting',
      creatorId: player1.id,
    },
  })
  
  // Add players to game
  await prisma.game.update({
    where: { id: game.id },
    data: {
      players: {
        connect: [{ id: player1.id }, { id: player2.id }],
      },
    },
  })
  
  // Create some sample scores
  await prisma.score.create({
    data: {
      score: 100,
      position: 1,
      playerId: player1.id,
      gameId: game.id,
    },
  })
  
  await prisma.score.create({
    data: {
      score: 85,
      position: 2,
      playerId: player2.id,
      gameId: game.id,
    },
  })
  
  // Create some sample tracking data for testing
  await prisma.apiTracking.createMany({
    data: [
      {
        endpointAccess: '/api/players',
        requestMethod: 'GET',
        statusCode: 200,
        requestCount: 50,
        responseTimeAvg: 120,
        responseTimeMin: 50,
        responseTimeMax: 300,
        userId: 'user123',
      },
      {
        endpointAccess: '/api/players',
        requestMethod: 'POST',
        statusCode: 201,
        requestCount: 30,
        responseTimeAvg: 150,
        responseTimeMin: 80,
        responseTimeMax: 400,
        userId: 'user456',
      },
      {
        endpointAccess: '/api/games',
        requestMethod: 'GET',
        statusCode: 200,
        requestCount: 40,
        responseTimeAvg: 200,
        responseTimeMin: 100,
        responseTimeMax: 500,
      },
      {
        endpointAccess: '/api/games',
        requestMethod: 'POST',
        statusCode: 201,
        requestCount: 20,
        responseTimeAvg: 250,
        responseTimeMin: 150,
        responseTimeMax: 600,
      },
      {
        endpointAccess: '/api/scores',
        requestMethod: 'GET',
        statusCode: 200,
        requestCount: 35,
        responseTimeAvg: 180,
        responseTimeMin: 90,
        responseTimeMax: 450,
      },
      {
        endpointAccess: '/api/scores',
        requestMethod: 'POST',
        statusCode: 201,
        requestCount: 15,
        responseTimeAvg: 220,
        responseTimeMin: 120,
        responseTimeMax: 550,
      },
      {
        endpointAccess: '/api/stats/requests',
        requestMethod: 'GET',
        statusCode: 200,
        requestCount: 10,
        responseTimeAvg: 100,
        responseTimeMin: 40,
        responseTimeMax: 200,
      },
      {
        endpointAccess: '/api/stats/response-times',
        requestMethod: 'GET',
        statusCode: 200,
        requestCount: 8,
        responseTimeAvg: 110,
        responseTimeMin: 45,
        responseTimeMax: 250,
      },
      {
        endpointAccess: '/api/stats/status-codes',
        requestMethod: 'GET',
        statusCode: 200,
        requestCount: 6,
        responseTimeAvg: 95,
        responseTimeMin: 35,
        responseTimeMax: 180,
      },
      {
        endpointAccess: '/api/stats/popular-endpoints',
        requestMethod: 'GET',
        statusCode: 200,
        requestCount: 5,
        responseTimeAvg: 105,
        responseTimeMin: 50,
        responseTimeMax: 220,
      },
    ],
  })
  
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })