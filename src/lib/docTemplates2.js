import { BASE_STYLE } from './docTemplates1';

// 3. 견적서
export function estimateHTML({ organization, date, price, priceKorean, spec, stampDataUrl }) {
  const fmtPrice = price ? parseInt(String(price).replace(/[^\d]/g, '')).toLocaleString('ko-KR') : '';
  return `<div style="${BASE_STYLE};padding:40px 50px;">
    <h1 style="text-align:center;font-size:32px;letter-spacing:20px;margin-bottom:20px;color:#000;">견 적 서</h1>

    <table style="width:100%;border-collapse:collapse;border:2px solid #4a7c59;font-size:13px;">
      <tr>
        <td style="border:1px solid #4a7c59;padding:8px 12px;width:50%;text-align:center;" colspan="2">견 적 일 : ${date}</td>
        <td style="border:1px solid #4a7c59;padding:8px;width:10%;" rowspan="5">공<br/>급<br/>자</td>
        <td style="border:1px solid #4a7c59;padding:8px;width:15%;">등록번호</td>
        <td style="border:1px solid #4a7c59;padding:8px;width:25%;">161-05-02119</td>
      </tr>
      <tr>
        <td style="border:1px solid #4a7c59;padding:8px 12px;text-align:center;" colspan="2">${organization}<br/>요청인 귀하</td>
        <td style="border:1px solid #4a7c59;padding:8px;">상호</td>
        <td style="border:1px solid #4a7c59;padding:8px;position:relative;">트러스트 모자이크<img src="${stampDataUrl}" style="height:60px;position:absolute;top:-5px;right:5px;"/></td>
      </tr>
      <tr>
        <td style="border:1px solid #4a7c59;padding:8px 12px;text-align:center;" colspan="2">건 명 : CCTV 영상 모자이크 편집 수수료</td>
        <td style="border:1px solid #4a7c59;padding:8px;">대표자</td>
        <td style="border:1px solid #4a7c59;padding:8px;">정연화</td>
      </tr>
      <tr>
        <td style="border:1px solid #4a7c59;padding:8px 12px;text-align:center;" colspan="2">${priceKorean}</td>
        <td style="border:1px solid #4a7c59;padding:8px;">전화번호</td>
        <td style="border:1px solid #4a7c59;padding:8px;">010-2379-2759</td>
      </tr>
      <tr>
        <td style="border:1px solid #4a7c59;padding:8px 12px;text-align:center;" colspan="2">아래 견적은 견적일로부터 7일동안 유효함</td>
        <td style="border:1px solid #4a7c59;padding:8px;">이메일</td>
        <td style="border:1px solid #4a7c59;padding:8px;font-size:11px;">trustmozaik@<br/>trustmozaik-official.kr</td>
      </tr>
    </table>

    <table style="width:100%;border-collapse:collapse;border:2px solid #4a7c59;font-size:13px;margin-top:12px;">
      <thead>
        <tr style="background:#e8f0e8;">
          <th style="border:1px solid #4a7c59;padding:8px;width:8%;">연번</th>
          <th style="border:1px solid #4a7c59;padding:8px;width:25%;">품 명</th>
          <th style="border:1px solid #4a7c59;padding:8px;width:17%;">규 격</th>
          <th style="border:1px solid #4a7c59;padding:8px;width:10%;">단 위</th>
          <th style="border:1px solid #4a7c59;padding:8px;width:10%;">수 량</th>
          <th style="border:1px solid #4a7c59;padding:8px;width:15%;">단 가</th>
          <th style="border:1px solid #4a7c59;padding:8px;width:15%;">금 액</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border:1px solid #4a7c59;padding:8px;text-align:center;">1</td>
          <td style="border:1px solid #4a7c59;padding:8px;text-align:center;">CCTV 영상 모자이크<br/>편집 수수료</td>
          <td style="border:1px solid #4a7c59;padding:8px;text-align:center;">${spec}</td>
          <td style="border:1px solid #4a7c59;padding:8px;text-align:center;">EA</td>
          <td style="border:1px solid #4a7c59;padding:8px;text-align:center;">1</td>
          <td style="border:1px solid #4a7c59;padding:8px;text-align:right;">${fmtPrice}</td>
          <td style="border:1px solid #4a7c59;padding:8px;text-align:right;">${fmtPrice}</td>
        </tr>
        ${Array(8).fill('<tr>' + Array(7).fill('<td style="border:1px solid #4a7c59;padding:8px;">&nbsp;</td>').join('') + '</tr>').join('')}
      </tbody>
      <tfoot>
        <tr style="background:#e8f0e8;">
          <td style="border:1px solid #4a7c59;padding:10px;text-align:center;font-weight:bold;letter-spacing:8px;" colspan="5">합 계 (부가세 포함)</td>
          <td style="border:1px solid #4a7c59;padding:10px;text-align:right;font-weight:bold;" colspan="2">${fmtPrice}</td>
        </tr>
      </tfoot>
    </table>

    <p style="font-size:13px;margin-top:8px;text-align:center;color:#333;">
      계좌 이체 시 계좌번호 : 카카오 3333-21-2104308 (예금주 : 정연화)
    </p>
  </div>`;
}
