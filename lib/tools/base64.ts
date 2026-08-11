export type Base64Variant = "standard" | "url";

export type Base64DecodeVariant = Base64Variant | "auto";

export interface Base64EncodeOptions {
  variant?: Base64Variant;
  padding?: boolean;
}

export interface Base64DecodeOptions {
  variant?: Base64DecodeVariant;
}

export class TextTransformError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TextTransformError";
  }
}

function bytesToBinary(bytes: Uint8Array): string {
  const chunks: string[] = [];
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, index + chunkSize)));
  }

  return chunks.join("");
}

function binaryToBytes(binary: string): Uint8Array {
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function normalizeBase64(input: string, variant: Base64DecodeVariant): string {
  const value = input.replace(/\s+/g, "");

  if (!value) {
    return "";
  }

  if (!/^[A-Za-z0-9+/_-]*={0,2}$/.test(value)) {
    throw new TextTransformError("输入包含非 Base64 字符。");
  }

  const hasStandardSymbols = /[+/]/.test(value);
  const hasUrlSymbols = /[-_]/.test(value);

  if (hasStandardSymbols && hasUrlSymbols) {
    throw new TextTransformError("不能混用标准 Base64 与 URL-safe 字符。");
  }

  if (variant === "standard" && hasUrlSymbols) {
    throw new TextTransformError("当前内容使用了 URL-safe Base64 字符。");
  }

  if (variant === "url" && hasStandardSymbols) {
    throw new TextTransformError("当前内容使用了标准 Base64 字符。");
  }

  const body = value.replace(/=+$/, "");
  const padding = value.slice(body.length);

  if (body.length % 4 === 1) {
    throw new TextTransformError("Base64 长度无效。");
  }

  if (padding && value.length % 4 !== 0) {
    throw new TextTransformError("带填充符的 Base64 长度无效。");
  }

  const normalizedBody = body.replace(/-/g, "+").replace(/_/g, "/");
  return `${normalizedBody}${"=".repeat((4 - (normalizedBody.length % 4)) % 4)}`;
}

export function encodeBase64(input: string, options: Base64EncodeOptions = {}): string {
  if (!input) {
    return "";
  }

  const variant = options.variant ?? "standard";
  const includePadding = options.padding ?? variant === "standard";
  let result = btoa(bytesToBinary(new TextEncoder().encode(input)));

  if (variant === "url") {
    result = result.replace(/\+/g, "-").replace(/\//g, "_");
  }

  return includePadding ? result : result.replace(/=+$/, "");
}

export function decodeBase64(input: string, options: Base64DecodeOptions = {}): string {
  const normalized = normalizeBase64(input, options.variant ?? "auto");

  if (!normalized) {
    return "";
  }

  try {
    const binary = atob(normalized);

    if (btoa(binary) !== normalized) {
      throw new TextTransformError("Base64 填充位无效。");
    }

    return new TextDecoder("utf-8", { fatal: true }).decode(binaryToBytes(binary));
  } catch (error) {
    if (error instanceof TextTransformError) {
      throw error;
    }

    throw new TextTransformError("解码结果不是有效的 UTF-8 文本。");
  }
}
