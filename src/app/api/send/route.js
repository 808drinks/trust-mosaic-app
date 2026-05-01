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
    const payload = {
      organization: body.organization,
      email1: body.email1,
      email2: body.email2,
      title_text: body.title_text,
      body_text: body.body_text,
      SheetWrite: body.SheetWrite,
      price: body.price,
      price2: body.price2,
      pdfDocuments: body.pdfDocuments || [],
      BizTemplate: body.BizTemplate,
      BankAccount: body.BankAccount,
      ContractSample: body.ContractSample,
    };
    
    const payloadStr = JSON.stringify(payload);
    const payloadSizeMB = (payloadStr.length / (1024 * 1024)).toFixed(2);
    console.log(`[send] Webhook URL: ${webhookUrl}`);
    console.log(`[send] Payload size: ${payloadSizeMB} MB, PDF count: ${payload.pdfDocuments.length}`);
    
    // Forward to Google Apps Script
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadStr,
      redirect: 'follow',
    });
    
    const responseText = await response.text();
    console.log(`[send] Apps Script response status: ${response.status}, body: ${responseText.substring(0, 500)}`);
    
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
      return NextResponse.json({ error: `서류 전송 실패 (HTTP ${response.status}): ${responseText.substring(0, 300)}` }, { status: 500 });
    }
  } catch (error) {
    console.error('[send] Error:', error);
    return NextResponse.json({ error: `서류 전송 중 오류 발생: ${error.message}` }, { status: 500 });
  }
}

