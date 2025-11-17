import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting staging seed...');

  await prisma.courseTime.deleteMany();
  await prisma.course.deleteMany();
  await prisma.training.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin1234!', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@hyrox.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      category: 'Men',
      weight: 80,
      height: 185,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  const users = [];
  const categories = ['Men', 'Women', 'Pro'];
  const cities = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice'];

  for (let i = 1; i <= 10; i++) {
    const password = await bcrypt.hash(`User${i}1234`, 10);
    const user = await prisma.user.create({
      data: {
        email: `user${i}@hyrox.com`,
        password,
        firstName: `User${i}`,
        lastName: `Test`,
        category: categories[i % categories.length],
        weight: 70 + (i * 2),
        height: 170 + (i * 2),
      },
    });
    users.push(user);

    await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: i % 2 === 0 ? 'dark' : 'light',
        notifications: i % 3 !== 0,
        language: 'fr',
      },
    });
  }
  console.log(`✅ Created ${users.length} users`);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const courseCount = Math.floor(Math.random() * 3) + 1;

    for (let j = 0; j < courseCount; j++) {
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const totalTime = 4800 + Math.floor(Math.random() * 1200);
      
      const course = await prisma.course.create({
        data: {
          userId: user.id,
          name: `Hyrox ${cities[i % cities.length]} ${date.getFullYear()}`,
          city: cities[i % cities.length],
          date,
          category: user.category || 'Men',
          totalTime,
          notes: j === 0 ? 'Premier Hyrox' : `Course ${j + 1}`,
          times: {
            create: [
              { segment: 'run1', timeSeconds: 240 + Math.floor(Math.random() * 40) },
              { segment: 'sledPush', timeSeconds: 180 + Math.floor(Math.random() * 30) },
              { segment: 'run2', timeSeconds: 250 + Math.floor(Math.random() * 40) },
              { segment: 'sledPull', timeSeconds: 200 + Math.floor(Math.random() * 30) },
              { segment: 'run3', timeSeconds: 245 + Math.floor(Math.random() * 40) },
              { segment: 'burpeeBroadJump', timeSeconds: 320 + Math.floor(Math.random() * 50) },
              { segment: 'run4', timeSeconds: 255 + Math.floor(Math.random() * 40) },
              { segment: 'row', timeSeconds: 280 + Math.floor(Math.random() * 40) },
              { segment: 'run5', timeSeconds: 260 + Math.floor(Math.random() * 40) },
              { segment: 'farmerCarry', timeSeconds: 190 + Math.floor(Math.random() * 30) },
              { segment: 'run6', timeSeconds: 250 + Math.floor(Math.random() * 40) },
              { segment: 'sandbagLunges', timeSeconds: 300 + Math.floor(Math.random() * 40) },
              { segment: 'run7', timeSeconds: 245 + Math.floor(Math.random() * 40) },
              { segment: 'wallBalls', timeSeconds: 310 + Math.floor(Math.random() * 40) },
              { segment: 'run8', timeSeconds: 240 + Math.floor(Math.random() * 40) },
            ],
          },
        },
      });
    }
  }
  console.log('✅ Created courses for all users');

  const trainingTypes = ['Run', 'Renfo', 'MixHyrox', 'Cardio', 'Strength'];
  for (const user of users) {
    const trainingCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < trainingCount; i++) {
      const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      await prisma.training.create({
        data: {
          userId: user.id,
          type: trainingTypes[Math.floor(Math.random() * trainingTypes.length)],
          date,
          duration: 30 + Math.floor(Math.random() * 90),
          distance: trainingTypes.includes('Run') ? 5 + Math.random() * 10 : null,
          load: trainingTypes.includes('Renfo') ? 50 + Math.random() * 50 : null,
          rpe: 5 + Math.floor(Math.random() * 5),
          notes: `Training ${i + 1}`,
        },
      });
    }
  }
  console.log('✅ Created trainings for all users');

  for (const user of users) {
    await prisma.goal.createMany({
      data: [
        {
          userId: user.id,
          title: 'Passer sous 1h25',
          targetTime: 5100,
          targetDate: new Date('2024-06-01'),
          achieved: Math.random() > 0.5,
        },
        {
          userId: user.id,
          title: 'Améliorer le sled push',
          targetTime: 150,
          achieved: Math.random() > 0.7,
        },
      ],
    });
  }
  console.log('✅ Created goals for all users');

  console.log('');
  console.log('🎉 Staging seed completed!');
  console.log('');
  console.log('📧 Admin credentials:');
  console.log('   Email: admin@hyrox.com');
  console.log('   Password: Admin1234!');
  console.log('');
  console.log('📧 Test users:');
  console.log('   user1@hyrox.com / User11234');
  console.log('   user2@hyrox.com / User21234');
  console.log('   ...');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

