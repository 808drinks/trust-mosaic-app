/**
 * 트러스트 모자이크 - 서류 이메일 발송 Apps Script (V2)
 * 
 * 변경사항: Google Docs 템플릿 기반 → 클라이언트 생성 PDF 기반
 * - 서류 PDF는 클라이언트에서 HTML 캔버스로 생성 후 base64로 전달
 * - 사업자등록증, 통장사본, 위탁계약서는 정적 파일로 Vercel에서 다운로드
 * 
 * 사용법:
 * 1. 이 코드를 Google Apps Script에 붙여넣기
 * 2. STATIC_FILE_BASE_URL을 실제 Vercel 도메인으로 변경
 * 3. 웹 앱으로 배포 (실행 사용자: 나, 액세스: 모든 사용자)
 */

/***** 고정 설정 *****/
const SS_ID = '1A8s8kP-PBQhRaXMl4pdbec4VMXtGzKqBPQCKcWZagL0'; 
const TZ = 'Asia/Seoul';

// ⭐ Vercel 배포 도메인 (정적 파일 다운로드용)
// TODO: 실제 도메인으로 변경하세요
const STATIC_FILE_BASE_URL = 'https://trust-official.vercel.app';

// 명함 이미지 (구글 드라이브에 유지)
const CARD_TEMPLATE_ID = '1XpcSdLDaRxDl6THy7amzqKXzRiMMnxVw';

function doPost(e) {
  try {
    const contents = e.postData ? e.postData.contents : '{}';
    const body = JSON.parse(contents);

    const organization = body.organization || '';
    const price = body.price || '';
    const price2 = body.price2 || '';
    
    const emails = [];
    if (body.email1) emails.push(body.email1);
    if (body.email2) emails.push(body.email2);
    
    const bodyText = body.body_text || '';
    const titleText = body.title_text || '트러스트 모자이크입니다. 개인정보보호 관련 서류 보내드립니다.';
    
    const sheetWrite = body.SheetWrite;
    const bizTemplate = body.BizTemplate;
    const bankAccount = body.BankAccount;
    const contractSample = body.ContractSample;
    
    // 클라이언트에서 생성한 PDF 문서들 (base64)
    const pdfDocuments = body.pdfDocuments || [];

    if (sheetWrite === 1) {
      writeToSheet(organization, price, price2, '', '', emails[0] || '');
    }

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      if (!email || !email.trim()) continue;
      
      sendEmailWithPdfs(
        organization, email, bodyText, titleText,
        pdfDocuments, bizTemplate, bankAccount, contractSample
      );
      
      Utilities.sleep(1000); 
    }

    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    Logger.log('Error in doPost: ' + err.toString());
    return ContentService.createTextOutput('ERR: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

function writeToSheet(organization, price, price2, phone, customerPhone, email) {
  const now = new Date();
  const formattedDate = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
  const sheetName = Utilities.formatDate(now, TZ, 'yyyy-MM');

  const ss = SpreadsheetApp.openById(SS_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const toNumber = v => {
    if (!v) return 0;
    const n = Number(String(v).replace(/[^\d.]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const p1 = toNumber(price);
  const p2 = toNumber(price2);
  const finalPrice = (p1 && p2) ? Math.min(p1, p2) : (p1 || p2 || 0);

  const checkCol = 3; 
  const startRow = 1;
  const maxRows = 500;
  let nextRow = startRow;
  
  for (let i = startRow; i <= startRow + maxRows; i++) {
    const cellValue = sheet.getRange(i, checkCol).getValue();
    if (cellValue === '' || cellValue === null) {
      nextRow = i;
      break;
    }
  }

  sheet.getRange(nextRow, 3).setValue(formattedDate);
  sheet.getRange(nextRow, 4).setValue(organization);
  sheet.getRange(nextRow, 10).setValue(finalPrice ? finalPrice.toLocaleString('ko-KR') : '');
  sheet.getRange(nextRow, 11).setValue(customerPhone);
  sheet.getRange(nextRow, 12).setValue(/^010/.test(String(phone)) ? '' : phone);
  sheet.getRange(nextRow, 13).setValue(/^010/.test(String(phone)) ? phone : '');
  sheet.getRange(nextRow, 14).setValue(email);
}

function sendEmailWithPdfs(
  organization, email, bodyText, titleText,
  pdfDocuments, bizTemplate, bankAccount, contractSample
) {
  try {
    const trimmedEmail = String(email).trim();
    const attachments = [];

    // 1. 클라이언트에서 생성한 PDF 문서들 (base64 → Blob)
    for (const doc of pdfDocuments) {
      const pdfBytes = Utilities.base64Decode(doc.base64);
      const blob = Utilities.newBlob(pdfBytes, 'application/pdf', doc.name);
      attachments.push(blob);
    }

    // 2. 정적 파일들 (Vercel에서 다운로드)
    if (bizTemplate === 1) {
      try {
        const response = UrlFetchApp.fetch(STATIC_FILE_BASE_URL + '/static/사업자등록증.pdf');
        const blob = response.getBlob().setName('사업자등록증 (트러스트 모자이크).pdf');
        attachments.push(blob);
      } catch (e) {
        Logger.log('사업자등록증 다운로드 실패: ' + e.toString());
      }
    }

    if (bankAccount === 1) {
      try {
        const response = UrlFetchApp.fetch(STATIC_FILE_BASE_URL + '/static/통장사본.jpg');
        const blob = response.getBlob().setName('통장사본 (트러스트 모자이크).jpg');
        attachments.push(blob);
      } catch (e) {
        Logger.log('통장사본 다운로드 실패: ' + e.toString());
      }
    }

    if (contractSample === 1) {
      try {
        const response = UrlFetchApp.fetch(STATIC_FILE_BASE_URL + '/static/위탁계약서.hwp');
        const blob = response.getBlob().setName('위탁계약서 표본 (트러스트 모자이크).hwp');
        attachments.push(blob);
      } catch (e) {
        Logger.log('위탁계약서 다운로드 실패: ' + e.toString());
      }
    }

    // 3. 명함 이미지 (기존 구글 드라이브 유지)
    const cardDoc = DriveApp.getFileById(CARD_TEMPLATE_ID);
    const cardBlob = cardDoc.getMimeType().startsWith('image/') ? cardDoc.getBlob() : cardDoc.getAs('image/png');
    cardBlob.setName('명함.png');

    // 4. HTML 메일 본문
    const htmlBody = `
      <div style="font-family:pretendard,Apple SD Gothic Neo,Malgun Gothic,arial,sans-serif;line-height:1.6;font-size:15px;color:#222;">
        ${bodyText.replace(/\n/g, '<br>')}<br><br>
        <div style="text-align:center;margin-top:25px;">
          <img src="cid:card" alt="명함" style="width:600px;border-radius:8px;box-shadow:0 0 4px rgba(0,0,0,0.2);">
        </div>
      </div>
    `;

    // 5. 이메일 발송
    GmailApp.sendEmail(trimmedEmail, titleText, '', {
      htmlBody: htmlBody,
      attachments: attachments,
      inlineImages: { card: cardBlob },
      name: '트러스트 모자이크',
      from: 'trustmozaik@trustmozaik-official.kr'
    });

    Logger.log('이메일 발송 완료: ' + trimmedEmail + ' (첨부 ' + attachments.length + '개)');

  } catch (err) {
    Logger.log('이메일 발송 에러: ' + err.toString());
    throw err;
  }
}
