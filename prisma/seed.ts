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
