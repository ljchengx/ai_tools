import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getToolMetadata, ToolPageContent } from "@/components/tool-page";
import { getToolByPath, toolDefinitions } from "@/lib/tools/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return toolDefinitions.map((tool) => ({ slug: tool.path }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolByPath(slug);

  return tool ? getToolMetadata(tool) : {};
}

export default async function SeoToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getToolByPath(slug);

  if (!tool) {
    notFound();
  }

  return <ToolPageContent definition={tool} />;
}
