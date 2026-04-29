import { BASE_STYLE } from './docTemplates1';

// 4. 협조공문
export function cooperationLetterHTML({ organization, date, docNumber, videoInfo, videoContent, stampDataUrl }) {
  return `<div style="${BASE_STYLE};padding:40px 55px;">
    <div style="text-align:center;margin-bottom:4px;">
      <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#3b6db5;margin-right:8px;vertical-align:middle;"></span>
      <span style="font-size:22px;font-weight:bold;vertical-align:middle;">트러스트 모자이크</span>
    </div>
    <p style="text-align:center;font-size:12px;color:#555;margin:0 0 20px;">
      경기도 용인시 강남서로 52 / 010-3904-5597 / trustmozaik@trustmozaik-official.KR
    </p>

    <div style="display:flex;justify-content:space-between;font-size:13px;line-height:2.2;">
      <div style="flex:1;">
        <p>문서번호 : ${docNumber}</p>
        <p>발행일자 : ${date}</p>
        <p>수&nbsp;&nbsp;&nbsp;&nbsp;신 : ${organization}</p>
        <p>참&nbsp;&nbsp;&nbsp;&nbsp;조 : -</p>
        <p>제&nbsp;&nbsp;&nbsp;목 : CCTV 영상 모자이크 관련 자료송부 협조요청</p>
      </div>
      <div style="width:160px;margin-left:20px;">
        <table style="border-collapse:collapse;width:100%;font-size:12px;">
          <tr><td style="border:1px solid #999;padding:6px 10px;text-align:center;">접수일자</td><td style="border:1px solid #999;padding:6px 20px;"></td></tr>
          <tr><td style="border:1px solid #999;padding:6px 10px;text-align:center;">접수번호</td><td style="border:1px solid #999;padding:6px 20px;"></td></tr>
          <tr><td style="border:1px solid #999;padding:6px 10px;text-align:center;">처 리 자</td><td style="border:1px solid #999;padding:6px 20px;"></td></tr>
          <tr><td style="border:1px solid #999;padding:6px 10px;text-align:center;">담당부서</td><td style="border:1px solid #999;padding:6px 20px;"></td></tr>
        </table>
      </div>
    </div>

    <div style="margin-top:25px;font-size:14px;line-height:2;">
      <p style="padding-left:20px;">1. 귀 기관의 무궁한 발전을 기원합니다.</p>
      <p style="padding-left:20px;">2. 귀 기관 민원인 관련 CCTV 영상자료를</p>
      <p style="padding-left:30px;">아래와 같이 요청하오니 협조하여 주시면 감사하겠습니다.</p>
      <p style="text-align:center;margin:10px 0;">- 아 &nbsp; 래 -</p>
    </div>

    <table style="width:80%;margin:0 auto;border-collapse:collapse;font-size:13px;">
      <tr><td style="border:1px solid #999;padding:8px 16px;text-align:center;width:30%;background:#f5f5f5;">구분</td><td style="border:1px solid #999;padding:8px 16px;text-align:center;">상세내역</td></tr>
      <tr><td style="border:1px solid #999;padding:8px 16px;text-align:center;">요청자료</td><td style="border:1px solid #999;padding:8px 16px;text-align:center;">CCTV 영상자료</td></tr>
      <tr><td style="border:1px solid #999;padding:8px 16px;text-align:center;">처리방식</td><td style="border:1px solid #999;padding:8px 16px;text-align:center;"><i><u>제3자 전부 모자이크 처리 (얼굴 등)</u></i></td></tr>
      <tr><td style="border:1px solid #999;padding:8px 16px;text-align:center;">영상 기록 일시<br/>및 장소</td><td style="border:1px solid #999;padding:8px 16px;text-align:center;">${videoInfo}</td></tr>
      <tr><td style="border:1px solid #999;padding:8px 16px;text-align:center;">영상내용</td><td style="border:1px solid #999;padding:8px 16px;text-align:center;">${videoContent}</td></tr>
      <tr><td style="border:1px solid #999;padding:8px 16px;text-align:center;">요청방식</td><td style="border:1px solid #999;padding:8px 16px;text-align:center;">영상원본 메일전송 (수신처 :<br/>trustmozaik@trustmozaik-official.kr)</td></tr>
      <tr><td style="border:1px solid #999;padding:8px 16px;text-align:center;">요청근거</td><td style="border:1px solid #999;padding:8px 16px;text-align:center;">개인정보 보호법 (관련서류 붙임 참조)</td></tr>
    </table>

    <p style="font-size:14px;margin-top:20px;padding-left:30px;">붙임 &nbsp; 개인정보 보호 서약서 1부. &nbsp;끝.</p>

    <div style="text-align:center;margin-top:25px;position:relative;">
      <p style="font-size:16px;font-weight:bold;display:inline-block;position:relative;">
        트러스트 모자이크
        <img src="${stampDataUrl}" style="height:60px;position:absolute;top:-15px;right:-70px;"/>
      </p>
      <p style="font-size:14px;">대표이사 정연화 (인)</p>
    </div>
  </div>`;
}

// 5. 개인정보 파기확인서
export function destructionConfirmHTML({ organization, date, disposalDate, stampDataUrl, signDataUrl }) {
  return `<div style="${BASE_STYLE}">
    <h1 style="text-align:center;font-size:26px;margin-bottom:30px;letter-spacing:8px;text-decoration:underline;text-underline-offset:6px;">개인정보 파기 확인서</h1>

    <p style="font-size:15px;line-height:2;margin-bottom:16px;">
      트러스트 모자이크는 <b>${organization}</b>의 CCTV 영상 모자이크 편집 업무를 완료하였으며,
      업무 수행 과정에서 취급한 모든 개인정보를 아래와 같이 파기하였음을 확인합니다.
    </p>

    <table style="width:90%;margin:20px auto;border-collapse:collapse;font-size:14px;">
      <tr><td style="border:1px solid #999;padding:10px 16px;text-align:center;width:35%;background:#f5f5f5;font-weight:bold;">위탁기관명</td><td style="border:1px solid #999;padding:10px 16px;text-align:center;">${organization}</td></tr>
      <tr><td style="border:1px solid #999;padding:10px 16px;text-align:center;background:#f5f5f5;font-weight:bold;">수탁업체명</td><td style="border:1px solid #999;padding:10px 16px;text-align:center;">트러스트 모자이크</td></tr>
      <tr><td style="border:1px solid #999;padding:10px 16px;text-align:center;background:#f5f5f5;font-weight:bold;">취급일자</td><td style="border:1px solid #999;padding:10px 16px;text-align:center;">${disposalDate || date}</td></tr>
      <tr><td style="border:1px solid #999;padding:10px 16px;text-align:center;background:#f5f5f5;font-weight:bold;">파기일자</td><td style="border:1px solid #999;padding:10px 16px;text-align:center;">${date}</td></tr>
      <tr><td style="border:1px solid #999;padding:10px 16px;text-align:center;background:#f5f5f5;font-weight:bold;">파기방법</td><td style="border:1px solid #999;padding:10px 16px;text-align:center;">전자파일 완전삭제 (복구 불가능한 방법)</td></tr>
      <tr><td style="border:1px solid #999;padding:10px 16px;text-align:center;background:#f5f5f5;font-weight:bold;">파기내용</td><td style="border:1px solid #999;padding:10px 16px;text-align:center;">CCTV 영상 원본 및 편집본, 관련 자료 일체</td></tr>
    </table>

    <p style="font-size:14px;line-height:2;margin-top:24px;">
      상기 내용과 같이 개인정보를 파기하였음을 확인하며, 향후 동 정보를 이용한
      어떠한 행위도 하지 않을 것을 확약합니다.
    </p>

    <p style="text-align:center;margin-top:40px;font-size:16px;font-weight:bold;">${date}</p>

    <div style="text-align:center;margin-top:40px;position:relative;">
      <p style="font-size:16px;font-weight:bold;display:inline-block;position:relative;">
        트러스트 모자이크
        <img src="${stampDataUrl}" style="height:65px;position:absolute;top:-18px;right:-75px;"/>
      </p>
      <p style="font-size:14px;position:relative;display:inline-block;">
        대표이사 정연화 (인)
        <img src="${signDataUrl}" style="height:35px;position:absolute;top:-8px;left:120px;opacity:0.85;"/>
      </p>
    </div>

    <div style="text-align:center;margin-top:40px;">
      <p style="font-size:16px;"><b>${organization}</b> 귀하</p>
    </div>
  </div>`;
}
