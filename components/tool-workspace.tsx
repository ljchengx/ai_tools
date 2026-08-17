"use client";

import {
  AlignLeft,
  ArrowLeftRight,
  Check,
  Clipboard,
  Download,
  FileUp,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  TreePine,
  UnlockKeyhole,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type DragEvent, type ReactNode } from "react";

import { recordRecentTool } from "@/lib/recent-tools";
import { decodeBase64, encodeBase64, TextTransformError, type Base64Variant } from "@/lib/tools/base64";
import {
  formatJson,
  getJsonStructureStats,
  getJsonSummary,
  JsonTransformError,
  minifyJson,
  parseStrictJson,
  type JsonStructureStats,
  type JsonSummary,
} from "@/lib/tools/json";
import { stripMarkdown } from "@/lib/tools/markdown";
import type { ToolDefinition } from "@/lib/tools/registry";

import { PulseShell, usePulseLocale } from "./pulse-shell";

type StatusTone = "idle" | "processing" | "success" | "error";
type JsonResultView = "text" | "tree";
type Base64Suggestion = "encode" | "decode" | null;

const editorGlassStyle: CSSProperties = {
  backdropFilter: "blur(var(--blur-editor))",
  WebkitBackdropFilter: "blur(var(--blur-editor))",
};

interface StatusMessage {
  tone: StatusTone;
  text: string;
}

interface InputIssue {
  line: number;
  column: number;
  text: string;
}

const workspaceCopy = {
  zh: {
    back: "回到工作台",
    local: "浏览器本地处理",
    settings: "工具设置",
    input: "输入文本",
    output: "处理结果",
    waiting: "等待输入",
    processing: "正在处理",
    noInput: "请输入需要处理的文本。",
    copied: "已复制",
    copiedStatus: "结果已复制到剪贴板。",
    copyFailed: "浏览器未允许访问剪贴板。",
    noResult: "没有可复制的结果。",
    downloaded: "结果已下载。",
    noDownload: "没有可下载的结果。",
    swapped: "输入与结果已交换。",
    noSwap: "没有可交换的处理结果。",
    cleared: "内容已清空",
    inputOptions: "处理方式",
    outputOptions: "输出格式",
    inputFormat: "输入格式",
    formatDetails: "格式细节",
    paragraph: "段落",
    standard: "标准",
    url: "URL-safe",
    keepPadding: "保留 =",
    autoDetect: "自动识别标准与 URL-safe",
    twoSpaces: "2 空格",
    fourSpaces: "4 空格",
    sortKeys: "按名称排序",
    compact: "合并空行",
    text: "文本",
    tree: "结构",
    copy: "复制结果",
    download: "下载结果",
    reset: "清空内容",
    swap: "交换输入和结果",
    import: "导入 .md",
    release: "释放以导入 Markdown 文件",
    fileError: "仅支持导入 .md 或 .markdown 文件。",
    fileLoaded: "Markdown 文件已导入。",
    fileFailed: "文件读取失败，请重新选择。",
    outputPlaceholder: "处理结果将显示在这里",
    base64Encode: "编码",
    base64Decode: "解码",
    jsonFormat: "格式化",
    jsonMinify: "压缩",
    jsonValidate: "校验",
    actionEncode: "编码文本",
    actionDecode: "解码文本",
    actionFormat: "格式化",
    actionMinify: "压缩",
    actionValidate: "校验",
    actionClean: "清理文本",
    encoded: "文本已编码。",
    decoded: "文本已解码。",
    formatted: "JSON 已格式化。",
    minified: "JSON 已压缩。",
    valid: "JSON 结构有效",
    cleaned: "Markdown 语法已清理。",
    compacted: "Markdown 已清理并合并段落。",
    recommended: "建议",
    character: "字符",
    before: "原文本",
    after: "纯文本",
    removed: "已清理",
    markers: "个标记字符",
    objects: "对象",
    arrays: "数组",
    keyValues: "键值对",
    jsonTree: "JSON 结构视图",
    textView: "纯文本视图",
    treeView: "树形视图",
  },
  en: {
    back: "Back to workspace",
    local: "Processed in this browser",
    settings: "Settings",
    input: "Input",
    output: "Result",
    waiting: "Ready for text",
    processing: "Processing",
    noInput: "Enter text to process.",
    copied: "Copied",
    copiedStatus: "Result copied to clipboard.",
    copyFailed: "Clipboard access is unavailable in this browser.",
    noResult: "There is no result to copy.",
    downloaded: "Result downloaded.",
    noDownload: "There is no result to download.",
    swapped: "Input and result swapped.",
    noSwap: "There is no result to swap.",
    cleared: "Content cleared",
    inputOptions: "Mode",
    outputOptions: "Output",
    inputFormat: "Input",
    formatDetails: "Format",
    paragraph: "Paragraphs",
    standard: "Standard",
    url: "URL-safe",
    keepPadding: "Keep =",
    autoDetect: "Standard and URL-safe detected automatically",
    twoSpaces: "2 spaces",
    fourSpaces: "4 spaces",
    sortKeys: "Sort keys",
    compact: "Merge blank lines",
    text: "Text",
    tree: "Tree",
    copy: "Copy result",
    download: "Download result",
    reset: "Clear content",
    swap: "Swap input and result",
    import: "Import .md",
    release: "Drop to import a Markdown file",
    fileError: "Only .md and .markdown files are supported.",
    fileLoaded: "Markdown file imported.",
    fileFailed: "The file could not be read. Try again.",
    outputPlaceholder: "Your result will appear here",
    base64Encode: "Encode",
    base64Decode: "Decode",
    jsonFormat: "Format",
    jsonMinify: "Minify",
    jsonValidate: "Validate",
    actionEncode: "Encode text",
    actionDecode: "Decode text",
    actionFormat: "Format",
    actionMinify: "Minify",
    actionValidate: "Validate",
    actionClean: "Clean text",
    encoded: "Text encoded.",
    decoded: "Text decoded.",
    formatted: "JSON formatted.",
    minified: "JSON minified.",
    valid: "Valid JSON structure",
    cleaned: "Markdown syntax removed.",
    compacted: "Markdown cleaned and blank lines merged.",
    recommended: "Suggested",
    character: "chars",
    before: "Source",
    after: "Plain text",
    removed: "Removed",
    markers: "marker chars",
    objects: "objects",
    arrays: "arrays",
    keyValues: "key/value pairs",
    jsonTree: "JSON structure view",
    textView: "Text view",
    treeView: "Tree view",
  },
} as const;

const jsonKindLabels: Record<JsonSummary["kind"], Record<"zh" | "en", string>> = {
  object: { zh: "对象", en: "object" },
  array: { zh: "数组", en: "array" },
  string: { zh: "字符串", en: "string" },
  number: { zh: "数字", en: "number" },
  boolean: { zh: "布尔值", en: "boolean" },
  null: { zh: "空值", en: "null" },
};

function placeholderFor(slug: ToolDefinition["slug"], locale: "zh" | "en"): string {
  if (slug === "base64") {
    return locale === "zh" ? "请输入需要编码或解码的文本内容..." : "Enter text to encode or decode...";
  }

  if (slug === "json-formatter") {
    return '{\n  "name": "ZHIYE"\n}';
  }

  return locale === "zh"
    ? "# 一段标题\n\n保留 **可读文本**，移除 [语法](https://example.com)。"
    : "# A heading\n\nKeep **readable text** and remove [markup](https://example.com).";
}

function messageForError(error: unknown, locale: "zh" | "en"): string {
  if (error instanceof JsonTransformError) {
    return locale === "zh"
      ? `第 ${error.location.line} 行，第 ${error.location.column} 列：${error.message}`
      : `Line ${error.location.line}, column ${error.location.column}: ${error.message}`;
  }

  if (error instanceof TextTransformError || error instanceof Error) {
    return error.message;
  }

  return locale === "zh" ? "处理失败，请检查输入内容。" : "Processing failed. Check the input and try again.";
}

function jsonSummaryText(summary: JsonSummary, locale: "zh" | "en"): string {
  const kind = jsonKindLabels[summary.kind][locale];
  const entries = summary.entries ? (locale === "zh" ? `，${summary.entries} 项` : `, ${summary.entries} entries`) : "";
  return locale === "zh" ? `${kind}${entries}，${summary.depth} 层结构` : `${kind}${entries}, ${summary.depth} levels deep`;
}

function isJsonContainer(value: unknown): value is unknown[] | Record<string, unknown> {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}

function primitiveText(value: unknown): string {
  if (value === null) {
    return "null";
  }

  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

function JsonTreeNode({ label, value, depth = 0, locale }: { label: string; value: unknown; depth?: number; locale: "zh" | "en" }) {
  if (!isJsonContainer(value)) {
    return (
      <div className="pulse-json-tree__value">
        <span>{label}</span>
        <code>{primitiveText(value)}</code>
      </div>
    );
  }

  const isArray = Array.isArray(value);
  const entries = isArray ? value.map((item, index) => [String(index), item] as const) : Object.entries(value);
  const visibleEntries = entries.slice(0, 100);
  const type = locale === "zh" ? (isArray ? "数组" : "对象") : (isArray ? "Array" : "Object");

  return (
    <details className="pulse-json-tree__branch" open={depth < 1}>
      <summary>
        <span>{label}</span>
        <small>{type} · {entries.length}</small>
      </summary>
      <div className="pulse-json-tree__children">
        {visibleEntries.map(([key, child]) => <JsonTreeNode key={key} label={key} value={child} depth={depth + 1} locale={locale} />)}
        {entries.length > visibleEntries.length ? <span className="pulse-json-tree__truncated">{locale === "zh" ? `其余 ${entries.length - visibleEntries.length} 项未展开` : `${entries.length - visibleEntries.length} more entries`}</span> : null}
      </div>
    </details>
  );
}

function JsonTree({ value, locale }: { value: unknown; locale: "zh" | "en" }) {
  const copy = workspaceCopy[locale];

  return (
    <div className="pulse-json-tree" aria-label={copy.jsonTree}>
      <JsonTreeNode label="root" value={value} locale={locale} />
    </div>
  );
}

async function copyToClipboard(value: string, fallbackError: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const temporary = document.createElement("textarea");
  temporary.value = value;
  temporary.style.position = "fixed";
  temporary.style.opacity = "0";
  document.body.appendChild(temporary);
  temporary.select();
  const copied = document.execCommand("copy");
  temporary.remove();

  if (!copied) {
    throw new Error(fallbackError);
  }
}

function actionLabel(tool: ToolDefinition, mode: string, locale: "zh" | "en"): string {
  const copy = workspaceCopy[locale];

  if (tool.slug === "base64") {
    return mode === "decode" ? copy.actionDecode : copy.actionEncode;
  }

  if (tool.slug === "json-formatter") {
    return mode === "minify" ? copy.actionMinify : mode === "validate" ? copy.actionValidate : copy.actionFormat;
  }

  return copy.actionClean;
}

function getBase64Suggestion(input: string): Base64Suggestion {
  const value = input.replace(/\s+/g, "");
  if (!value || !/^[A-Za-z0-9+/_-]*={0,2}$/.test(value)) {
    return null;
  }

  return value.endsWith("=") ? "decode" : "encode";
}

function isMarkdownFile(file: File): boolean {
  const name = file.name.toLocaleLowerCase();
  return name.endsWith(".md") || name.endsWith(".markdown") || file.type === "text/markdown";
}

function ToolWorkspaceContent({ definition }: { definition: ToolDefinition }) {
  const { locale } = usePulseLocale();
  const copy = workspaceCopy[locale];
  const reducedMotion = useReducedMotion();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState(definition.slug === "base64" ? "encode" : "format");
  const [status, setStatus] = useState<StatusMessage>({ tone: "idle", text: copy.waiting });
  const [isRunning, setIsRunning] = useState(false);
  const [base64Variant, setBase64Variant] = useState<Base64Variant>("standard");
  const [base64Padding, setBase64Padding] = useState(false);
  const [base64Suggestion, setBase64Suggestion] = useState<Base64Suggestion>(null);
  const [jsonIndentation, setJsonIndentation] = useState<2 | 4>(2);
  const [sortJsonKeys, setSortJsonKeys] = useState(false);
  const [jsonResult, setJsonResult] = useState<unknown>(undefined);
  const [jsonSummary, setJsonSummary] = useState<JsonSummary | null>(null);
  const [jsonStructureStats, setJsonStructureStats] = useState<JsonStructureStats | null>(null);
  const [jsonResultView, setJsonResultView] = useState<JsonResultView>("text");
  const [jsonInputIssue, setJsonInputIssue] = useState<InputIssue | null>(null);
  const [markdownCompact, setMarkdownCompact] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRunPulseVisible, setIsRunPulseVisible] = useState(false);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dragDepthRef = useRef(0);
  const copiedTimerRef = useRef<number | null>(null);
  const runPulseTimerRef = useRef<number | null>(null);
  const inputCount = useMemo(() => input.length.toLocaleString(locale === "zh" ? "zh-CN" : "en-US"), [input.length, locale]);
  const outputCount = useMemo(() => output.length.toLocaleString(locale === "zh" ? "zh-CN" : "en-US"), [output.length, locale]);
  const markdownRemoved = Math.max(0, input.length - output.length).toLocaleString(locale === "zh" ? "zh-CN" : "en-US");

  useEffect(() => {
    recordRecentTool(definition.slug);
    inputRef.current?.focus();
  }, [definition.slug]);

  useEffect(() => {
    if (definition.slug !== "base64") {
      setBase64Suggestion(null);
      return;
    }

    const timer = window.setTimeout(() => setBase64Suggestion(getBase64Suggestion(input)), 300);
    return () => window.clearTimeout(timer);
  }, [definition.slug, input]);

  useEffect(() => {
    if (definition.slug !== "json-formatter" || !input.trim()) {
      setJsonInputIssue(null);
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        parseStrictJson(input);
        setJsonInputIssue(null);
      } catch (error) {
        if (error instanceof JsonTransformError) {
          setJsonInputIssue({
            line: error.location.line,
            column: error.location.column,
            text: messageForError(error, locale),
          });
        }
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [definition.slug, input, locale]);

  useEffect(() => () => {
    if (copiedTimerRef.current) {
      window.clearTimeout(copiedTimerRef.current);
    }
    if (runPulseTimerRef.current) {
      window.clearTimeout(runPulseTimerRef.current);
    }
  }, []);

  const showRunPulse = () => {
    setIsRunPulseVisible(true);
    if (runPulseTimerRef.current) {
      window.clearTimeout(runPulseTimerRef.current);
    }
    runPulseTimerRef.current = window.setTimeout(() => setIsRunPulseVisible(false), 700);
  };

  const run = () => {
    if (!input.trim()) {
      setStatus({ tone: "error", text: copy.noInput });
      return;
    }

    const startedAt = performance.now();
    setIsRunning(true);
    setStatus({ tone: "processing", text: copy.processing });
    setJsonResult(undefined);
    setJsonSummary(null);
    setJsonStructureStats(null);
    setJsonInputIssue(null);
    setIsCopied(false);
    showRunPulse();

    try {
      if (definition.slug === "base64") {
        const result = mode === "decode"
          ? decodeBase64(input, { variant: "auto" })
          : encodeBase64(input, {
              variant: base64Variant,
              padding: base64Variant === "standard" || base64Padding,
            });
        setOutput(result);
        setStatus({ tone: "success", text: mode === "decode" ? copy.decoded : copy.encoded });
      }

      if (definition.slug === "json-formatter") {
        const parsed = parseStrictJson(input);
        const summary = getJsonSummary(parsed);
        setJsonResult(parsed);
        setJsonSummary(summary);
        setJsonStructureStats(getJsonStructureStats(parsed));

        if (mode === "validate") {
          setOutput("");
          setStatus({ tone: "success", text: `${copy.valid}：${jsonSummaryText(summary, locale)}。` });
        } else {
          const options = { sortKeys: sortJsonKeys };
          const result = mode === "minify"
            ? minifyJson(input, options)
            : formatJson(input, { ...options, indentation: jsonIndentation });
          setOutput(result);
          setStatus({ tone: "success", text: mode === "minify" ? copy.minified : copy.formatted });
        }
      }

      if (definition.slug === "markdown-cleaner") {
        setOutput(stripMarkdown(input, { compact: markdownCompact }));
        setStatus({ tone: "success", text: markdownCompact ? copy.compacted : copy.cleaned });
      }
    } catch (error) {
      const message = messageForError(error, locale);
      setStatus({ tone: "error", text: message });
      if (error instanceof JsonTransformError) {
        setJsonInputIssue({
          line: error.location.line,
          column: error.location.column,
          text: message,
        });
      }
    } finally {
      setElapsedMs(performance.now() - startedAt);
      setIsRunning(false);
    }
  };

  const reset = () => {
    setInput("");
    setOutput("");
    setJsonResult(undefined);
    setJsonSummary(null);
    setJsonStructureStats(null);
    setJsonInputIssue(null);
    setIsCopied(false);
    setElapsedMs(null);
    setStatus({ tone: "idle", text: copy.cleared });
    inputRef.current?.focus();
  };

  const swapInputAndOutput = () => {
    if (!output) {
      setStatus({ tone: "error", text: copy.noSwap });
      return;
    }

    setInput(output);
    setOutput(input);
    setJsonResult(undefined);
    setJsonSummary(null);
    setJsonStructureStats(null);
    setJsonInputIssue(null);
    setJsonResultView("text");
    setIsCopied(false);
    setStatus({ tone: "success", text: copy.swapped });
    inputRef.current?.focus();
  };

  const copyOutput = async () => {
    if (!output) {
      setStatus({ tone: "error", text: copy.noResult });
      return;
    }

    try {
      await copyToClipboard(output, copy.copyFailed);
      setIsCopied(true);
      if (copiedTimerRef.current) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => setIsCopied(false), 1500);
      setStatus({ tone: "success", text: copy.copiedStatus });
    } catch (error) {
      setStatus({ tone: "error", text: messageForError(error, locale) });
    }
  };

  const downloadOutput = () => {
    if (!output) {
      setStatus({ tone: "error", text: copy.noDownload });
      return;
    }

    const isJson = definition.slug === "json-formatter";
    const blob = new Blob([output], { type: isJson ? "application/json;charset=utf-8" : "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${definition.slug}-result.${isJson ? "json" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus({ tone: "success", text: copy.downloaded });
  };

  const updateInput = (value: string) => {
    setInput(value);
    setJsonInputIssue(null);
    setIsCopied(false);
  };

  const importMarkdownFile = (file: File) => {
    if (!isMarkdownFile(file)) {
      setStatus({ tone: "error", text: copy.fileError });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateInput(typeof reader.result === "string" ? reader.result : "");
      setStatus({ tone: "success", text: copy.fileLoaded });
    };
    reader.onerror = () => setStatus({ tone: "error", text: copy.fileFailed });
    reader.readAsText(file);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMarkdownFile(file);
    }
    event.target.value = "";
  };

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    if (definition.slug !== "markdown-cleaner") {
      return;
    }
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDraggingFile(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    if (definition.slug !== "markdown-cleaner") {
      return;
    }
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (definition.slug !== "markdown-cleaner") {
      return;
    }
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDraggingFile(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      importMarkdownFile(file);
    }
  };

  const title = locale === "zh" ? definition.seo.h1 : definition.titleEn;
  const description = locale === "zh" ? definition.description : definition.descriptionEn;
  const action = actionLabel(definition, mode, locale);
  const actionAriaLabel = locale === "zh" ? `执行${action}` : `Run ${action}`;

  return (
    <motion.section
      className={`pulse-workbench pulse-workbench--${definition.slug}`}
      aria-labelledby="tool-title"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeOut" }}
    >
      <header className="pulse-workbench__header">
        <div>
          <div className="pulse-workbench__meta" aria-hidden="true">
            <span>知页 / 工具</span>
            <i />
            <span>{locale === "zh" ? definition.category : definition.categoryEn}</span>
          </div>
          <h1 id="tool-title">{title}</h1>
          <p>{description}</p>
        </div>
      </header>

      <section className={`pulse-workspace pulse-workspace--${definition.slug}`} aria-label={`${title} ${locale === "zh" ? "工作区" : "workspace"}`}>
        <div className="pulse-toolbar" aria-label={copy.settings}>
          <div className="pulse-toolbar__configuration">
            <section className="pulse-mode-group">
              <span className="pulse-toolbar__caption">{copy.inputOptions}</span>
              <div className="pulse-segmented-control" aria-label={copy.inputOptions}>
                {definition.slug === "base64" ? (
                  <>
                    <button className={`${mode === "encode" ? "is-selected" : ""} ${base64Suggestion === "encode" ? "is-recommended" : ""}`} type="button" onClick={() => setMode("encode")}>
                      <LockKeyhole aria-hidden="true" size={14} strokeWidth={1.7} />
                      {copy.base64Encode}
                      {base64Suggestion === "encode" ? <small>{copy.recommended}</small> : null}
                    </button>
                    <button className={`${mode === "decode" ? "is-selected" : ""} ${base64Suggestion === "decode" ? "is-recommended" : ""}`} type="button" onClick={() => setMode("decode")}>
                      <UnlockKeyhole aria-hidden="true" size={14} strokeWidth={1.7} />
                      {copy.base64Decode}
                      {base64Suggestion === "decode" ? <small>{copy.recommended}</small> : null}
                    </button>
                  </>
                ) : null}
                {definition.slug === "json-formatter" ? (
                  <>
                    <button className={mode === "format" ? "is-selected" : ""} type="button" onClick={() => setMode("format")}>{copy.jsonFormat}</button>
                    <button className={mode === "minify" ? "is-selected" : ""} type="button" onClick={() => setMode("minify")}>{copy.jsonMinify}</button>
                    <button className={mode === "validate" ? "is-selected" : ""} type="button" onClick={() => setMode("validate")}>{copy.jsonValidate}</button>
                  </>
                ) : null}
                {definition.slug === "markdown-cleaner" ? <span className="pulse-segmented-control__static">{locale === "zh" ? "纯文本输出" : "Plain text output"}</span> : null}
              </div>
            </section>

            {definition.slug === "base64" ? (
              <section className="pulse-toolbar__preferences" aria-label="Base64 options">
                <span>{mode === "encode" ? copy.outputOptions : copy.inputFormat}</span>
                {mode === "encode" ? (
                  <>
                    <div className="pulse-quiet-segments">
                      <button className={base64Variant === "standard" ? "is-selected" : ""} type="button" aria-pressed={base64Variant === "standard"} onClick={() => setBase64Variant("standard")}>{copy.standard}</button>
                      <button className={base64Variant === "url" ? "is-selected" : ""} type="button" aria-pressed={base64Variant === "url"} onClick={() => setBase64Variant("url")}>{copy.url}</button>
                    </div>
                    {base64Variant === "url" ? (
                      <label className="pulse-check">
                        <input type="checkbox" checked={base64Padding} onChange={(event) => setBase64Padding(event.target.checked)} />
                        <span>{copy.keepPadding}</span>
                      </label>
                    ) : null}
                  </>
                ) : <small>{copy.autoDetect}</small>}
              </section>
            ) : null}

            {definition.slug === "json-formatter" ? (
              <section className="pulse-toolbar__preferences" aria-label="JSON options">
                <span>{copy.formatDetails}</span>
                <div className="pulse-quiet-segments">
                  <button className={jsonIndentation === 2 ? "is-selected" : ""} type="button" aria-pressed={jsonIndentation === 2} onClick={() => setJsonIndentation(2)}>{copy.twoSpaces}</button>
                  <button className={jsonIndentation === 4 ? "is-selected" : ""} type="button" aria-pressed={jsonIndentation === 4} onClick={() => setJsonIndentation(4)}>{copy.fourSpaces}</button>
                </div>
                <label className="pulse-check">
                  <input type="checkbox" checked={sortJsonKeys} onChange={(event) => setSortJsonKeys(event.target.checked)} />
                  <span>{copy.sortKeys}</span>
                </label>
              </section>
            ) : null}

            {definition.slug === "markdown-cleaner" ? (
              <section className="pulse-toolbar__preferences" aria-label="Markdown options">
                <span>{copy.paragraph}</span>
                <label className="pulse-check">
                  <input type="checkbox" checked={markdownCompact} onChange={(event) => setMarkdownCompact(event.target.checked)} />
                  <span>{copy.compact}</span>
                </label>
              </section>
            ) : null}
          </div>

          <button className="pulse-icon-button" type="button" onClick={reset} aria-label={copy.reset} title={copy.reset}>
            <RotateCcw aria-hidden="true" size={17} strokeWidth={1.7} />
          </button>
        </div>

        <div className={`pulse-editor-grid pulse-editor-grid--${definition.slug}`}>

          <section
            className={`pulse-editor-card pulse-editor-card--input ${isDraggingFile ? "is-dragging" : ""} ${jsonInputIssue ? "has-error" : ""}`}
            style={editorGlassStyle}
            onDragEnter={handleDragEnter}
            onDragOver={(event) => definition.slug === "markdown-cleaner" && event.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="pulse-editor-card__heading">
              <span>{copy.input}</span>
              <div>
                <span>{inputCount} {copy.character}</span>
                {definition.slug === "markdown-cleaner" ? (
                  <label className="pulse-file-import pulse-file-import--markdown" title={copy.import}>
                    <FileUp aria-hidden="true" size={15} strokeWidth={1.75} />
                    <span>{copy.import}</span>
                    <input type="file" accept=".md,.markdown,text/markdown" onChange={handleFileInput} />
                  </label>
                ) : null}
              </div>
            </div>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => updateInput(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                  && (event.ctrlKey || event.metaKey)
                  && !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  run();
                }
              }}
              placeholder={placeholderFor(definition.slug, locale)}
              spellCheck={false}
              aria-label={copy.input}
            />
            {isDraggingFile ? <div className="pulse-drop-overlay"><FileUp aria-hidden="true" size={22} strokeWidth={1.55} /><span>{copy.release}</span></div> : null}
            {jsonInputIssue ? (
              <p className="pulse-input-issue" role="alert">
                <span aria-hidden="true" />
                {jsonInputIssue.text}
              </p>
            ) : null}
          </section>

          <div className="pulse-transfer" aria-label={locale === "zh" ? "处理操作" : "Processing actions"}>
            <button className={`pulse-run-button ${isRunPulseVisible ? "has-ripple" : ""}`} type="button" onClick={run} disabled={isRunning} aria-label={actionAriaLabel}>
              <Sparkles aria-hidden="true" size={17} strokeWidth={1.7} />
              <span>{isRunning ? copy.processing : action}</span>
            </button>
            <button className="pulse-swap-button" type="button" onClick={swapInputAndOutput} aria-label={copy.swap} title={copy.swap}>
              <ArrowLeftRight aria-hidden="true" size={17} strokeWidth={1.7} />
              <span className="sr-only">{locale === "zh" ? "互换" : "Swap"}</span>
            </button>
          </div>

          <section className={`pulse-editor-card pulse-editor-card--output ${definition.slug === "json-formatter" && jsonResultView === "tree" ? "is-tree" : ""} ${isCopied ? "is-copied" : ""}`} style={editorGlassStyle}>
            <div className="pulse-editor-card__heading">
              <span>{copy.output}</span>
              <div>
                {definition.slug === "json-formatter" && jsonResult !== undefined ? (
                  <div className="pulse-result-view" aria-label="JSON output view">
                    <button className={jsonResultView === "text" ? "is-selected" : ""} type="button" onClick={() => setJsonResultView("text")} aria-label={copy.textView} title={copy.textView}>
                      <AlignLeft aria-hidden="true" size={14} strokeWidth={1.7} />
                      <span className="sr-only">{copy.text}</span>
                    </button>
                    <button className={jsonResultView === "tree" ? "is-selected" : ""} type="button" onClick={() => setJsonResultView("tree")} aria-label={copy.tree} title={copy.treeView}>
                      <TreePine aria-hidden="true" size={14} strokeWidth={1.7} />
                      <span className="sr-only">{copy.tree}</span>
                    </button>
                  </div>
                ) : null}
                <span>{outputCount} {copy.character}</span>
                <button className="pulse-icon-button pulse-icon-button--small" type="button" onClick={copyOutput} aria-label={copy.copy} title={copy.copy}>
                  <Clipboard aria-hidden="true" size={15} strokeWidth={1.75} />
                </button>
                <button className="pulse-icon-button pulse-icon-button--small" type="button" onClick={downloadOutput} aria-label={copy.download} title={copy.download}>
                  <Download aria-hidden="true" size={15} strokeWidth={1.75} />
                </button>
              </div>
            </div>
            {isCopied ? <span className="pulse-copy-toast"><Check aria-hidden="true" size={13} strokeWidth={2.1} />{copy.copied}</span> : null}
            {definition.slug === "json-formatter" && jsonResult !== undefined && jsonResultView === "tree" ? (
              <JsonTree value={jsonResult} locale={locale} />
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder={copy.outputPlaceholder}
                spellCheck={false}
                aria-label={copy.output}
              />
            )}
          </section>
        </div>

        <div className="pulse-statusbar">
          <div className={`pulse-status pulse-status--${status.tone}`} role="status" aria-live="polite">
            <span className="pulse-status__label">{locale === "zh" ? "状态" : "Status"}</span>
            {status.tone === "success" ? <Check aria-hidden="true" size={16} strokeWidth={2.05} /> : null}
            {status.tone === "error" ? <TriangleAlert aria-hidden="true" size={16} strokeWidth={1.85} /> : null}
            <span>{status.text}</span>
          </div>
          <div className="pulse-statusbar__metrics" aria-label={locale === "zh" ? "处理统计" : "Processing statistics"}>
            <span>{copy.input} {inputCount}</span>
            <span>{copy.output} {outputCount}</span>
            <span>{elapsedMs === null ? "--" : elapsedMs < 10 ? elapsedMs.toFixed(2) : elapsedMs.toFixed(0)} ms</span>
            <span>UTF-8</span>
            <span>{copy.local}</span>
          </div>
        </div>

        {definition.slug === "markdown-cleaner" && output ? (
          <div className="pulse-markdown-stats" aria-label={locale === "zh" ? "Markdown 清理统计" : "Markdown cleanup statistics"}>
            <span>{copy.before} <strong>{inputCount}</strong> {copy.character}</span>
            <span aria-hidden="true">→</span>
            <span>{copy.after} <strong>{outputCount}</strong> {copy.character}</span>
            <small>({copy.removed} <strong>{markdownRemoved}</strong> {copy.markers})</small>
          </div>
        ) : null}

        {jsonSummary && jsonStructureStats ? (
          <div className="pulse-json-stats" aria-label={locale === "zh" ? "JSON 结构摘要" : "JSON structure summary"}>
            <span>{copy.objects}: <strong>{jsonStructureStats.objects}</strong></span>
            <span>{copy.keyValues}: <strong>{jsonStructureStats.keyValuePairs}</strong></span>
            <span>{copy.arrays}: <strong>{jsonStructureStats.arrays}</strong></span>
            <small>{jsonSummary.depth} {locale === "zh" ? "层深度" : "levels deep"}</small>
          </div>
        ) : null}
      </section>
    </motion.section>
  );
}

export function ToolWorkspace({ definition, seoContent }: { definition: ToolDefinition; seoContent?: ReactNode }) {
  return (
    <PulseShell activeNavigation="workbench" activeTool={definition.slug}>
      <ToolWorkspaceContent key={definition.slug} definition={definition} />
      {seoContent}
    </PulseShell>
  );
}
