import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"; // 必須引入 Link 組件

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "購物湊單神隊友",
  description: "湊單計算與購物紀錄管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}>
        {/* --- 這裡就是關鍵的導覽列 --- */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-black text-blue-600 text-xl tracking-tighter">
              ShoppingHelper
            </div>
            <div className="flex gap-6 font-bold text-sm">
              <Link href="/" className="text-slate-600 hover:text-blue-600 transition-colors text-black">湊單計算機</Link>
              <Link href="/records" className="text-slate-600 hover:text-blue-600 transition-colors text-black">購買紀錄</Link>
            </div>
          </div>
        </nav>

        {/* 這裡會顯示各分頁的內容 */}
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}