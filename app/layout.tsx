import type { Metadata } from "next";
import "./globals.css";

// 這裡不需要引入 Geist，也不需要定義 geistSans 與 geistMono 變數

export const metadata: Metadata = {
  title: "購物湊單神隊友",
  description: "湊單計算與購物紀錄管理",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      {/* 直接使用 Tailwind 的 font-sans 即可，這會抓系統預設字體 */}
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}