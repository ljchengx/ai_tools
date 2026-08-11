import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pulse - 晨雾文本工具",
    template: "%s | Pulse",
  },
  description: "本地运行的 Base64、JSON、Markdown 与图片水印处理工具。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
