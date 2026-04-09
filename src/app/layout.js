import './globals.css';

export const metadata = {
  title: '트러스트 모자이크 - 서류 자동작성',
  description: 'CCTV 비식별화 업체 트러스트 모자이크의 서류 자동작성 및 이메일 발송 시스템',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
