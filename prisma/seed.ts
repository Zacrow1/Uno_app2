import { PrismaClient } from '@prisma/client'

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