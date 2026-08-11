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

import { BrandMark } from "./brand-mark";
import { PulseShell, usePulseLocale } from "./pulse-shell";
import { ToolIcon } from "./tool-icon";

const specimenCopy: Record<ToolSlug, { input: string; output: string }> = {
  base64: {
    input: "你好，知页",
    output: "5L2g5aW977yMUHVsc2U=",
  },
  "json-formatter": {
    input: '{"local":true,"ready":true}',
    output: '{\n  "local": true,\n  "ready": true\n}',
  },
  "markdown-cleaner": {
    input: "**保留** [内容](#)",
    output: "保留 内容",
  },
  "image-watermark": {
    input: "身份证图片",
    output: "仅供办理业务使用",
  },
};

const homeCopy = {
  zh: {
    eyebrow: "AI 时代的浏览器本地工具箱",
    title: "知页",
    tagline: "聪明处理，止于本页。",
    lede: "免费处理文本、数据与图片。无需登录，内容不上传，打开浏览器就能完成手边的小事。",
    search: "搜索工具或使用场景",
    clear: "清空搜索",
    command: "K",
    free: "免费使用",
    noAccount: "无需登录",
    local: "本地处理",
    tools: "工具索引",
    toolsNote: "从一个具体问题开始",
    noResults: "没有匹配的工具。试试“编码”“JSON”“清理”或“水印”。",
    open: "打开工具",
    recent: "最近使用",
    live: "实时样本",
    localTag: "LOCAL / 00ms",
    input: "输入",
    output: "结果",
    localTitle: "内容不需要离开设备",
    localBody: "知页直接使用浏览器能力完成处理。没有账号、没有上传步骤，也不会保存你输入的原始内容。",
    localPoints: ["页面打开后，断网也能继续处理", "敏感证件图片不会上传", "关闭页面后不保留原始输入"],
    scenesTitle: "为反复出现的小问题，留一条短路径",
    scenes: [
      ["接口调试", "整理和校验 JSON 数据"],
      ["AI 文本", "去除 Markdown 标记"],
      ["证件提交", "添加用途限定水印"],
      ["编码转换", "处理 UTF-8 Base64"],
    ],
    contact: "联系知页",
    footer: "知页始终免费开放当前工具",
    footerNote: "不注册，不上传，不追踪你的输入。",
    navLocal: "为什么本地",
    navContact: "联系",
    direct: "直接使用",
  },
  en: {
    eyebrow: "A LOCAL TOOLBOX FOR THE AI ERA",
    title: "ZHIYE",
    tagline: "Smart work. Kept on this page.",
    lede: "Free tools for text, data and images. No account, no upload, just a shorter path through the task in front of you.",
    search: "Search a tool or use case",
    clear: "Clear search",
    command: "K",
    free: "Free to use",
    noAccount: "No account",
    local: "Local processing",
    tools: "Tool index",
    toolsNote: "Start with the problem in front of you",
    noResults: "No tool matches. Try “encode”, “JSON”, “clean” or “watermark”.",
    open: "Open tool",
    recent: "Recently used",
    live: "Live specimen",
    localTag: "LOCAL / 00ms",
    input: "Input",
    output: "Result",
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
    contact: "Contact ZHIYE",
    footer: "Every current ZHIYE tool is free",
    footerNote: "No sign-up, no upload, no tracking of your input.",
    navLocal: "Why local",
    navContact: "Contact",
    direct: "Use a tool",
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

function LiveSpecimen({ tool }: { tool: ToolDefinition }) {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];
  const sample = specimenCopy[tool.slug];

  return (
    <section className={`zhiye-specimen zhiye-specimen--${tool.accent}`} aria-label={`${copy.live}：${toolTitle(tool, locale)}`}>
      <header className="zhiye-specimen__header">
        <span>{copy.live}</span>
        <strong>{copy.localTag}</strong>
      </header>

      <div className="zhiye-specimen__body">
        <div className="zhiye-specimen__index" aria-hidden="true">
          <span>01</span>
          <i />
          <span>04</span>
        </div>
        <div className="zhiye-specimen__sheet">
          <div className="zhiye-specimen__tool">
            <span><ToolIcon name={tool.icon} size={17} strokeWidth={1.5} /></span>
            <strong>{toolTitle(tool, locale)}</strong>
            <small>{toolCategory(tool, locale)}</small>
          </div>
          <div className="zhiye-specimen__row">
            <small>{copy.input}</small>
            <code>{sample.input}</code>
          </div>
          <div className="zhiye-specimen__separator"><span /></div>
          <div className="zhiye-specimen__row zhiye-specimen__row--output">
            <small>{copy.output}</small>
            <code>{sample.output}</code>
          </div>
        </div>
      </div>

      <footer className="zhiye-specimen__footer">
        <span>RAW</span>
        <ArrowRight aria-hidden="true" size={13} />
        <span>LOCAL</span>
        <ArrowRight aria-hidden="true" size={13} />
        <span>READY</span>
        <i aria-hidden="true" />
      </footer>
    </section>
  );
}

function ToolIndexRow({
  tool,
  index,
  active,
  onActivate,
  reducedMotion,
}: {
  tool: ToolDefinition;
  index: number;
  active: boolean;
  onActivate: (slug: ToolSlug) => void;
  reducedMotion: boolean;
}) {
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];

  return (
    <motion.li
      className={`zhiye-index-row zhiye-index-row--${tool.accent} ${active ? "is-active" : ""}`}
      initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.3, delay: reducedMotion ? 0 : index * 0.04 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        aria-label={`${copy.open}：${toolTitle(tool, locale)}`}
        onFocus={() => onActivate(tool.slug)}
        onMouseEnter={() => onActivate(tool.slug)}
      >
        <span className="zhiye-index-row__number">{String(index + 1).padStart(2, "0")}</span>
        <span className="zhiye-index-row__icon"><ToolIcon name={tool.icon} size={21} strokeWidth={1.45} /></span>
        <span className="zhiye-index-row__copy">
          <small>{toolCategory(tool, locale)}</small>
          <strong>{toolTitle(tool, locale)}</strong>
          <span>{toolDescription(tool, locale)}</span>
        </span>
        <span className="zhiye-index-row__action">{copy.open}<ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.6} /></span>
      </Link>
    </motion.li>
  );
}

function HomeContent() {
  const { locale, setLocale } = usePulseLocale();
  const copy = homeCopy[locale];
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState<ToolSlug>(toolDefinitions[0].slug);
  const [recentSlugs, setRecentSlugs] = useState<ToolSlug[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
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
    <div className="zhiye-homepage">
      <header className="zhiye-home-header">
        <Link className="zhiye-home-header__brand" href="/" aria-label="知页首页">
          <BrandMark size={30} />
          <span><strong>知页</strong><small>ZHIYE / LOCAL DESK</small></span>
        </Link>
        <nav className="zhiye-home-header__nav" aria-label="首页导航">
          <a href="#tools">{copy.tools}</a>
          <a href="#local">{copy.navLocal}</a>
          <a href="#contact">{copy.navContact}</a>
        </nav>
        <div className="zhiye-home-header__actions">
          <button
            type="button"
            className="zhiye-home-header__locale"
            onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
            aria-label={locale === "zh" ? "Switch to English" : "切换至中文"}
          >
            {locale === "zh" ? "中 / EN" : "EN / 中"}
          </button>
          <Link href="/tools/base64" className="zhiye-home-header__direct">{copy.direct}<ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.7} /></Link>
        </div>
      </header>

      <main>
        <section className="zhiye-home-hero" aria-labelledby="home-title">
          <motion.div
            className="zhiye-home-hero__copy"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.42 }}
          >
            <p className="zhiye-home-hero__eyebrow"><span aria-hidden="true" />{copy.eyebrow}</p>
            <h1 id="home-title">{copy.title}</h1>
            <p className="zhiye-home-hero__tagline">{copy.tagline}</p>
            <p className="zhiye-home-hero__lede">{copy.lede}</p>

            <label className="zhiye-home-search" htmlFor="tool-search">
              <Search aria-hidden="true" size={19} strokeWidth={1.65} />
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

            <ul className="zhiye-home-proof" aria-label={`${copy.free}、${copy.noAccount}、${copy.local}`}>
              <li><BadgeCheck aria-hidden="true" size={16} />{copy.free}</li>
              <li><UserRoundCheck aria-hidden="true" size={16} />{copy.noAccount}</li>
              <li><ShieldCheck aria-hidden="true" size={16} />{copy.local}</li>
            </ul>
          </motion.div>

          <motion.div
            className="zhiye-home-hero__specimen"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : 0.08 }}
          >
            <LiveSpecimen tool={activeTool} />
          </motion.div>
        </section>

        <section className="zhiye-home-tools" id="tools" aria-labelledby="tool-index-title">
          <header className="zhiye-home-section-heading">
            <div>
              <p>{copy.tools}</p>
              <h2 id="tool-index-title">{copy.toolsNote}</h2>
            </div>
            <span>{String(visibleTools.length).padStart(2, "0")} / {String(toolDefinitions.length).padStart(2, "0")}</span>
          </header>

          <ol className="zhiye-index-list" aria-label={copy.tools}>
            {visibleTools.length ? (
              visibleTools.map((tool, index) => (
                <ToolIndexRow
                  key={tool.slug}
                  tool={tool}
                  index={index}
                  active={tool.slug === activeTool.slug}
                  onActivate={setActiveSlug}
                  reducedMotion={reducedMotion}
                />
              ))
            ) : (
              <li className="zhiye-index-empty">{copy.noResults}</li>
            )}
          </ol>

          {recentTools.length ? (
            <aside className="zhiye-home-recent" aria-label={copy.recent}>
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

        <section className="zhiye-home-local" id="local" aria-labelledby="local-title">
          <div className="zhiye-home-local__statement">
            <p>LOCAL BY DESIGN</p>
            <h2 id="local-title">{copy.localTitle}</h2>
            <span>{copy.localBody}</span>
          </div>
          <ol className="zhiye-home-local__points">
            {copy.localPoints.map((point, index) => (
              <li key={point}><span>0{index + 1}</span>{point}</li>
            ))}
          </ol>
        </section>

        <section className="zhiye-home-scenes" aria-labelledby="scenes-title">
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
      </main>

      <footer className="zhiye-home-footer" id="contact">
        <div className="zhiye-home-footer__brand">
          <BadgeCheck aria-hidden="true" size={19} strokeWidth={1.55} />
          <strong>{copy.footer}</strong>
          <p>{copy.footerNote}</p>
        </div>
        <div className="zhiye-home-footer__contact">
          <span>{copy.contact}</span>
          <a href="mailto:EverettStone1990@gmail.com"><Mail aria-hidden="true" size={15} strokeWidth={1.65} />EverettStone1990@gmail.com</a>
          <a href="https://github.com/ljchengx" target="_blank" rel="noreferrer"><GitBranch aria-hidden="true" size={15} strokeWidth={1.65} />github.com/ljchengx</a>
        </div>
        <small>© {new Date().getFullYear()} ZHIYE</small>
      </footer>
    </div>
  );
}

export function HomeExperience() {
  return (
    <PulseShell surface="home">
      <HomeContent />
    </PulseShell>
  );
}
