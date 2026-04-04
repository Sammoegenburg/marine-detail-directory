// Run from project root: node wipe.js
const path = require('path');
process.chdir(path.resolve(__dirname));

const { PrismaClient } = require(path.resolve(__dirname, 'src/generated/prisma/client'));
const { Pool } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');

const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_I3hKLrXC8GeS@ep-spring-frog-am33h5rv-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require' });
const adapter = new PrismaNeon(pool);
const p = new PrismaClient({ adapter });

(async () => {
  try {
    const admin = await p.user.findFirst({ where: { role: 'ADMIN' } });
    console.log('Admin kept:', admin?.email);

    const users = await p.user.findMany({ where: { role: { not: 'ADMIN' } }, select: { id: true, email: true } });
    const ids = users.map(u => u.id);
    console.log('Non-admin users to delete:', ids.length);

    if (ids.length > 0) {
      await p.session.deleteMany({ where: { userId: { in: ids } } });
      await p.account.deleteMany({ where: { userId: { in: ids } } });
      await p.company.updateMany({ where: { userId: { in: ids } }, data: { userId: null, status: 'UNCLAIMED' } });
      await p.claimRequest.deleteMany({ where: { userId: { in: ids } } });
      await p.user.deleteMany({ where: { id: { in: ids } } });
      console.log('Deleted', ids.length, 'users');
    }

    const lp = await p.leadPurchase.deleteMany({});
    console.log('Deleted', lp.count, 'lead purchases');
    const ld = await p.lead.deleteMany({});
    console.log('Deleted', ld.count, 'leads');

    const remaining = await p.user.count();
    const companies = await p.company.count();
    console.log('\nFresh start complete.');
    console.log('Remaining users:', remaining);
    console.log('Companies in DB:', companies);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await p.$disconnect();
    process.exit(0);
  }
})();
