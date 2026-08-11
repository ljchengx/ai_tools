import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.yzfl.top"),
  applicationName: "知页",
  title: {
    default: "知页 - AI 时代的浏览器本地工具箱",
    template: "%s | 知页",
  },
  description: "知页提供免费的 Base64、JSON、Markdown 与图片水印工具。无需登录，所有内容只在浏览器本地处理。",
  keywords: ["知页", "免费在线工具", "本地工具", "浏览器工具", "Base64", "JSON 格式化", "Markdown 清理", "图片水印"],
  creator: "ZHIYE",
  publisher: "ZHIYE",
  category: "utility",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/",
    siteName: "知页 ZHIYE",
    title: "知页 - AI 时代的浏览器本地工具箱",
    description: "免费使用，无需登录。在浏览器本地处理文本、数据与图片，内容不离开你的设备。",
  },
  twitter: {
    card: "summary",
    title: "知页 - AI 时代的浏览器本地工具箱",
    description: "免费使用，无需登录。在浏览器本地处理文本、数据与图片，内容不离开你的设备。",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
