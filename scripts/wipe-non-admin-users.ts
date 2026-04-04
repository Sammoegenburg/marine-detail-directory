// Wipe all non-admin users and their companies from the database
// Keeps only the admin account (samuelmoegenburg@gmail.com)
import { PrismaClient } from '../src/generated/prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function wipe() {
  // Find admin user
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  console.log(`Admin user: ${admin?.email} (${admin?.id})`);

  // Find all non-admin users
  const nonAdminUsers = await prisma.user.findMany({
    where: { role: { not: 'ADMIN' } },
    select: { id: true, email: true }
  });
  console.log(`Found ${nonAdminUsers.length} non-admin users to delete`);

  if (nonAdminUsers.length === 0) {
    console.log('No non-admin users to delete');
    await prisma.$disconnect();
    return;
  }

  const userIds = nonAdminUsers.map(u => u.id);

  // Delete related records
  console.log('Deleting sessions...');
  await prisma.session.deleteMany({ where: { userId: { in: userIds } } });

  console.log('Deleting accounts...');
  await prisma.account.deleteMany({ where: { userId: { in: userIds } } });

  // Unlink companies from these users (don't delete companies - they're from Google Places import)
  console.log('Unlinking companies from non-admin users...');
  await prisma.company.updateMany({
    where: { userId: { in: userIds } },
    data: { userId: null, status: 'UNCLAIMED' }
  });

  // Delete claim requests from these users
  console.log('Deleting claim requests...');
  await prisma.claimRequest.deleteMany({ where: { userId: { in: userIds } } });

  // Delete the users
  console.log('Deleting non-admin users...');
  const result = await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  console.log(`Deleted ${result.count} non-admin users`);

  // Also delete any leads (fresh start)
  console.log('Deleting all lead purchases...');
  await prisma.leadPurchase.deleteMany({});
  console.log('Deleting all leads...');
  await prisma.lead.deleteMany({});

  const remainingUsers = await prisma.user.count();
  const remainingCompanies = await prisma.company.count();
  console.log(`\nRemaining: ${remainingUsers} users, ${remainingCompanies} companies`);

  await prisma.$disconnect();
}

wipe().catch(console.error);
