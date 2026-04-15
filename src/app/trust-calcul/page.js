'use client';

import { useState, useEffect } from 'react';
import './calcul.css';

// ===========================
// Pricing Constants (VAT included)
// ===========================
const COMPLEXITY_MULTIPLIER = 1.6;
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyI-wk2iixj6Kvx82TihoXPexntaSTJPYXNXQjcMrEF-CFk6onOd8yPyf3HxgyLgI0/exec';

export default function TrustCalculator() {
  // Input States
  const [people, setPeople] = useState('');
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('0');
  const [movement, setMovement] = useState('normal'); // 'normal' or 'complex'
  const [org, setOrg] = useState('');

  // Result States
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Auto-convert 60s to 1min
  useEffect(() => {
    const s = parseInt(seconds) || 0;
    if (s >= 60) {
      setMinutes(prev => (parseInt(prev) || 0) + Math.floor(s / 60));
      setSeconds(String(s % 60));
    }
  }, [seconds]);

  const calculateEstimate = () => {
    const p = parseInt(people) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;
    const actualTimeInMins = m + (s / 60);

    if (actualTimeInMins === 0) {
      alert('영상 길이를 입력해주세요.');
      return;
    }

    // 1. Round up to nearest 5 minutes as per "5분마다 가격 책정"
    const billingMins = Math.ceil(actualTimeInMins / 5) * 5;

    // 2. Base Pricing for Tier 1 (1-3 people) based on piecewise rules
    let basePrice = 0;
    if (billingMins <= 20) {
      basePrice = billingMins * 5000;
    } else if (billingMins <= 30) {
      basePrice = 100000 + ((billingMins - 20) * 1000);
    } else {
      // Up to 60m logic: 110k at 30m, 190k at 60m
      const extraMins = Math.min(60, billingMins) - 30;
      basePrice = 110000 + (extraMins * (80000 / 30));
      
      // Beyond 60m? (Assuming same rate as 30-60 chunk)
      if (billingMins > 60) {
        basePrice += (billingMins - 60) * (80000 / 30);
      }
    }

    // 3. Multiplier for People Tiers (1-3=1x, 4-6=2x, 7-9=3x, ...)
    const personMultiplier = Math.ceil(p / 3) || 1;
    let totalPrice = basePrice * personMultiplier;
    
    // 4. Multiplier for Complexity (Complex = 1.6x)
    if (movement === 'complex') {
      totalPrice *= COMPLEXITY_MULTIPLIER;
    }

    // Final rounding to nearest 10 KRW
    const finalPrice = Math.round(totalPrice / 10) * 10;
    
    setResult({
      total: finalPrice,
      subtotal: Math.round(finalPrice / 1.1),
      vat: finalPrice - Math.round(finalPrice / 1.1),
      people: p,
      time: `${m}분 ${s}초 (청구 기준: ${billingMins}분)`,
      org: org || '요청 기관'
    });
  };

  const resetForm = () => {
    setPeople('');
    setMinutes('0');
    setSeconds('0');
    setMovement('normal');
    setOrg('');
    setResult(null);
  };

  const handleDownload = async () => {
    if (!result) return;
    setDownloading(true);

    const payload = {
      organization: result.org,
      price: result.total,
      product_spec: `${result.people}명 / ${result.time} / 움직임 ${movement === 'complex' ? '복잡함' : '보통'}`
    };

    try {
      // GAS usually requires no-cors for simple requests, but we need the response
      // Web App URL with POST should be called
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain' // Workaround for CORS in some GAS setups if Fetch is used
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        // Base64 to Download
        const byteCharacters = atob(data.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = data.filename || '견적서.pdf';
        link.click();
      } else {
        alert('견적서 생성 오류: ' + (data.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="calcul-container">
      <header className="calcul-header">
        <h1>CCTV 모자이크 견적 계산기</h1>
        <p>트러스트 모자이크 - 정확한 예상 견적을 확인하세요</p>
      </header>

      <main className="input-section">
        <h2 className="section-title">정보 입력</h2>

        <div className="form-group">
          <label className="form-label">
            나오는 사람 수 <span className="required">*</span>
          </label>
          <input
            className="form-input"
            type="number"
            placeholder="움직이는 차량번호판 포함"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
          />
          <p className="form-helper">
            움직이는 차량번호판도 1개로 계산됩니다.<br />
            고정된 차량 번호판은 추가금 없음. 단, 갯수가 많을 시 추가금 붙을 수 있음
          </p>
        </div>

        <div className="form-group">
          <label className="form-label">
            영상 총 길이 <span className="required">*</span>
          </label>
          <div className="grid-2">
            <div>
              <span className="form-label" style={{ fontSize: '12px' }}>분</span>
              <input
                className="form-input"
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </div>
            <div>
              <span className="form-label" style={{ fontSize: '12px' }}>초</span>
              <input
                className="form-input"
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              />
            </div>
          </div>
          <p className="form-helper">60초 이상 입력 시 자동 환산</p>
        </div>

        <div className="form-group">
          <label className="form-label">
            영상 속 움직임 정도 <span className="required">*</span>
          </label>
          <select
            className="form-select"
            value={movement}
            onChange={(e) => setMovement(e.target.value)}
          >
            <option value="normal">보통</option>
            <option value="complex">복잡함 (기본 요금의 1.2배 적용)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            요청 기관 <span className="required">*</span>
          </label>
          <input
            className="form-input"
            type="text"
            placeholder="예: 종로구청"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
          />
        </div>

        <div className="btn-group">
          <button className="btn btn-reset" onClick={resetForm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
            초기화
          </button>
          <button className="btn btn-calc" onClick={calculateEstimate}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            견적 계산하기
          </button>
        </div>
      </main>

      {result && (
        <section className="result-section">
          <div className="result-header">
            <h2 className="result-title">계산 결과</h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>{result.org}</span>
          </div>
          <div className="price-item">
            <span>공급가액</span>
            <span>{result.subtotal.toLocaleString()}원</span>
          </div>
          <div className="price-item">
            <span>부가세 (10%)</span>
            <span>{result.vat.toLocaleString()}원</span>
          </div>
          <div className="price-total">
            <span>예상 견적 총액</span>
            <span>{result.total.toLocaleString()}원</span>
          </div>
          
          <button 
            className="btn btn-download" 
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <div className="spinner"></div>
                생성 중...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                견적서 다운로드하기
              </>
            )}
          </button>
        </section>
      )}

      <footer className="info-box">
        <h3>견적 산정 방식 안내</h3>
        <ul className="info-list">
          <li>기본 요금: 5명 이하 기준 시간대별 책정</li>
          <li>사람 수: 5명 초과시 5명 단위로 추가 요금 발생</li>
          <li>영상 길이: 시간 초과시 구간별 합산</li>
          <li>움직임: 많은 움직임 선택시 기본 요금의 1.2배 적용</li>
        </ul>
        <p className="info-footer">※ 모든 가격은 부가세 포함 금액입니다</p>
      </footer>
    </div>
  );
}
