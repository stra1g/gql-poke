import { execSync } from 'node:child_process';

export default async function globalSetup() {
  console.log('Running migrations before all tests...');
  execSync('dotenv -e .env.test -- prisma migrate deploy', {
    stdio: 'inherit',
  });
  execSync('dotenv -e .env.test -- prisma db seed', {
    stdio: 'inherit',
  });
}
