import { execSync } from 'node:child_process';

export default async function globalSetup() {
  console.log('Running migrations before all tests...');
  execSync('prisma migrate reset --force', {
    stdio: 'inherit',
  });
  execSync('prisma db seed', {
    stdio: 'inherit',
  });
}
