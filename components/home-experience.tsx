"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Command, Search, Sparkles, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { readRecentTools } from "@/lib/recent-tools";
import { getToolBySlug, searchTools, toolDefinitions, type ToolDefinition, type ToolSlug } from "@/lib/tools/registry";

import { PulseShell, usePulseLocale } from "./pulse-shell";
import { ToolIcon } from "./tool-icon";

const previewCopy: Record<ToolSlug, { input: string; output: string }> = {
  base64: {
    input: "你好，Pulse",
    output: "5L2g5aW977yMUHVsc2U=",
  },
  "json-formatter": {
    input: '{"ready":true,"space":"local"}',
    output: '{\n  "ready": true,\n  "space": "local"\n}',
  },
  "markdown-cleaner": {
    input: "**保留** [文字](#)",
    output: "保留 文字",
  },
  "image-watermark": {
    input: "身份证图片",
    output: "仅供办理业务使用",
  },
};

const homeCopy = {
  zh: {
    eyebrow: "本地运行 / 文本工作台",
    title: "把每一段文字，安放成可用的形状。",
    lede: "为高频文本处理留出一张安静的桌面。输入不离开浏览器，结果随时可以带走。",
    search: "搜索工具或输入关键词",
    clear: "清空搜索",
    command: "K",
    directory: "工具抽屉",
    directoryNote: "四件常用的数字文具",
    noResults: "没有找到相符的工具",
    open: "打开",
    recent: "最近使用",
    local: "全部处理都留在此设备上",
    sample: "即时预览",
    input: "输入",
    output: "输出",
    useTool: "使用此工具",
  },
  en: {
    eyebrow: "MORNING DESK / LOCAL",
    title: "Give every piece of text a useful form.",
    lede: "A calm desk for frequent text work. Your input stays in the browser and the result leaves with you.",
    search: "Search a tool or keyword",
    clear: "Clear search",
    command: "K",
    directory: "Tool drawer",
    directoryNote: "Three small instruments for text",
    noResults: "No matching tool",
    open: "Open",
    recent: "Recent",
    local: "Everything is processed on this device",
    sample: "Live preview",
    input: "Input",
    output: "Output",
    useTool: "Use this tool",
  },
} as const;

function toolTitle(tool: ToolDefinition, locale: "zh" | "en") {
  return locale === "zh" ? tool.title : tool.titleEn;
}

function toolDescription(tool: ToolDefinition, locale: "zh" | "en") {
  return locale === "zh" ? tool.description : tool.descriptionEn;
}

function toolCategory(tool: ToolDefinition, locale: "zh" | "en") {
  return locale === "zh" ? tool.category : tool.categoryEn;
}

function ToolPreview({ tool }: { tool: ToolDefinition }) {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];
  const sample = previewCopy[tool.slug];
  const previewIndex = Math.max(0, toolDefinitions.findIndex((item) => item.slug === tool.slug));

  return (
    <aside className={`pulse-preview pulse-preview--${tool.accent}`} aria-label={`${copy.sample} ${toolTitle(tool, locale)}`}>
      <div className="pulse-preview__header">
        <span>{copy.sample}</span>
      </div>
      <div className="pulse-preview__title">
        <span><ToolIcon name={tool.icon} size={18} strokeWidth={1.55} /></span>
        <strong>{toolTitle(tool, locale)}</strong>
      </div>
      <div className="pulse-preview__sample">
        <div>
          <span>{copy.input}</span>
          <code>{sample.input}</code>
        </div>
        <ArrowRight aria-hidden="true" size={17} strokeWidth={1.7} />
        <div>
          <span>{copy.output}</span>
          <code>{sample.output}</code>
        </div>
      </div>
      <div className="pulse-preview__footer">
        <div className="pulse-preview__dots" aria-label={`${previewIndex + 1} / ${toolDefinitions.length}`}>
          {toolDefinitions.map((item, index) => (
            <span key={item.slug} className={index === previewIndex ? "is-active" : ""} />
          ))}
        </div>
      </div>
    </aside>
  );
}

function ToolCard({
  tool,
  index,
  active,
  onActivate,
}: {
  tool: ToolDefinition;
  index: number;
  active: boolean;
  onActivate: (slug: ToolSlug) => void;
}) {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];

  return (
    <motion.li
      className={`pulse-tool-card pulse-tool-card--${tool.accent} ${active ? "is-active" : ""}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        aria-label={toolTitle(tool, locale)}
        onFocus={() => onActivate(tool.slug)}
        onMouseEnter={() => onActivate(tool.slug)}
      >
        <span className="pulse-tool-card__index">{String(index + 1).padStart(2, "0")}</span>
        <span className="pulse-tool-card__icon"><ToolIcon name={tool.icon} size={22} strokeWidth={1.5} /></span>
        <span className="pulse-tool-card__copy">
          <strong>{toolTitle(tool, locale)}</strong>
          <small>{toolDescription(tool, locale)}</small>
        </span>
        <span className="pulse-tool-card__meta">{toolCategory(tool, locale)}</span>
        <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.7} />
        <span className="sr-only">{copy.open}</span>
      </Link>
    </motion.li>
  );
}

function PulseHomeContent() {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<ToolSlug>(toolDefinitions[0].slug);
  const [recentSlugs, setRecentSlugs] = useState<ToolSlug[]>([]);
  const [clock, setClock] = useState("--:--");
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();
  const visibleTools = useMemo(() => searchTools(query), [query]);
  const activeTool = getToolBySlug(activeSlug) ?? visibleTools[0] ?? toolDefinitions[0];
  const recentTools = recentSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((tool): tool is ToolDefinition => Boolean(tool));

  useEffect(() => {
    setRecentSlugs(readRecentTools());

    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const updateClock = () => setClock(formatter.format(new Date()));
    updateClock();
    const timer = window.setInterval(updateClock, 60_000);
    return () => window.clearInterval(timer);
  }, [locale]);

  useEffect(() => {
    if (visibleTools[0]) {
      setActiveSlug(visibleTools[0].slug);
    }
  }, [visibleTools]);

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <section className="pulse-home" aria-labelledby="home-title">
      <div className="pulse-home__topline">
        <span>{copy.local}</span>
        <span>{clock}</span>
      </div>

      <section className="pulse-introduction">
        <div className="pulse-introduction__light" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <motion.div
          className="pulse-introduction__copy"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
        >
          <p className="pulse-eyebrow"><Sparkles aria-hidden="true" size={14} strokeWidth={1.7} />{copy.eyebrow}</p>
          <h1 id="home-title">
            <span className="pulse-title-kicker">PULSE</span>
            {locale === "zh" ? (
              <>
                <span className="pulse-title-line">把每一段文字，</span>
                <span className="pulse-title-line">安放成可用的形状。</span>
              </>
            ) : copy.title}
          </h1>
          <p>{copy.lede}</p>

          <label className="pulse-search" htmlFor="tool-search">
            <Search aria-hidden="true" size={18} strokeWidth={1.7} />
            <input
              ref={inputRef}
              id="tool-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              autoComplete="off"
            />
            {query ? (
              <button type="button" onClick={clearQuery} aria-label={copy.clear} title={copy.clear}>
                <X aria-hidden="true" size={16} strokeWidth={1.8} />
              </button>
            ) : (
              <span aria-hidden="true"><Command size={13} strokeWidth={1.8} />{copy.command}</span>
            )}
          </label>
        </motion.div>

        <motion.div
          className="pulse-introduction__preview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3, delay: 0.08 }}
        >
          <ToolPreview tool={activeTool} />
        </motion.div>
      </section>

      <section className="pulse-tool-drawer" aria-labelledby="tool-drawer-title">
        <div className="pulse-section-heading">
          <div>
            <p>{copy.directory}</p>
            <h2 id="tool-drawer-title">{copy.directoryNote}</h2>
          </div>
          <span>{String(visibleTools.length).padStart(2, "0")} / {String(toolDefinitions.length).padStart(2, "0")}</span>
        </div>

        <ol className="tool-launcher-list pulse-tool-grid" aria-label={copy.directory}>
          {visibleTools.length ? (
            visibleTools.map((tool, index) => (
              <ToolCard
                key={tool.slug}
                tool={tool}
                index={index}
                active={tool.slug === activeTool.slug}
                onActivate={setActiveSlug}
              />
            ))
          ) : (
            <li className="pulse-tool-empty">{copy.noResults}</li>
          )}
        </ol>
      </section>

      {recentTools.length ? (
        <aside className="pulse-recent" aria-label={copy.recent}>
          <span>{copy.recent}</span>
          <div>
            {recentTools.map((tool) => (
              <Link href={`/tools/${tool.slug}`} key={tool.slug}>
                {locale === "zh" ? tool.shortTitle : tool.shortTitleEn}
                <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.9} />
              </Link>
            ))}
          </div>
        </aside>
      ) : null}
    </section>
  );
}

export function HomeExperience() {
  return (
    <PulseShell>
      <PulseHomeContent />
    </PulseShell>
  );
}
