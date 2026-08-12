import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.yzfl.top"),
  applicationName: "知页",
  title: {
    default: "知页 - 免费的浏览器本地工具箱",
    template: "%s | 知页",
  },
  description: "知页提供免费的 Base64、JSON、Markdown、时间戳转换与图片水印工具。无需登录，所有内容只在浏览器本地处理。",
  creator: "ZHIYE",
  publisher: "ZHIYE",
  category: "utility",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
