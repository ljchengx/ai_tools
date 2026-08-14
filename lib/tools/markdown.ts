import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";

export interface MarkdownStripOptions {
  compact?: boolean;
}

interface MarkdownNode {
  type: string;
  value?: string;
  alt?: string;
  children?: MarkdownNode[];
  lang?: string | null;
  ordered?: boolean;
  start?: number | null;
  checked?: boolean | null;
}

const inlineNodeTypes = new Set([
  "text",
  "emphasis",
  "strong",
  "delete",
  "link",
  "linkReference",
  "inlineCode",
  "image",
  "imageReference",
  "break",
  "html",
]);

function decodeCommonEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'");
}

function stripHtmlTags(value: string): string {
  return decodeCommonEntities(
    value
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<\/(?:p|div|section|article|h[1-6]|tr)\s*>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "- ")
      .replace(/<\/li\s*>/gi, "\n")
      .replace(/<[^>]*>/g, ""),
  );
}

function renderInline(node: MarkdownNode): string {
  switch (node.type) {
    case "text":
    case "inlineCode":
      return node.value ?? "";
    case "break":
      return "\n";
    case "image":
    case "imageReference":
      return node.alt ?? "";
    case "html":
      return stripHtmlTags(node.value ?? "");
    default:
      return (node.children ?? []).map(renderInline).join("");
  }
}

function renderListItem(node: MarkdownNode, index: number, ordered: boolean, start: number, depth: number): string {
  const indent = "  ".repeat(depth);
  const continuation = `${indent}  `;
  const primary: string[] = [];
  const nested: string[] = [];

  for (const child of node.children ?? []) {
    if (child.type === "list") {
      nested.push(renderList(child, depth + 1));
    } else {
      const rendered = renderBlock(child, depth);
      if (rendered) {
        primary.push(rendered);
      }
    }
  }

  const content = primary.join("\n\n");
  const marker = ordered ? `${start + index}. ` : "- ";
  const task = typeof node.checked === "boolean" ? `[${node.checked ? "x" : " "}] ` : "";
  const lines = content ? content.split("\n") : [""];
  const firstLine = `${indent}${marker}${task}${lines.shift() ?? ""}`.trimEnd();
  const continued = lines.map((line) => (line ? `${continuation}${line}` : ""));

  return [firstLine, ...continued, ...nested.filter(Boolean)].join("\n");
}

function renderList(node: MarkdownNode, depth: number): string {
  const ordered = Boolean(node.ordered);
  const start = node.start ?? 1;

  return (node.children ?? [])
    .map((item, index) => renderListItem(item, index, ordered, start, depth))
    .filter(Boolean)
    .join("\n");
}

function isTextMarkdownCodeBlock(node: MarkdownNode): boolean {
  const language = node.lang?.trim().toLocaleLowerCase("en-US");
  return language === "text"
    || language === "txt"
    || language === "plain"
    || language === "plaintext"
    || language === "markdown"
    || language === "md";
}

function renderBlock(node: MarkdownNode, depth = 0): string {
  if (inlineNodeTypes.has(node.type)) {
    return renderInline(node);
  }

  switch (node.type) {
    case "root":
      return (node.children ?? []).map((child) => renderBlock(child)).filter(Boolean).join("\n\n");
    case "heading":
    case "paragraph":
      return (node.children ?? []).map(renderInline).join("");
    case "code":
      return isTextMarkdownCodeBlock(node) ? renderMarkdownSource(node.value ?? "") : node.value ?? "";
    case "blockquote":
      return (node.children ?? []).map((child) => renderBlock(child, depth)).filter(Boolean).join("\n");
    case "list":
      return renderList(node, depth);
    case "listItem":
      return renderListItem(node, 0, false, 1, depth);
    case "table":
      return (node.children ?? []).map((child) => renderBlock(child, depth)).filter(Boolean).join("\n");
    case "tableRow":
      return (node.children ?? []).map(renderInline).join("\t");
    case "tableCell":
      return (node.children ?? []).map(renderInline).join("");
    case "html":
      return stripHtmlTags(node.value ?? "");
    case "thematicBreak":
    case "definition":
    case "footnoteDefinition":
    case "yaml":
      return "";
    default:
      return (node.children ?? []).map((child) => renderBlock(child, depth)).filter(Boolean).join("\n");
  }
}

function renderMarkdownSource(input: string): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(input) as unknown as MarkdownNode;
  return renderBlock(tree);
}

export function stripMarkdown(input: string, options: MarkdownStripOptions = {}): string {
  if (!input.trim()) {
    return "";
  }

  const result = renderMarkdownSource(input)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return options.compact ? result.replace(/\n{2,}/g, "\n") : result;
}
