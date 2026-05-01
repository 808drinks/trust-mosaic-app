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

    // Build payload for Apps Script (V1: Google Docs template approach)
    const payload = {
      organization: body.organization,
      email1: body.email1,
      email2: body.email2,
      title_text: body.title_text,
      body_text: body.body_text,
      SheetWrite: body.SheetWrite,
      price: body.price,
      price2: body.price2,
      // Static file flags
      BizTemplate: body.BizTemplate,
      BankAccount: body.BankAccount,
      ContractSample: body.ContractSample,
      // Document generation flags (for Google Docs templates)
      privacy_document: body.privacy_document,
      estimate_document: body.estimate_document,
      estimate_document2: body.estimate_document2,
      consent_document: body.consent_document,
      security_agreement_document: body.security_agreement_document,
      cooperation_letter_document: body.cooperation_letter_document,
      destruction_confirm_document: body.destruction_confirm_document,
      // Additional info for template substitution
      price_korean: body.price_korean,
      product_spec: body.product_spec,
      price_korean2: body.price_korean2,
      product_spec2: body.product_spec2,
      doc_number: body.doc_number,
      video_datetime_location: body.video_datetime_location,
      video_content: body.video_content,
      disposal_date: body.disposal_date,
    };
    
    const payloadStr = JSON.stringify(payload);
    console.log(`[send] Webhook: ${webhookUrl}, payload: ${(payloadStr.length / 1024).toFixed(1)}KB`);
    
    // Forward to Google Apps Script
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payloadStr,
      redirect: 'follow',
    });
    
    const responseText = await response.text();
    console.log(`[send] Response: ${response.status} - ${responseText.substring(0, 300)}`);
    
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

