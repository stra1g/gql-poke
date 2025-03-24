import prisma from './prisma.client';
import { pokemons } from './data/pokemon';

async function main() {
  await prisma.pokemon.deleteMany();
  for (const { name, type } of pokemons) {
    const { id: typeId } = await fetchType(type);

    await prisma.pokemon.create({
      data: {
        name,
        types: {
          create: {
            type: {
              connect: {
                id: typeId,
              },
            },
          },
        },
      },
    });
  }
}

async function fetchType(type: string) {
  return prisma.types.upsert({
    where: {
      name: type.toLowerCase(),
    },
    update: {},
    create: {
      name: type.toLowerCase(),
    },
  });
}

main()
  .catch((error) => {
    console.error('Error seeding the database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding completed successfully');
  });
