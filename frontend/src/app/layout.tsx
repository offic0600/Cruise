import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cruise - 智能开发管理平台",
  description: "面向软件开发过程的智能管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}