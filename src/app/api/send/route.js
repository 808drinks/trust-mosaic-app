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

    // Build payload for Apps Script
    // PDF documents are now generated client-side and sent as base64
    const payload = {
      organization: body.organization,
      email1: body.email1,
      email2: body.email2,
      title_text: body.title_text,
      body_text: body.body_text,
      SheetWrite: body.SheetWrite,
      price: body.price,
      price2: body.price2,
      // Pre-generated PDF documents (base64)
      pdfDocuments: body.pdfDocuments || [],
      // Static file flags (these are fetched by Apps Script from URLs)
      BizTemplate: body.BizTemplate,
      BankAccount: body.BankAccount,
      ContractSample: body.ContractSample,
    };
    
    // Forward to Google Apps Script
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const responseText = await response.text();
    
    let isSuccess = false;
    if (responseText === 'OK') {
      isSuccess = true;
    } else {
      try {
        const parsed = JSON.parse(responseText);
        if (parsed.status === 'success' || parsed.result === 'success') {
          isSuccess = true;
        }
      } catch (e) {
        if (response.ok) isSuccess = true;
      }
    }

    if (isSuccess) {
      return NextResponse.json({ success: true, message: '서류 생성 및 전송 완료!' });
    } else {
      return NextResponse.json({ error: `서류 전송 실패: ${responseText}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending documents:', error);
    return NextResponse.json({ error: `서류 전송 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}
