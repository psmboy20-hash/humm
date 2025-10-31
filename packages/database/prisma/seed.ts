import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 테스트 사용자 생성
  const user = await prisma.user.upsert({
    where: { email: 'test@virtualcloset.com' },
    update: {},
    create: {
      email: 'test@virtualcloset.com',
      name: '테스트 사용자',
      profile: {
        create: {
          bodyType: 'REGULAR',
          height: 170,
          weight: 65,
          shoeSize: '270',
          preferences: {
            styles: ['casual', 'modern'],
            colors: ['black', 'white', 'navy'],
          },
        },
      },
    },
  });

  console.log('✅ Created user:', user.email);

  // 샘플 아이템 생성
  const items = [
    {
      name: '화이트 셔츠',
      category: 'TOP',
      brand: 'Uniqlo',
      size: 'L',
      color: 'White',
      season: 'ALL_SEASON',
      price: 29000,
      tags: ['basic', 'formal'],
    },
    {
      name: '블랙 진',
      category: 'BOTTOM',
      brand: "Levi's",
      size: '32',
      color: 'Black',
      season: 'ALL_SEASON',
      price: 89000,
      tags: ['denim', 'casual'],
    },
    {
      name: '가죽 자켓',
      category: 'OUTER',
      brand: 'Zara',
      size: 'L',
      color: 'Black',
      season: 'FALL',
      price: 129000,
      tags: ['leather', 'casual'],
    },
    {
      name: '니트 스웨터',
      category: 'TOP',
      brand: 'Muji',
      size: 'L',
      color: 'Navy',
      season: 'WINTER',
      price: 49000,
      tags: ['warm', 'casual'],
    },
    {
      name: '화이트 스니커즈',
      category: 'SHOES',
      brand: 'Nike',
      size: '270',
      color: 'White',
      season: 'ALL_SEASON',
      price: 109000,
      tags: ['sneakers', 'sports'],
    },
  ];

  for (const itemData of items) {
    const item = await prisma.clothingItem.create({
      data: {
        ...itemData,
        userId: user.id,
      },
    });
    console.log('✅ Created item:', item.name);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
