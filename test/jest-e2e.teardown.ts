import { execSync } from 'node:child_process';

export default async function globalTeardown() {
  console.log('Rolling back migrations after all tests...');
  execSync('dotenv -e .env.test -- prisma migrate reset --force', {
    stdio: 'inherit',
  });
}
