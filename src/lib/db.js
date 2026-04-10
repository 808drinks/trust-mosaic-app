import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    try {
      require('dotenv').config({ path: '.env.local' });
    } catch (e) {}
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 설정이 없습니다. .env.local 파일을 확인하거나 Vercel 환경 변수를 설정해주세요.');
  }

  const sql = neon(process.env.DATABASE_URL);
  return sql;
}
