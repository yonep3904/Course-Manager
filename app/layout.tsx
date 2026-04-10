import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "履修登録ツール",
  description: "大学の履修登録に向けて科目と単位数を整理するローカルツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
