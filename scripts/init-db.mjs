import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function initDb() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔄 Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS saved_messages (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      mail_subject VARCHAR(500) DEFAULT '',
      mail_body TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ saved_messages table created');

  await sql`
    CREATE TABLE IF NOT EXISTS webhook_settings (
      id SERIAL PRIMARY KEY,
      webhook_url TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ webhook_settings table created');

  await sql`
    CREATE TABLE IF NOT EXISTS saved_specs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(100) NOT NULL,
      spec_value VARCHAR(500) NOT NULL,
      price INTEGER DEFAULT 0,
      price_korean VARCHAR(100) DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log('✅ saved_specs table created');

  // Insert sample data if tables are empty
  const msgCount = await sql`SELECT COUNT(*) as cnt FROM saved_messages`;
  if (parseInt(msgCount[0].cnt) === 0) {
    await sql`
      INSERT INTO saved_messages (title, mail_subject, mail_body) VALUES
      ('일반 안내', '트러스트 모자이크입니다. 개인정보 관련 서류 및 견적서 보내드립니다.', '트러스트 모자이크 입니다.\n\n개인정보 관련 서류 보내드립니다.\n\n* ''보안서약서'' → 기관 측에서 보관하시면 됩니다\n* ''개인정보처리동의서'' → 제외인물 서명후 기관에서 보관해 주시면 됩니다.\n* ''보안확약서'' → 기관 측에서 보관하시면 됩니다\n\n서명 받으신 뒤 저희에게도 스캔 또는 촬영하여 보내주시면 감사드리겠습니다. ^^\n\n계좌 이체 시 계좌번호 : 카카오 3333-21-2104308 (예금주 : 정연화), 현금영수증 신청시 사업자번호 또는 핸드폰 번호 알려주시면 됩니다.\n\n홈페이지 결제시 트러스트 모자이크 홈페이지 하단에서 카드결제 ISP 로 진행해주시면 됩니다.\n홈페이지 링크 (링크 : https://trustmozaik.kr/)\n\n* ''공문서'' → 기관 측에서 보관하시면 됩니다\n* ''파기 확인서'' → 기관 측에서 보관하시면 됩니다\n\n추가적으로 필요한 서류나 문의사항이 있으실 경우 010-3904-5597로 연락주시면 안내드리겠습니다 ^^ (보안확약서, 위탁계약서 등)'),
      ('특정인 제외', '트러스트 모자이크입니다. 개인정보보호 관련 서류 보내드립니다.', '트러스트 모자이크 입니다.\n\n개인정보 관련 서류 보내드립니다.\n\n* ''보안서약서'' → 기관 측에서 보관하시면 됩니다\n* ''개인정보처리동의서'' → 제외인물 서명후 기관에서 보관해 주시면 됩니다.\n* ''보안확약서'' → 기관 측에서 보관하시면 됩니다\n\n서명 받으신 뒤 저희에게도 스캔 또는 촬영하여 보내주시면 감사드리겠습니다. ^^'),
      ('정보공개청구', '트러스트 모자이크입니다. 개인정보보호 관련 서류 보내드립니다.', '트러스트 모자이크 입니다.\n\n개인정보 관련 서류 보내드립니다.\n\n감사합니다.')
    `;
    console.log('✅ Sample messages inserted');
  }

  console.log('🎉 Database initialization complete!');
}

initDb().catch(console.error);
