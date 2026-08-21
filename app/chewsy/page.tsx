import type { Metadata } from "next";

import { ChewsyProductHome } from "@/components/chewsy-product-home";

const title = "好吃不 Chewsy｜记住你自己的每一口";
const description = "好吃不不是大众评分，也不是美食推荐，只记录你自己的真实体验，让下一次选择少一点运气。";

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords: ["好吃不", "Chewsy", "吃饭记录", "餐厅记录", "离线记录", "美食回忆"],
  alternates: {
    canonical: "/chewsy",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "/chewsy",
    siteName: "好吃不 Chewsy",
    title,
    description,
    images: [
      {
        url: "/chewsy/screens/home.png",
        width: 1380,
        height: 776,
        alt: "好吃不 Chewsy App 首页",
      },
    ],
  },
};

export default function ChewsyPage() {
  return <ChewsyProductHome />;
}
