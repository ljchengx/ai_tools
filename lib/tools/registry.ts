export type ToolSlug = "base64" | "json-formatter" | "markdown-cleaner" | "image-watermark";

export type ToolIconName = "binary" | "braces" | "eraser" | "stamp";

export type ToolAccent = "amber" | "sage" | "clay";

export interface ToolDefinition {
  slug: ToolSlug;
  component: ToolSlug;
  title: string;
  titleEn: string;
  shortTitle: string;
  shortTitleEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  categoryEn: string;
  keywords: readonly string[];
  icon: ToolIconName;
  accent: ToolAccent;
  metadata: {
    title: string;
    description: string;
  };
}

export const toolDefinitions: readonly ToolDefinition[] = [
  {
    slug: "base64",
    component: "base64",
    title: "Base64 编解码",
    titleEn: "Base64 Codec",
    shortTitle: "Base64",
    shortTitleEn: "Base64",
    description: "在明文与编码之间，做一个深呼吸。",
    descriptionEn: "A quiet passage between plain text and encoded form.",
    category: "文本转换",
    categoryEn: "Text conversion",
    keywords: ["base64", "编码", "解码", "utf-8", "文本"],
    icon: "binary",
    accent: "amber",
    metadata: {
      title: "Base64 编解码",
      description: "本地运行的 UTF-8 Base64 文本编解码工具。",
    },
  },
  {
    slug: "json-formatter",
    component: "json-formatter",
    title: "JSON 格式化",
    titleEn: "JSON Formatter",
    shortTitle: "JSON",
    shortTitleEn: "JSON",
    description: "让杂乱的结构，重新显出秩序。",
    descriptionEn: "Bring order back to complex data structures.",
    category: "结构处理",
    categoryEn: "Data structure",
    keywords: ["json", "格式化", "压缩", "校验", "格式"],
    icon: "braces",
    accent: "sage",
    metadata: {
      title: "JSON 格式化",
      description: "校验、格式化与压缩标准 JSON，并定位输入错误。",
    },
  },
  {
    slug: "markdown-cleaner",
    component: "markdown-cleaner",
    title: "Markdown 清理",
    titleEn: "Markdown Cleaner",
    shortTitle: "Markdown",
    shortTitleEn: "Markdown",
    description: "剥去标记，只留下可读的文字。",
    descriptionEn: "Remove the markup and leave the words intact.",
    category: "文本净化",
    categoryEn: "Text cleanup",
    keywords: ["markdown", "md", "清理", "去标签", "纯文本"],
    icon: "eraser",
    accent: "clay",
    metadata: {
      title: "Markdown 清理",
      description: "移除 Markdown 语法标记并保留阅读结构。",
    },
  },
  {
    slug: "image-watermark",
    component: "image-watermark",
    title: "图片水印",
    titleEn: "Image Watermark",
    shortTitle: "水印",
    shortTitleEn: "Watermark",
    description: "给证件图片覆盖清晰、克制的用途声明。",
    descriptionEn: "Add a clear purpose statement to sensitive document images.",
    category: "图片保护",
    categoryEn: "Image protection",
    keywords: ["水印", "图片", "身份证", "证件", "watermark", "image", "隐私"],
    icon: "stamp",
    accent: "clay",
    metadata: {
      title: "图片水印",
      description: "在浏览器本地为身份证等证件图片添加自定义文本水印。",
    },
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolDefinitions.find((tool) => tool.slug === slug);
}

export function searchTools(query: string): ToolDefinition[] {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");

  if (!normalized) {
    return [...toolDefinitions];
  }

  return toolDefinitions.filter((tool) => {
    const index = [tool.title, tool.shortTitle, tool.description, tool.category, ...tool.keywords]
      .join(" ")
      .toLocaleLowerCase("zh-CN");

    return index.includes(normalized);
  });
}
