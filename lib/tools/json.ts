import parseJson from "json-parse-even-better-errors";

export interface JsonErrorLocation {
  line: number;
  column: number;
  position: number;
}

export interface JsonFormatOptions {
  indentation?: 2 | 4;
  sortKeys?: boolean;
}

export interface JsonSummary {
  kind: "object" | "array" | "string" | "number" | "boolean" | "null";
  entries: number;
  nodes: number;
  depth: number;
}

export interface JsonStructureStats {
  objects: number;
  arrays: number;
  keyValuePairs: number;
}

export class JsonTransformError extends Error {
  readonly location: JsonErrorLocation;

  constructor(message: string, location: JsonErrorLocation) {
    super(message);
    this.name = "JsonTransformError";
    this.location = location;
  }
}

function toLocation(input: string, position: number): JsonErrorLocation {
  const safePosition = Math.max(0, Math.min(position, input.length));
  const before = input.slice(0, safePosition);
  const lines = before.split(/\r?\n/);

  return {
    position: safePosition,
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJsonValue);
  }

  if (!isRecord(value)) {
    return value;
  }

  const sorted: Record<string, unknown> = {};

  for (const key of Object.keys(value).sort()) {
    sorted[key] = sortJsonValue(value[key]);
  }

  return sorted;
}

function summarize(value: unknown, depth = 1): { nodes: number; depth: number } {
  if (Array.isArray(value)) {
    return value.reduce<{ nodes: number; depth: number }>(
      (summary, child) => {
        const childSummary = summarize(child, depth + 1);
        return {
          nodes: summary.nodes + childSummary.nodes,
          depth: Math.max(summary.depth, childSummary.depth),
        };
      },
      { nodes: 1, depth },
    );
  }

  if (isRecord(value)) {
    return Object.values(value).reduce<{ nodes: number; depth: number }>(
      (summary, child) => {
        const childSummary = summarize(child, depth + 1);
        return {
          nodes: summary.nodes + childSummary.nodes,
          depth: Math.max(summary.depth, childSummary.depth),
        };
      },
      { nodes: 1, depth },
    );
  }

  return { nodes: 1, depth };
}

export function getJsonSummary(value: unknown): JsonSummary {
  const kind = value === null
    ? "null"
    : Array.isArray(value)
      ? "array"
      : isRecord(value)
        ? "object"
        : typeof value as JsonSummary["kind"];
  const summary = summarize(value);

  return {
    kind,
    entries: Array.isArray(value) ? value.length : isRecord(value) ? Object.keys(value).length : 0,
    nodes: summary.nodes,
    depth: summary.depth,
  };
}

export function getJsonStructureStats(value: unknown): JsonStructureStats {
  if (Array.isArray(value)) {
    return value.reduce<JsonStructureStats>(
      (stats, child) => {
        const childStats = getJsonStructureStats(child);
        return {
          objects: stats.objects + childStats.objects,
          arrays: stats.arrays + childStats.arrays,
          keyValuePairs: stats.keyValuePairs + childStats.keyValuePairs,
        };
      },
      { objects: 0, arrays: 1, keyValuePairs: 0 },
    );
  }

  if (isRecord(value)) {
    return Object.values(value).reduce<JsonStructureStats>(
      (stats, child) => {
        const childStats = getJsonStructureStats(child);
        return {
          objects: stats.objects + childStats.objects,
          arrays: stats.arrays + childStats.arrays,
          keyValuePairs: stats.keyValuePairs + childStats.keyValuePairs,
        };
      },
      { objects: 1, arrays: 0, keyValuePairs: Object.keys(value).length },
    );
  }

  return { objects: 0, arrays: 0, keyValuePairs: 0 };
}

export function parseStrictJson(input: string): unknown {
  if (!input.trim()) {
    throw new JsonTransformError("请输入 JSON 内容。", toLocation(input, 0));
  }

  try {
    return parseJson(input);
  } catch (error) {
    const parseError = error as { message?: string; position?: number };
    const message = parseError.message?.replace(/ while parsing[\s\S]*$/, "") ?? "JSON 格式无效。";
    const position = typeof parseError.position === "number" ? parseError.position : 0;

    throw new JsonTransformError(message, toLocation(input, position));
  }
}

export function formatJson(input: string, options: JsonFormatOptions = {}): string {
  const value = parseStrictJson(input);
  return JSON.stringify(options.sortKeys ? sortJsonValue(value) : value, null, options.indentation ?? 2);
}

export function minifyJson(input: string, options: Pick<JsonFormatOptions, "sortKeys"> = {}): string {
  const value = parseStrictJson(input);
  return JSON.stringify(options.sortKeys ? sortJsonValue(value) : value);
}
