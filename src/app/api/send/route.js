import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const sql = getDb();
    const body = await request.json();
    
    // Get active webhook URL
    const webhookSettings = await sql`SELECT * FROM webhook_settings WHERE is_active = true ORDER BY updated_at DESC LIMIT 1`;
    
    if (!webhookSettings || webhookSettings.length === 0) {
      return NextResponse.json({ error: '웹훅 URL이 설정되지 않았습니다. 먼저 웹훅 URL을 설정해주세요.' }, { status: 400 });
    }
    
    const webhookUrl = webhookSettings[0].webhook_url;
    
    // Forward the request to Google Apps Script
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const responseText = await response.text();
    
    if (responseText === 'OK') {
      return NextResponse.json({ success: true, message: '서류 생성 및 전송 완료!' });
    } else {
      return NextResponse.json({ error: `서류 전송 실패: ${responseText}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending documents:', error);
    return NextResponse.json({ error: `서류 전송 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}
