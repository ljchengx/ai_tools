import type { ToolSlug } from "@/lib/tools/registry";

const RECENT_TOOLS_KEY = "pulse:recent-tools";
const MAX_RECENT_TOOLS = 4;

export function readRecentTools(): ToolSlug[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const value = window.localStorage.getItem(RECENT_TOOLS_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isToolSlug).slice(0, MAX_RECENT_TOOLS) : [];
  } catch {
    return [];
  }
}

export function recordRecentTool(slug: ToolSlug): ToolSlug[] {
  const next = [slug, ...readRecentTools().filter((item) => item !== slug)].slice(0, MAX_RECENT_TOOLS);

  try {
    window.localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable in private browsing contexts.
  }

  return next;
}

function isToolSlug(value: unknown): value is ToolSlug {
  return value === "base64" || value === "json-formatter" || value === "markdown-cleaner" || value === "image-watermark";
}
