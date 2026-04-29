import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const A4_W = 794;
const A4_H = 1123;

// Preload image as data URL
export async function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      c.getContext('2d').drawImage(img, 0, 0);
      resolve(c.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = src;
  });
}

// Render HTML string to PDF base64
export async function htmlToPdfBase64(htmlString) {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
  
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `width:${A4_W}px;height:${A4_H}px;background:#fff;overflow:hidden;`;
  wrapper.innerHTML = htmlString;
  container.appendChild(wrapper);
  document.body.appendChild(container);

  // Wait for images to load
  const imgs = wrapper.querySelectorAll('img');
  await Promise.all([...imgs].map(img => 
    img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
  ));
  await new Promise(r => setTimeout(r, 200));

  const canvas = await html2canvas(wrapper, {
    scale: 2, useCORS: true, allowTaint: true,
    width: A4_W, height: A4_H, backgroundColor: '#ffffff',
  });

  document.body.removeChild(container);

  const pdf = new jsPDF('p', 'mm', 'a4');
  pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 210, 297);
  return pdf.output('datauristring').split(',')[1];
}

export function formatDate(d) {
  const now = d || new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatPrice(v) {
  if (!v) return '';
  const n = parseInt(String(v).replace(/[^\d]/g, ''));
  return isNaN(n) ? '' : n.toLocaleString('ko-KR');
}
