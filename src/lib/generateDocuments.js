import { preloadImage, htmlToPdfBase64, formatDate } from './pdfHelper';
import { securityPledgeHTML, privacyConsentHTML } from './docTemplates1';
import { estimateHTML } from './docTemplates2';
import { cooperationLetterHTML, destructionConfirmHTML } from './docTemplates3';

let cachedSign = null;
let cachedStamp = null;

async function getImages() {
  if (!cachedSign) cachedSign = await preloadImage('/sign.png');
  if (!cachedStamp) cachedStamp = await preloadImage('/stamp.png');
  return { signDataUrl: cachedSign, stampDataUrl: cachedStamp };
}

// Generate all selected document PDFs, returns array of { name, base64 }
export async function generateSelectedPdfs(selectedDocs, docFields, organization) {
  const { signDataUrl, stampDataUrl } = await getImages();
  const date = formatDate(new Date());
  const results = [];

  // 1. 보안서약서 (security_agreement_document in old code = 보안확약서)
  if (selectedDocs.security_agreement_document) {
    const html = securityPledgeHTML({ organization, date, signDataUrl });
    const base64 = await htmlToPdfBase64(html);
    results.push({ name: `보안확약서_${organization}_${date}.pdf`, base64 });
  }

  // 2. 개인정보처리동의서 (privacy_document = 보안서약서/개인정보보호서약서)
  if (selectedDocs.privacy_document) {
    const html = privacyConsentHTML({ organization, date, stampDataUrl });
    const base64 = await htmlToPdfBase64(html);
    results.push({ name: `보안서약서_${organization}_${date}.pdf`, base64 });
  }

  // 3. 개인정보처리동의서
  if (selectedDocs.consent_document) {
    const html = privacyConsentHTML({ organization, date, stampDataUrl });
    const base64 = await htmlToPdfBase64(html);
    results.push({ name: `개인정보처리동의서_${organization}_${date}.pdf`, base64 });
  }

  // 4. 견적서
  if (selectedDocs.estimate_document) {
    const est = docFields.estimate_document || {};
    const html = estimateHTML({
      organization, date, stampDataUrl,
      price: est.price, priceKorean: est.price_korean || '',
      spec: est.product_spec || '',
    });
    const base64 = await htmlToPdfBase64(html);
    results.push({ name: `견적서_${organization}_${date}.pdf`, base64 });
  }

  // 5. 견적서2
  if (selectedDocs.estimate_document2) {
    const est2 = docFields.estimate_document2 || {};
    const html = estimateHTML({
      organization, date, stampDataUrl,
      price: est2.price2, priceKorean: est2.price_korean2 || '',
      spec: est2.product_spec2 || '',
    });
    const base64 = await htmlToPdfBase64(html);
    results.push({ name: `견적서2_${organization}_${date}.pdf`, base64 });
  }

  // 6. 협조공문
  if (selectedDocs.cooperation_letter_document) {
    const coop = docFields.cooperation_letter_document || {};
    const html = cooperationLetterHTML({
      organization, date, stampDataUrl,
      docNumber: coop.doc_number || '',
      videoInfo: coop.video_datetime_location || '',
      videoContent: coop.video_content || '',
    });
    const base64 = await htmlToPdfBase64(html);
    results.push({ name: `협조공문_${organization}_${date}.pdf`, base64 });
  }

  // 7. 개인정보 파기확인서
  if (selectedDocs.destruction_confirm_document) {
    const dest = docFields.destruction_confirm_document || {};
    const html = destructionConfirmHTML({
      organization, date, stampDataUrl, signDataUrl,
      disposalDate: dest.disposal_date || '',
    });
    const base64 = await htmlToPdfBase64(html);
    results.push({ name: `개인정보파기확인서_${organization}_${date}.pdf`, base64 });
  }

  return results;
}
