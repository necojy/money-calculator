import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}