"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Command,
  GitBranch,
  Mail,
  Search,
  ShieldCheck,
  UserRoundCheck,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { readRecentTools } from "@/lib/recent-tools";
import { getToolBySlug, searchTools, toolDefinitions, type ToolDefinition, type ToolSlug } from "@/lib/tools/registry";

import { PulseShell, usePulseLocale } from "./pulse-shell";
import { ToolIcon } from "./tool-icon";

const homeCopy = {
  zh: {
    eyebrow: "AI 时代的浏览器本地工具箱",
    title: "知页",
    tagline: "聪明处理，止于本页。",
    lede: "免费的浏览器本地工具箱。处理文本、数据与图片，无需把内容交给任何服务器。",
    search: "搜索工具，或输入“格式化 JSON”",
    clear: "清空搜索",
    command: "K",
    promises: ["免费使用", "无需登录", "本地处理"],
    directory: "全部工具",
    directoryNote: "从一个具体问题开始",
    noResults: "暂时没有匹配的工具，试试“编码”“JSON”“清理”或“水印”。",
    open: "打开工具",
    recent: "最近使用",
    signalInput: "你的内容",
    signalLocal: "仅在浏览器",
    signalOutput: "处理完成",
    signalStatus: "本地处理路径",
    localTitle: "内容不需要离开设备",
    localBody: "知页直接使用浏览器能力完成处理。没有账号、没有上传步骤，也不会保存你输入的原始内容。",
    localPoints: ["断网仍可继续处理已打开的页面", "敏感证件图片无需上传", "关闭页面后不保留输入内容"],
    scenesTitle: "为反复出现的小问题，留一条短路径",
    scenes: [
      ["接口调试", "整理和校验 JSON 数据"],
      ["AI 文本", "去除 Markdown 标记"],
      ["证件提交", "添加用途限定水印"],
      ["编码转换", "处理 UTF-8 Base64"],
    ],
    footer: "知页始终免费开放当前工具",
    footerNote: "不注册，不上传，不追踪你的输入。",
    contact: "联系知页",
  },
  en: {
    eyebrow: "A LOCAL TOOLBOX FOR THE AI ERA",
    title: "ZHIYE",
    tagline: "Smart work. Kept on this page.",
    lede: "A free, browser-local toolbox for text, data and images. Your content never needs to reach a server.",
    search: "Search tools, or try “format JSON”",
    clear: "Clear search",
    command: "K",
    promises: ["Free to use", "No account", "Local processing"],
    directory: "All tools",
    directoryNote: "Start with the problem in front of you",
    noResults: "No tool matches yet. Try “encode”, “JSON”, “clean” or “watermark”.",
    open: "Open tool",
    recent: "Recently used",
    signalInput: "Your content",
    signalLocal: "In your browser",
    signalOutput: "Ready",
    signalStatus: "Local processing path",
    localTitle: "Your content stays on your device",
    localBody: "ZHIYE uses browser capabilities directly. There is no account, upload step, or storage of your original input.",
    localPoints: ["Keep working offline after the page loads", "Sensitive document images are never uploaded", "Input is discarded when you close the page"],
    scenesTitle: "A shorter path through recurring small tasks",
    scenes: [
      ["API debugging", "Format and validate JSON"],
      ["AI writing", "Remove Markdown syntax"],
      ["Document sharing", "Add a purpose watermark"],
      ["Encoding", "Convert UTF-8 Base64"],
    ],
    footer: "Every current ZHIYE tool is free",
    footerNote: "No sign-up, no upload, no tracking of your input.",
    contact: "Contact ZHIYE",
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

function LocalSignal({ tool }: { tool: ToolDefinition }) {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];

  return (
    <div className={`zhiye-signal zhiye-signal--${tool.accent}`} aria-label={`${copy.signalStatus}：${toolTitle(tool, locale)}`}>
      <div className="zhiye-signal__caption">
        <span>{copy.signalStatus}</span>
        <strong>LOCAL / 00ms</strong>
      </div>

      <div className="zhiye-signal__stage" aria-hidden="true">
        <span className="zhiye-signal__line zhiye-signal__line--top" />
        <span className="zhiye-signal__line zhiye-signal__line--diagonal" />
        <span className="zhiye-signal__line zhiye-signal__line--bottom" />
        <span className="zhiye-signal__runner" />

        <div className="zhiye-signal__node zhiye-signal__node--input">
          <i />
          <span>{copy.signalInput}</span>
        </div>
        <div className="zhiye-signal__node zhiye-signal__node--tool">
          <ToolIcon name={tool.icon} size={23} strokeWidth={1.45} />
          <span>{locale === "zh" ? tool.shortTitle : tool.shortTitleEn}</span>
        </div>
        <div className="zhiye-signal__node zhiye-signal__node--local">
          <ShieldCheck size={22} strokeWidth={1.45} />
          <span>{copy.signalLocal}</span>
        </div>
        <div className="zhiye-signal__node zhiye-signal__node--output">
          <i />
          <span>{copy.signalOutput}</span>
        </div>
      </div>

      <div className="zhiye-signal__foot">
        <span>INPUT</span>
        <ArrowRight aria-hidden="true" size={14} />
        <span>LOCAL PROCESS</span>
        <ArrowRight aria-hidden="true" size={14} />
        <span>OUTPUT</span>
      </div>
    </div>
  );
}

function ToolCard({
  tool,
  active,
  onActivate,
}: {
  tool: ToolDefinition;
  active: boolean;
  onActivate: (slug: ToolSlug) => void;
}) {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];

  return (
    <li className={`zhiye-tool-card zhiye-tool-card--${tool.accent} ${active ? "is-active" : ""}`}>
      <Link
        href={`/tools/${tool.slug}`}
        aria-label={`${copy.open}：${toolTitle(tool, locale)}`}
        onFocus={() => onActivate(tool.slug)}
        onMouseEnter={() => onActivate(tool.slug)}
      >
        <span className="zhiye-tool-card__icon"><ToolIcon name={tool.icon} size={24} strokeWidth={1.45} /></span>
        <span className="zhiye-tool-card__copy">
          <small>{toolCategory(tool, locale)}</small>
          <strong>{toolTitle(tool, locale)}</strong>
          <span>{toolDescription(tool, locale)}</span>
        </span>
        <ArrowUpRight className="zhiye-tool-card__arrow" aria-hidden="true" size={19} strokeWidth={1.6} />
      </Link>
    </li>
  );
}

function HomeContent() {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<ToolSlug>(toolDefinitions[0].slug);
  const [recentSlugs, setRecentSlugs] = useState<ToolSlug[]>([]);
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
    if (visibleTools[0]) {
      setActiveSlug(visibleTools[0].slug);
    }
  }, [visibleTools]);

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="zhiye-home">
      <section className="zhiye-hero" aria-labelledby="home-title">
        <motion.div
          className="zhiye-hero__copy"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.42 }}
        >
          <p className="zhiye-hero__eyebrow"><span aria-hidden="true" />{copy.eyebrow}</p>
          <h1 id="home-title">{copy.title}</h1>
          <p className="zhiye-hero__tagline">{copy.tagline}</p>
          <p className="zhiye-hero__lede">{copy.lede}</p>

          <label className="zhiye-search" htmlFor="tool-search">
            <Search aria-hidden="true" size={20} strokeWidth={1.65} />
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
                <X aria-hidden="true" size={17} strokeWidth={1.8} />
              </button>
            ) : (
              <span aria-hidden="true"><Command size={13} strokeWidth={1.8} />{copy.command}</span>
            )}
          </label>

          <ul className="zhiye-promises" aria-label={copy.promises.join("、")}>
            <li><BadgeCheck aria-hidden="true" size={16} />{copy.promises[0]}</li>
            <li><UserRoundCheck aria-hidden="true" size={16} />{copy.promises[1]}</li>
            <li><ShieldCheck aria-hidden="true" size={16} />{copy.promises[2]}</li>
          </ul>
        </motion.div>

        <motion.div
          className="zhiye-hero__signal"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.08 }}
        >
          <LocalSignal tool={activeTool} />
        </motion.div>
      </section>

      <section className="zhiye-tools" aria-labelledby="tool-directory-title">
        <header className="zhiye-section-heading">
          <div>
            <p>{copy.directory}</p>
            <h2 id="tool-directory-title">{copy.directoryNote}</h2>
          </div>
          <span>{visibleTools.length} / {toolDefinitions.length}</span>
        </header>

        <ul className="zhiye-tool-grid" aria-label={copy.directory}>
          {visibleTools.length ? (
            visibleTools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} active={tool.slug === activeTool.slug} onActivate={setActiveSlug} />
            ))
          ) : (
            <li className="zhiye-tool-empty">{copy.noResults}</li>
          )}
        </ul>

        {recentTools.length ? (
          <aside className="zhiye-recent" aria-label={copy.recent}>
            <span>{copy.recent}</span>
            {recentTools.map((tool) => (
              <Link href={`/tools/${tool.slug}`} key={tool.slug}>
                {locale === "zh" ? tool.shortTitle : tool.shortTitleEn}
                <ArrowUpRight aria-hidden="true" size={13} strokeWidth={1.8} />
              </Link>
            ))}
          </aside>
        ) : null}
      </section>

      <section className="zhiye-local" aria-labelledby="local-title">
        <div className="zhiye-local__statement">
          <p>LOCAL BY DESIGN</p>
          <h2 id="local-title">{copy.localTitle}</h2>
          <span>{copy.localBody}</span>
        </div>
        <ol className="zhiye-local__points">
          {copy.localPoints.map((point, index) => (
            <li key={point}><span>0{index + 1}</span>{point}</li>
          ))}
        </ol>
      </section>

      <section className="zhiye-scenes" aria-labelledby="scenes-title">
        <h2 id="scenes-title">{copy.scenesTitle}</h2>
        <div>
          {copy.scenes.map(([title, description]) => (
            <article key={title}>
              <strong>{title}</strong>
              <span>{description}</span>
            </article>
          ))}
        </div>
      </section>

      <footer className="zhiye-footer">
        <div className="zhiye-footer__brand">
          <BadgeCheck aria-hidden="true" size={20} strokeWidth={1.55} />
          <strong>{copy.footer}</strong>
        </div>
        <p>{copy.footerNote}</p>
        <div className="zhiye-footer__side">
          <span className="zhiye-footer__contact-label">{copy.contact}</span>
          <nav className="zhiye-footer__contact" aria-label={copy.contact}>
            <a href="mailto:EverettStone1990@gmail.com">
              <Mail aria-hidden="true" size={15} strokeWidth={1.65} />
              <span>EverettStone1990@gmail.com</span>
            </a>
            <a href="https://github.com/ljchengx" target="_blank" rel="noreferrer">
              <GitBranch aria-hidden="true" size={15} strokeWidth={1.65} />
              <span>github.com/ljchengx</span>
            </a>
          </nav>
          <small>© {new Date().getFullYear()} ZHIYE</small>
        </div>
      </footer>
    </div>
  );
}

export function HomeExperience() {
  return (
    <PulseShell>
      <HomeContent />
    </PulseShell>
  );
}
