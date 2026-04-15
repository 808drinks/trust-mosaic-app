import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL 설정이 없습니다. Vercel 프로젝트 설정의 Environment Variables에 DATABASE_URL을 추가한 후 다시 배포해주세요.');
  }

  const sql = neon(process.env.DATABASE_URL);
  return sql;
}
