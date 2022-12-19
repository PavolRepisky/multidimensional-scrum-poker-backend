import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const johnDoe = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@doe.com',
      password: await bcryptjs.hash('passWord123$', 10),
    },
  });

  const janeDoe = await prisma.user.upsert({
    where: { email: 'jane@doe.com' },
    update: {},
    create: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@doe.com',
      password: await bcryptjs.hash('passWord123$', 10),
    },
  });

  const joeAverage = await prisma.user.upsert({
    where: { email: 'joe@average.com' },
    update: {},
    create: {
      firstName: 'Joe',
      lastName: 'Average',
      email: 'joe@average.com',
      password: await bcryptjs.hash('passWord123$', 10),
    },
  });

  console.log({ johnDoe, janeDoe, joeAverage });

  const animalMatrix = await prisma.matrix.create({
    data: {
      name: 'Animal-Matrix',
      size: [3, 3],
      values: ['🦬', '🦍', '🐘', '🐖', '🐺', '🐎', '🐀', '🐈', '🐕'],
      creatorId: johnDoe.id,
    },
  });

  const emojiMatrix = await prisma.matrix.create({
    data: {
      name: 'Emoji-Matrix',
      size: [3, 3],
      values: ['😉', '😀', '😆', '😶', '🫣', '😊', '😢', '🥲', '😇'],
      creatorId: janeDoe.id,
    },
  });

  const numberMatrix = await prisma.matrix.create({
    data: {
      name: 'Number-Matrix',
      size: [3, 3],
      values: ['02', '12', '13', '01', '11', '21', '00', '10', '20'],
      creatorId: joeAverage.id,
    },
  });

  console.log({ animalMatrix, emojiMatrix, numberMatrix });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
