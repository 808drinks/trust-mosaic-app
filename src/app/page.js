'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ===========================
// Helper: 숫자를 한글 가격으로 변환
// ===========================
function numberToKorean(num) {
  if (!num || num === 0) return '';
  const units = ['', '만', '억', '조'];
  const smallUnits = ['', '십', '백', '천'];
  const digits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  
  const n = parseInt(String(num).replace(/[^\d]/g, ''));
  if (isNaN(n) || n === 0) return '';
  
  const str = String(n);
  const len = str.length;
  let result = '';
  
  for (let i = 0; i < len; i++) {
    const digit = parseInt(str[i]);
    const pos = len - 1 - i;
    const bigUnit = Math.floor(pos / 4);
    const smallUnit = pos % 4;
    
    if (digit !== 0) {
      if (digit === 1 && smallUnit > 0) {
        result += smallUnits[smallUnit];
      } else {
        result += digits[digit] + smallUnits[smallUnit];
      }
    }
    
    if (smallUnit === 0 && result.length > 0) {
      result += units[bigUnit];
    }
  }
  
  return result + '원정';
}

// ===========================
// Helper: 가격 포맷팅
// ===========================
function formatPrice(value) {
  if (!value) return '';
  const num = parseInt(String(value).replace(/[^\d]/g, ''));
  if (isNaN(num)) return '';
  return num.toLocaleString('ko-KR');
}

// ===========================
// Toast Component
// ===========================
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type} ${toast.leaving ? 'leaving' : ''}`}>
          <div className="toast-icon">
            {toast.type === 'success' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            )}
            {toast.type === 'error' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            )}
            {toast.type === 'info' && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            )}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ===========================
// Saved Message Modal
// ===========================
function SavedMessageModal({ isOpen, onClose, messages, onSave, onDelete, onEdit }) {
  const [editMode, setEditMode] = useState(null);
  const [form, setForm] = useState({ title: '', mail_subject: '', mail_body: '' });

  if (!isOpen) return null;

  const startEdit = (msg) => {
    setEditMode(msg.id);
    setForm({ title: msg.title, mail_subject: msg.mail_subject || '', mail_body: msg.mail_body });
  };

  const startNew = () => {
    setEditMode('new');
    setForm({ title: '', mail_subject: '', mail_body: '' });
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.mail_body.trim()) return;
    if (editMode === 'new') {
      onSave(form);
    } else {
      onEdit(editMode, form);
    }
    setEditMode(null);
    setForm({ title: '', mail_subject: '', mail_body: '' });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>📋 자주 쓰는 멘트 관리</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {editMode ? (
            <div>
              <div className="form-group">
                <label className="form-label">멘트 이름</label>
                <input
                  className="form-input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: 일반 안내"
                />
              </div>
              <div className="form-group">
                <label className="form-label">메일 제목</label>
                <input
                  className="form-input"
                  value={form.mail_subject}
                  onChange={(e) => setForm({ ...form, mail_subject: e.target.value })}
                  placeholder="메일 제목을 입력하세요"
                />
              </div>
              <div className="form-group">
                <label className="form-label">메일 본문</label>
                <textarea
                  className="form-textarea"
                  value={form.mail_body}
                  onChange={(e) => setForm({ ...form, mail_body: e.target.value })}
                  placeholder="메일 내용을 입력하세요"
                  rows={8}
                />
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <p>저장된 멘트가 없습니다</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="saved-message-item">
                    <div className="saved-message-info">
                      <div className="saved-message-title">{msg.title}</div>
                      <div className="saved-message-preview">{msg.mail_body?.substring(0, 60)}...</div>
                    </div>
                    <div className="saved-message-actions">
                      <button className="btn btn-ghost btn-icon" onClick={() => startEdit(msg)} title="수정">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => onDelete(msg.id)} title="삭제">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          {editMode ? (
            <>
              <button className="btn btn-secondary" onClick={() => setEditMode(null)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave}>저장</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={onClose}>닫기</button>
              <button className="btn btn-primary" onClick={startNew}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                새 멘트 추가
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// Saved Spec Modal
// ===========================
function SavedSpecModal({ isOpen, onClose, specs, onSave, onDelete, onApply }) {
  const [form, setForm] = useState({ title: '', spec_value: '', price: '', price_korean: '' });
  const [showForm, setShowForm] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.title.trim() || !form.spec_value.trim()) return;
    onSave({
      ...form,
      price: parseInt(String(form.price).replace(/[^\d]/g, '')) || 0,
    });
    setForm({ title: '', spec_value: '', price: '', price_korean: '' });
    setShowForm(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>📐 자주 쓰는 규격 관리</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="modal-body">
          {showForm ? (
            <div>
              <div className="form-group">
                <label className="form-label">규격 이름</label>
                <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="예: 5곳 이하 5분 이하" />
              </div>
              <div className="form-group">
                <label className="form-label">규격 값</label>
                <input className="form-input" value={form.spec_value} onChange={(e) => setForm({ ...form, spec_value: e.target.value })} placeholder="예: 10군데 이하 5분 이하" />
              </div>
              <div className="form-group">
                <label className="form-label">가격</label>
                <input className="form-input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="예: 25000" type="number" />
              </div>
              <div className="form-group">
                <label className="form-label">한글 가격 <span className="optional">(자동 변환)</span></label>
                <input className="form-input" value={form.price ? numberToKorean(form.price) : form.price_korean} readOnly style={{ background: 'var(--bg-tertiary)' }} />
              </div>
            </div>
          ) : (
            <>
              {specs.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                  <p>저장된 규격이 없습니다</p>
                </div>
              ) : (
                specs.map((spec) => (
                  <div key={spec.id} className="saved-message-item">
                    <div className="saved-message-info" style={{ cursor: 'pointer' }} onClick={() => { onApply(spec); onClose(); }}>
                      <div className="saved-message-title">{spec.title}</div>
                      <div className="saved-message-preview">
                        {spec.spec_value} / {spec.price ? `${Number(spec.price).toLocaleString('ko-KR')}원` : '가격 미설정'}
                      </div>
                    </div>
                    <div className="saved-message-actions">
                      <button className="btn btn-danger btn-icon" onClick={() => onDelete(spec.id)} title="삭제">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          {showForm ? (
            <>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>취소</button>
              <button className="btn btn-primary" onClick={handleSave}>저장</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={onClose}>닫기</button>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                새 규격 추가
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// Document definitions
// ===========================
const DOCUMENTS = [
  {
    key: 'BizTemplate',
    label: '사업자등록증',
    subtitle: '기본 첨부 서류 (기본 체크)',
    fields: [],
  },
  {
    key: 'privacy_document',
    label: '보안서약서',
    subtitle: '기관 측에서 보관',
    fields: [],
  },
  {
    key: 'consent_document',
    label: '개인정보처리동의서',
    subtitle: '제외인물 서명 후 기관 보관',
    fields: [],
  },
  {
    key: 'estimate_document',
    label: '견적서',
    subtitle: '가격 및 규격 정보 입력 필요',
    fields: [
      { key: 'price', label: '가격', placeholder: '예: 25000', type: 'number' },
      { key: 'product_spec', label: '규격', placeholder: '예: 10군데 이하 5분 이하' },
    ],
  },
  {
    key: 'estimate_document2',
    label: '견적서2 (선택적)',
    subtitle: '두 개의 견적서를 보낼 때 사용',
    fields: [
      { key: 'price2', label: '가격2', placeholder: '예: 35000', type: 'number' },
      { key: 'product_spec2', label: '규격2', placeholder: '예: 5곳 이하 5분 이하' },
    ],
  },
  {
    key: 'security_agreement_document',
    label: '보안확약서',
    subtitle: '기관 측에서 보관',
    fields: [],
  },
  {
    key: 'cooperation_letter_document',
    label: '협조공문',
    subtitle: '문서번호 및 영상 정보 입력 필요',
    fields: [
      { key: 'doc_number', label: '문서번호', placeholder: '예: 2025-143' },
      { key: 'video_datetime_location', label: '영상일시 및 장소', placeholder: '예: 2025-01-02 놀이터 인근' },
      { key: 'video_content', label: '영상내용', placeholder: '예: 폭행 장면' },
    ],
  },
  {
    key: 'destruction_confirm_document',
    label: '개인정보 파기 확인서',
    subtitle: '취급일자 직접 입력',
    fields: [
      { key: 'disposal_date', label: '취급일자', placeholder: '예: 2025-05-05', type: 'date' },
    ],
  },
  {
    key: 'ContractSample',
    label: '위탁계약서 표본',
    subtitle: '계약서 참고 자료',
    fields: [],
  },
  {
    key: 'BankAccount',
    label: '통장사본',
    subtitle: '계좌 확인 서류',
    fields: [],
  },
];

// ===========================
// Main Page Component
// ===========================
export default function Home() {
  // Form State
  const [organization, setOrganization] = useState('');
  const [email1, setEmail1] = useState('');
  const [email2, setEmail2] = useState('');
  const [selectedDocs, setSelectedDocs] = useState({ BizTemplate: true });
  const [docFields, setDocFields] = useState({});
  const [mailSubject, setMailSubject] = useState('트러스트 모자이크입니다. 개인정보 관련 서류 및 견적서 보내드립니다.');
  const [mailBody, setMailBody] = useState('');
  const [sheetWrite, setSheetWrite] = useState(true);
  
  // Data State
  const [savedMessages, setSavedMessages] = useState([]);
  const [savedSpecs, setSavedSpecs] = useState([]);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSaved, setWebhookSaved] = useState(false);
  const [webhookExpanded, setWebhookExpanded] = useState(false);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [editMail, setEditMail] = useState(false);
  const toastIdRef = useRef(0);

  // ===========================
  // Toast
  // ===========================
  const addToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  // ===========================
  // Data Fetching
  // ===========================
  useEffect(() => {
    fetchMessages();
    fetchSpecs();
    fetchWebhook();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      setSavedMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch messages:', e);
    }
  };

  const fetchSpecs = async () => {
    try {
      const res = await fetch('/api/specs');
      const data = await res.json();
      setSavedSpecs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch specs:', e);
    }
  };

  const fetchWebhook = async () => {
    try {
      const res = await fetch('/api/webhook');
      const data = await res.json();
      if (data && data.webhook_url) {
        setWebhookUrl(data.webhook_url);
        setWebhookSaved(true);
      }
    } catch (e) {
      console.error('Failed to fetch webhook:', e);
    }
  };

  // ===========================
  // Document Selection
  // ===========================
  const toggleDoc = (key) => {
    setSelectedDocs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateDocField = (docKey, fieldKey, value) => {
    setDocFields((prev) => ({
      ...prev,
      [docKey]: { ...(prev[docKey] || {}), [fieldKey]: value },
    }));
  };

  // ===========================
  // Message functions
  // ===========================
  const applyMessage = (msg) => {
    if (msg.mail_subject) setMailSubject(msg.mail_subject);
    setMailBody(msg.mail_body);
    addToast(`"${msg.title}" 멘트가 적용되었습니다`, 'success');
  };

  const saveMessage = async (form) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      fetchMessages();
      addToast('멘트가 저장되었습니다', 'success');
    } catch (e) {
      addToast('멘트 저장 실패', 'error');
    }
  };

  const editMessage = async (id, form) => {
    try {
      await fetch('/api/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...form }),
      });
      fetchMessages();
      addToast('멘트가 수정되었습니다', 'success');
    } catch (e) {
      addToast('멘트 수정 실패', 'error');
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('이 멘트를 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/messages?id=${id}`, { method: 'DELETE' });
      fetchMessages();
      addToast('멘트가 삭제되었습니다', 'info');
    } catch (e) {
      addToast('멘트 삭제 실패', 'error');
    }
  };

  // ===========================
  // Spec functions
  // ===========================
  const saveSpec = async (form) => {
    try {
      await fetch('/api/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price_korean: numberToKorean(form.price) }),
      });
      fetchSpecs();
      addToast('규격이 저장되었습니다', 'success');
    } catch (e) {
      addToast('규격 저장 실패', 'error');
    }
  };

  const deleteSpec = async (id) => {
    if (!confirm('이 규격을 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/specs?id=${id}`, { method: 'DELETE' });
      fetchSpecs();
      addToast('규격이 삭제되었습니다', 'info');
    } catch (e) {
      addToast('규격 삭제 실패', 'error');
    }
  };

  const applySpec = (spec) => {
    setDocFields((prev) => ({
      ...prev,
      estimate_document: {
        ...(prev.estimate_document || {}),
        price: String(spec.price || ''),
        product_spec: spec.spec_value,
      },
    }));
    if (!selectedDocs.estimate_document) {
      setSelectedDocs((prev) => ({ ...prev, estimate_document: true }));
    }
    addToast(`"${spec.title}" 규격이 적용되었습니다`, 'success');
  };

  // ===========================
  // Webhook
  // ===========================
  const saveWebhook = async () => {
    if (!webhookUrl.trim()) {
      addToast('웹훅 URL을 입력해주세요', 'error');
      return;
    }
    try {
      await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      });
      setWebhookSaved(true);
      addToast('웹훅 URL이 저장되었습니다', 'success');
    } catch (e) {
      addToast('웹훅 URL 저장 실패', 'error');
    }
  };

  // ===========================
  // Submit
  // ===========================
  const handleSubmit = async () => {
    if (!organization.trim()) {
      addToast('기관명을 입력해주세요', 'error');
      return;
    }
    if (!email1.trim()) {
      addToast('이메일 주소를 입력해주세요', 'error');
      return;
    }

    const hasSelectedDocs = Object.values(selectedDocs).some(Boolean);
    if (!hasSelectedDocs) {
      addToast('최소 1개의 서류를 선택해주세요', 'error');
      return;
    }

    setLoading(true);

    try {
      const estimateFields = docFields.estimate_document || {};
      const est2Fields = docFields.estimate_document2 || {};
      const coopFields = docFields.cooperation_letter_document || {};
      const destructFields = docFields.destruction_confirm_document || {};
      const customFields = docFields.custom_document || {};

      const priceNum = estimateFields.price 
        ? parseInt(String(estimateFields.price).replace(/[^\d]/g, '')) 
        : 0;

      const price2Num = est2Fields.price2 
        ? parseInt(String(est2Fields.price2).replace(/[^\d]/g, '')) 
        : 0;

      const payload = {
        organization,
        email1: email1.trim(),
        email2: email2.trim() || undefined,
        price: priceNum || '',
        price2: price2Num || '',
        title_text: mailSubject,
        body_text: mailBody,
        SheetWrite: sheetWrite ? 1 : 0,
        BizTemplate: selectedDocs.BizTemplate ? 1 : 0,
        BankAccount: selectedDocs.BankAccount ? 1 : 0,
        ContractSample: selectedDocs.ContractSample ? 1 : 0,
        privacy_document: selectedDocs.privacy_document || false,
        estimate_document: selectedDocs.estimate_document || false,
        estimate_document2: selectedDocs.estimate_document2 || false,
        consent_document: selectedDocs.consent_document || false,
        security_agreement_document: selectedDocs.security_agreement_document || false,
        cooperation_letter_document: selectedDocs.cooperation_letter_document || false,
        destruction_confirm_document: selectedDocs.destruction_confirm_document || false,
        custom_document: selectedDocs.custom_document || false,
        price_korean: priceNum ? numberToKorean(priceNum) : '',
        product_spec: estimateFields.product_spec || '',
        price_korean2: price2Num ? numberToKorean(price2Num) : '',
        product_spec2: est2Fields.product_spec2 || '',
        doc_number: coopFields.doc_number || '',
        video_datetime_location: coopFields.video_datetime_location || '',
        video_content: coopFields.video_content || '',
        disposal_date: destructFields.disposal_date || '',
        custom_document_title: customFields.custom_title || '',
        custom_document_content: customFields.custom_content || '',
      };

      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        addToast('✅ 서류 생성 및 이메일 전송 완료!', 'success');
      } else {
        addToast(result.error || '전송 실패', 'error');
      }
    } catch (e) {
      addToast(`전송 중 오류: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===========================
  // Render
  // ===========================
  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h1>트러스트 모자이크</h1>
        <p>서류 자동작성 및 이메일 발송 시스템</p>
      </header>

      {/* 기관명 & 이메일 */}
      <section className="section">
        <div className="section-header">
          <div className="section-header-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2>서류 선택 및 정보 입력</h2>
        </div>
        <div className="section-body">
          <div className="form-group">
            <label className="form-label">
              기관명 <span className="required">*</span>
            </label>
            <input
              id="org-input"
              className="form-input"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="예: 서울시청"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              이메일 주소 1 <span className="required">*</span>
            </label>
            <input
              id="email1-input"
              className="form-input"
              type="email"
              value={email1}
              onChange={(e) => setEmail1(e.target.value)}
              placeholder="예: email1@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              이메일 주소 2 <span className="optional">(선택)</span>
            </label>
            <input
              id="email2-input"
              className="form-input"
              type="email"
              value={email2}
              onChange={(e) => setEmail2(e.target.value)}
              placeholder="예: email2@example.com"
            />
          </div>
        </div>
      </section>

      {/* 서류 선택 */}
      <section className="section">
        <div className="section-header">
          <div className="section-header-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <h2>서류 선택</h2>
          <div className="section-header-actions">
            <button className="btn btn-ghost" onClick={() => setSpecModalOpen(true)} title="자주 쓰는 규격 관리">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              자주 쓰는 규격
            </button>
          </div>
        </div>
        <div className="section-body">
          {DOCUMENTS.map((doc) => (
            <div key={doc.key} className={`doc-card ${selectedDocs[doc.key] ? 'active' : ''}`}>
              <div className="doc-card-header" onClick={() => toggleDoc(doc.key)}>
                <input
                  type="checkbox"
                  className="doc-checkbox"
                  checked={!!selectedDocs[doc.key]}
                  onChange={() => toggleDoc(doc.key)}
                  onClick={(e) => e.stopPropagation()}
                  id={`doc-${doc.key}`}
                />
                <div>
                  <div className="doc-card-title">{doc.label}</div>
                  <div className="doc-card-subtitle">{doc.subtitle}</div>
                </div>
              </div>
              {selectedDocs[doc.key] && doc.fields.length > 0 && (
                <div className="doc-card-fields">
                  {doc.fields.map((field) => (
                    <div key={field.key} style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{field.label}</div>
                      {field.type === 'textarea' ? (
                        <textarea
                          className="form-textarea"
                          value={(docFields[doc.key] || {})[field.key] || ''}
                          onChange={(e) => updateDocField(doc.key, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          id={`field-${doc.key}-${field.key}`}
                          style={{ minHeight: '120px', padding: '12px' }}
                        />
                      ) : (
                        <input
                          className="form-input"
                          type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
                          value={(docFields[doc.key] || {})[field.key] || ''}
                          onChange={(e) => updateDocField(doc.key, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          id={`field-${doc.key}-${field.key}`}
                        />
                      )}
                    </div>
                  ))}
                  {doc.key === 'estimate_document' && docFields.estimate_document?.price && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', padding: '0 var(--space-1)', marginTop: '4px' }}>
                      한글 가격: <strong style={{ color: 'var(--accent-primary)' }}>{numberToKorean(docFields.estimate_document.price)}</strong>
                      {' · '}
                      포맷: <strong style={{ color: 'var(--accent-primary)' }}>{formatPrice(docFields.estimate_document.price)}원</strong>
                    </div>
                  )}
                  {doc.key === 'estimate_document2' && docFields.estimate_document2?.price2 && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', padding: '0 var(--space-1)', marginTop: '4px' }}>
                      한글 가격: <strong style={{ color: 'var(--accent-primary)' }}>{numberToKorean(docFields.estimate_document2.price2)}</strong>
                      {' · '}
                      포맷: <strong style={{ color: 'var(--accent-primary)' }}>{formatPrice(docFields.estimate_document2.price2)}원</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 메일 내용 */}
      <section className="section">
        <div className="section-header">
          <div className="section-header-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2>메일 내용</h2>
          <div className="section-header-actions">
            <button className="btn btn-ghost" onClick={() => setMessageModalOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              자주 쓰는 멘트 관리
            </button>
            <button className="btn btn-ghost" onClick={() => setEditMail(!editMail)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              {editMail ? '미리보기' : '직접 편집'}
            </button>
          </div>
        </div>
        <div className="section-body">
          {/* Message chips */}
          {savedMessages.length > 0 && (
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                📋 자주 쓰는 멘트 (클릭 시 적용)
              </div>
              <div className="message-chips">
                {savedMessages.map((msg) => (
                  <button key={msg.id} className="message-chip" onClick={() => applyMessage(msg)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                    {msg.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mail Subject */}
          <div className="form-group">
            <label className="form-label">메일 제목</label>
            <input
              id="mail-subject"
              className="form-input"
              value={mailSubject}
              onChange={(e) => setMailSubject(e.target.value)}
              placeholder="메일 제목을 입력하세요"
            />
          </div>

          {/* Mail Body */}
          <div className="form-group">
            <label className="form-label">메일 내용</label>
            {editMail ? (
              <textarea
                id="mail-body"
                className="form-textarea"
                value={mailBody}
                onChange={(e) => setMailBody(e.target.value)}
                placeholder="메일 내용을 입력하세요"
                rows={12}
              />
            ) : (
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--bg-primary)',
                  border: '1.5px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-base)',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-wrap',
                  minHeight: '180px',
                  color: mailBody ? 'var(--text-primary)' : 'var(--text-tertiary)',
                }}
              >
                {mailBody || '자주 쓰는 멘트를 선택하거나 "직접 편집"을 눌러 내용을 입력하세요.'}
              </div>
            )}
          </div>

          {/* Sheet Write Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <input
              type="checkbox"
              className="doc-checkbox"
              checked={sheetWrite}
              onChange={(e) => setSheetWrite(e.target.checked)}
              id="sheet-write"
            />
            <label htmlFor="sheet-write" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
              </svg>
              스프레드시트에 기록
            </label>
          </div>
        </div>
      </section>

      {/* Submit Button */}
      <button
        id="submit-btn"
        className="btn-submit"
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginBottom: 'var(--space-5)' }}
      >
        {loading ? (
          <>
            <span className="spinner" style={{ marginRight: '8px' }}></span>
            서류 생성 중...
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            서류 생성 및 전송
          </>
        )}
      </button>

      {/* Webhook Settings (Collapsible) */}
      <div className="webhook-section">
        <div
          className="webhook-header"
          onClick={() => setWebhookExpanded(!webhookExpanded)}
        >
          <div className="webhook-header-left">
            <div className="webhook-header-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <div>
              <h3>웹훅 URL 설정</h3>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                Google Apps Script 웹 앱 URL
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {webhookSaved && (
              <span className="webhook-status saved">✓ 저장됨</span>
            )}
            <svg
              className={`webhook-chevron ${webhookExpanded ? 'open' : ''}`}
              width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
        {webhookExpanded && (
          <div className="webhook-body">
            <div className="webhook-input-group">
              <input
                id="webhook-url"
                className="form-input"
                value={webhookUrl}
                onChange={(e) => { setWebhookUrl(e.target.value); setWebhookSaved(false); }}
                placeholder="https://script.google.com/macros/s/..."
              />
              <button className="btn btn-primary" onClick={saveWebhook}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                저장
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SavedMessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        messages={savedMessages}
        onSave={saveMessage}
        onDelete={deleteMessage}
        onEdit={editMessage}
      />

      <SavedSpecModal
        isOpen={specModalOpen}
        onClose={() => setSpecModalOpen(false)}
        specs={savedSpecs}
        onSave={saveSpec}
        onDelete={deleteSpec}
        onApply={applySpec}
      />
    </div>
  );
}
