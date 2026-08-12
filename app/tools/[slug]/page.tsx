import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ImageWatermarkWorkspace } from "@/components/image-watermark-workspace";
import { ToolWorkspace } from "@/components/tool-workspace";
import { getToolBySlug, toolDefinitions } from "@/lib/tools/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return toolDefinitions.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return {};
  }

  const path = `/tools/${tool.slug}`;

  return {
    title: tool.metadata.title,
    description: tool.metadata.description,
    keywords: [...tool.keywords, tool.title, "知页", "浏览器本地工具"],
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "zh_CN",
      url: path,
      siteName: "知页 ZHIYE",
      title: `${tool.metadata.title} | 知页`,
      description: tool.metadata.description,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.metadata.title} | 知页`,
      description: tool.metadata.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    notFound();
  }

  if (tool.slug === "image-watermark") {
    return <ImageWatermarkWorkspace definition={tool} />;
  }

  return <ToolWorkspace definition={tool} />;
}
