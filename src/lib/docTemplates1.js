// 공통 A4 문서 스타일
export const BASE_STYLE = `
  font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
  font-size: 15px;
  line-height: 1.8;
  color: #000;
  padding: 60px 65px;
  box-sizing: border-box;
  word-break: keep-all;
`;

// 1. 보안확약서
export function securityPledgeHTML({ organization, date, signDataUrl }) {
  return `<div style="${BASE_STYLE}">
    <h1 style="text-align:center;font-size:28px;margin-bottom:0;letter-spacing:12px;text-decoration:underline;text-underline-offset:6px;">보 안 확 약 서</h1>
    <p style="text-align:center;font-size:14px;color:#555;margin-top:4px;">(작업자 및 대표자용)</p>

    <div style="margin-top:40px;font-size:15px;line-height:2;">
      <p>본인은 귀 기관에서 수행하는 <b style="text-decoration:underline;">CCTV 영상 모자이크</b>의 수행을 완료함에 있어,</p>
      <p>다음 각 호의 보안사항에 대한 준수 책임이 있음을 서약하며 이에 확약서를</p>
      <p>제출합니다.</p>
    </div>

    <div style="margin-top:30px;padding-left:20px;font-size:15px;line-height:2.2;">
      <p><b>1.</b>&nbsp; 본인은 업무 수행함에 있어 취급하는 모든 개인정보 자료 (원본 및 사본)</p>
      <p style="padding-left:16px;">반납 및 파기하여, 취득한 정보에 대한 유출을 절대 금지하겠습니다.</p>
      <br/>
      <p><b>2.</b>&nbsp; 본인은 상기 보안사항을 위반할 경우에 관련 법규(개인정보보호법등)에</p>
      <p style="padding-left:16px;">따른 모든 조치와 손해배상을 감수하겠습니다.</p>
    </div>

    <p style="text-align:center;margin-top:60px;font-size:16px;font-weight:bold;">{{날짜}}</p>

    <div style="margin-top:50px;padding-left:120px;font-size:15px;line-height:2.4;position:relative;">
      <table style="border:none;border-collapse:collapse;">
        <tr><td style="width:100px;letter-spacing:8px;padding:2px 0;">업 체 명</td><td style="padding:2px 8px;">: 트러스트 모자이크</td></tr>
        <tr>
          <td style="letter-spacing:0;padding:2px 0;">서 약 자</td>
          <td style="padding:2px 8px;">
            <span style="letter-spacing:4px;">생 년 월 일</span> : 630925
          </td>
        </tr>
        <tr><td></td><td style="padding:2px 8px;"><span style="letter-spacing:12px;">직</span><span style="letter-spacing:4px;">위</span> : 대표 및 작업자</td></tr>
        <tr><td></td><td style="padding:2px 8px;position:relative;"><span style="letter-spacing:12px;">성</span><span style="letter-spacing:4px;">명</span> : 정연화(인)<img src="${signDataUrl}" style="height:50px;position:absolute;top:-10px;left:140px;opacity:0.9;" /></td></tr>
      </table>
    </div>

    <div style="text-align:center;margin-top:50px;">
      <p style="font-size:22px;font-weight:bold;color:#d00;">{{기관명}} 귀하</p>
    </div>
  </div>`.replace('{{날짜}}', date).replace('{{기관명}}', organization);
}

// 2. 개인정보 취급자 개인정보보호 서약서
export function privacyConsentHTML({ organization, date, stampDataUrl }) {
  return `<div style="${BASE_STYLE}">
    <h1 style="text-align:center;font-size:24px;margin-bottom:30px;text-decoration:underline;text-underline-offset:6px;">개인정보 취급자 개인정보보호 서약서</h1>

    <p style="font-size:15px;line-height:2;margin-bottom:20px;">
      트러스트 모자이크는 <b style="text-decoration:underline;">{{기관명}} CCTV 영상</b> 의 개인정보취급자로써 개인정보보호를 위하여
      다음사항을 준수할 것을 엄숙히 서약합니다.
    </p>

    <ol style="padding-left:24px;font-size:14px;line-height:2.2;margin-top:10px;">
      <li>업무상 제공받은 개인정보를 허가없이 제3자 제공하거나 수집목적외로 이용하지 않는다</li>
      <li>명백히 허가 받지 않은 개인정보를 이용하지 않으며, 업무를 수행할 때에는 기관에서 지정되고 허가된 자료만을 이용한다.</li>
      <li>업무와 관련한 개인정보의 수집, 생성, 기록, 저장, 보유, 가공, 편집, 검색, 출력, 정정, 복구, 이용, 제공, 공개, 파기 및 그 밖에 이와 유사한 일체의 행위에 대하여 기관의 규정과 통제절차를 준수할 것이다.</li>
      <li>본인에게 할당된 개인정보(영상파일등)에 대한 정보를 타인에게 누출하거나 누설하지 않는다.</li>
      <li>기관으로부터 제공받은 개인정보자산(서류, 사진, 영상, 전자파일 등)을 무단변조, 복사, 훼손 등으로 부터 안전하게 관리한다</li>
      <li>기관에서 제공받은 모든 정보자산(전자메일 발송분 포함)을 용역 수행완료일 기준 7일뒤 모두 파기할 것이다</li>
    </ol>

    <p style="font-size:14px;line-height:2;margin-top:16px;">
      상기 사항을 숙지하고 이를 성실히 준수할을 동의하며 서약서의 보안사항을 위반하였을
      경우에는 <b>"개인정보보호법", "정보통신망이용촉진 및 정보보호 등에 관한 법률"</b> 등 관련법령에
      책임 이외에도, 기관내 관련 규정에 따른 징계조치 등 어떠한 불이익도 감수할 것이며 기관에
      끼친 손해에 대해 지체 없이 변상/복구할 것을 서약합니다.
    </p>

    <p style="text-align:center;margin-top:30px;font-size:16px;font-weight:bold;">{{날짜}}</p>

    <div style="margin-top:30px;padding-left:200px;font-size:15px;line-height:2.4;position:relative;">
      <p>소 속 : 트러스트 모자이크</p>
      <p style="position:relative;">직 급 : 개인정보보호 담당
        <img src="${stampDataUrl}" style="height:80px;position:absolute;top:-20px;left:180px;" />
      </p>
      <p>성 명 : 정연화 (인)</p>
    </div>
  </div>`.replaceAll('{{기관명}}', organization).replaceAll('{{날짜}}', date);
}
