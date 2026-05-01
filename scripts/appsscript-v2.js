/**
 * 트러스트 모자이크 - 서류 이메일 발송 Apps Script (V2)
 * 
 * 변경사항: Google Docs 템플릿 기반 → 클라이언트 생성 PDF 기반
 * - 서류 PDF는 클라이언트에서 HTML 캔버스로 생성 후 base64로 전달
 * - 사업자등록증, 통장사본, 위탁계약서, 명함은 Vercel 정적 파일에서 다운로드
 * 
 * 사용법:
 * 1. 이 코드를 Google Apps Script에 붙여넣기
 * 2. STATIC_FILE_BASE_URL을 실제 Vercel 도메인으로 변경
 * 3. 웹 앱으로 배포 (실행 사용자: 나, 액세스: 모든 사용자)
 */

/***** 고정 설정 *****/
var SS_ID = '1A8s8kP-PBQhRaXMl4pdbec4VMXtGzKqBPQCKcWZagL0'; 
var TZ = 'Asia/Seoul';

// ⭐ Vercel 배포 도메인 (정적 파일 다운로드용)
// TODO: 실제 도메인으로 변경하세요
var STATIC_FILE_BASE_URL = 'https://trust-official.vercel.app';

function doPost(e) {
  try {
    var contents = e.postData ? e.postData.contents : '{}';
    var body = JSON.parse(contents);

    var organization = body.organization || '';
    var price = body.price || '';
    var price2 = body.price2 || '';
    
    var emails = [];
    if (body.email1) emails.push(body.email1);
    if (body.email2) emails.push(body.email2);
    
    var bodyText = body.body_text || '';
    var titleText = body.title_text || '트러스트 모자이크입니다. 개인정보보호 관련 서류 보내드립니다.';
    
    var sheetWrite = body.SheetWrite;
    var bizTemplate = body.BizTemplate;
    var bankAccount = body.BankAccount;
    var contractSample = body.ContractSample;
    
    // 클라이언트에서 생성한 PDF 문서들 (base64)
    var pdfDocuments = body.pdfDocuments || [];

    if (sheetWrite === 1) {
      writeToSheet(organization, price, price2, '', '', emails[0] || '');
    }

    for (var i = 0; i < emails.length; i++) {
      var email = emails[i];
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
  var now = new Date();
  var formattedDate = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
  var sheetName = Utilities.formatDate(now, TZ, 'yyyy-MM');

  var ss = SpreadsheetApp.openById(SS_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  var toNumber = function(v) {
    if (!v) return 0;
    var n = Number(String(v).replace(/[^\d.]/g, ''));
    return isNaN(n) ? 0 : n;
  };

  var p1 = toNumber(price);
  var p2 = toNumber(price2);
  var finalPrice = (p1 && p2) ? Math.min(p1, p2) : (p1 || p2 || 0);

  var checkCol = 3; 
  var startRow = 1;
  var maxRows = 500;
  var nextRow = startRow;
  
  for (var i = startRow; i <= startRow + maxRows; i++) {
    var cellValue = sheet.getRange(i, checkCol).getValue();
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
    var trimmedEmail = String(email).trim();
    var attachments = [];

    // ==========================================
    // 1. 클라이언트에서 생성한 PDF 문서들 (base64 → Blob)
    // ==========================================
    for (var i = 0; i < pdfDocuments.length; i++) {
      var doc = pdfDocuments[i];
      var pdfBytes = Utilities.base64Decode(doc.base64);
      var blob = Utilities.newBlob(pdfBytes, 'application/pdf', doc.name);
      attachments.push(blob);
    }

    // ==========================================
    // 2. 정적 파일들 (Vercel 서버에서 다운로드)
    // ==========================================
    if (bizTemplate === 1) {
      try {
        var bizResponse = UrlFetchApp.fetch(STATIC_FILE_BASE_URL + '/static/사업자등록증.pdf');
        var bizBlob = bizResponse.getBlob().setName('사업자등록증 (트러스트 모자이크).pdf');
        attachments.push(bizBlob);
      } catch (e) {
        Logger.log('사업자등록증 다운로드 실패: ' + e.toString());
      }
    }

    if (bankAccount === 1) {
      try {
        var bankResponse = UrlFetchApp.fetch(STATIC_FILE_BASE_URL + '/static/통장사본.jpg');
        var bankBlob = bankResponse.getBlob().setName('통장사본 (트러스트 모자이크).jpg');
        attachments.push(bankBlob);
      } catch (e) {
        Logger.log('통장사본 다운로드 실패: ' + e.toString());
      }
    }

    if (contractSample === 1) {
      try {
        var contractResponse = UrlFetchApp.fetch(STATIC_FILE_BASE_URL + '/static/위탁계약서.hwp');
        var contractBlob = contractResponse.getBlob().setName('위탁계약서 표본 (트러스트 모자이크).hwp');
        attachments.push(contractBlob);
      } catch (e) {
        Logger.log('위탁계약서 다운로드 실패: ' + e.toString());
      }
    }

    // ==========================================
    // 3. 명함 이미지 (Vercel 정적 파일 → 메일 본문 인라인)
    // ==========================================
    var cardBlob;
    try {
      var cardResponse = UrlFetchApp.fetch(STATIC_FILE_BASE_URL + '/static/명함.png');
      cardBlob = cardResponse.getBlob().setName('명함.png');
    } catch (e) {
      Logger.log('명함 다운로드 실패: ' + e.toString());
      cardBlob = null;
    }

    // ==========================================
    // 4. HTML 메일 본문 (명함 인라인 표시)
    // ==========================================
    var cardImgTag = cardBlob 
      ? '<img src="cid:card" alt="명함" style="width:600px;border-radius:8px;box-shadow:0 0 4px rgba(0,0,0,0.2);">' 
      : '';

    var htmlBody = '<div style="font-family:pretendard,Apple SD Gothic Neo,Malgun Gothic,arial,sans-serif;line-height:1.6;font-size:15px;color:#222;">'
      + bodyText.replace(/\n/g, '<br>') + '<br><br>'
      + '<div style="text-align:center;margin-top:25px;">'
      + cardImgTag
      + '</div></div>';

    // ==========================================
    // 5. 이메일 발송
    // ==========================================
    var emailOptions = {
      htmlBody: htmlBody,
      attachments: attachments,
      name: '트러스트 모자이크',
      from: 'trustmozaik@trustmozaik-official.kr'
    };

    // 명함이 있으면 인라인 이미지로 추가
    if (cardBlob) {
      emailOptions.inlineImages = { card: cardBlob };
    }

    GmailApp.sendEmail(trimmedEmail, titleText, '', emailOptions);

    Logger.log('이메일 발송 완료: ' + trimmedEmail + ' (첨부 ' + attachments.length + '개)');

  } catch (err) {
    Logger.log('이메일 발송 에러: ' + err.toString());
    throw err;
  }
}
