"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  GitBranch,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

import { readRecentTools } from "@/lib/recent-tools";
import { getToolBySlug, toolDefinitions, type ToolDefinition, type ToolSlug } from "@/lib/tools/registry";

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
  const { locale } = usePulseLocale();
  const copy = homeCopy[locale];
  const [activeSlug, setActiveSlug] = useState<ToolSlug>(toolDefinitions[0].slug);
  const [recentSlugs, setRecentSlugs] = useState<ToolSlug[]>([]);
  const reducedMotion = useReducedMotion() ?? false;
  const visibleTools = toolDefinitions;
  const activeTool = getToolBySlug(activeSlug) ?? visibleTools[0] ?? toolDefinitions[0];
  const recentTools = recentSlugs
    .map((slug) => getToolBySlug(slug))
    .filter((tool): tool is ToolDefinition => Boolean(tool));

  useEffect(() => {
    setRecentSlugs(readRecentTools());
  }, []);

  useEffect(() => {
    if (visibleTools[0]) {
      setActiveSlug(visibleTools[0].slug);
    }
  }, [visibleTools]);

  const heroTitle = locale === "zh" ? (
    <>
      让工具，
      <br />
      回归<span>思考</span>本身
    </>
  ) : (
    <>
      Tools that
      <br />
      return to <span>thought</span>
    </>
  );
  const cards = visibleTools.length ? visibleTools : toolDefinitions;

  return (
    <div className="zhiye-homepage">
      <section className="zhiye-home-hero" aria-labelledby="home-title">
        <motion.div
          className="zhiye-home-hero__copy"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.42 }}
        >
          <p className="zhiye-home-hero__eyebrow">
            <span>{locale === "zh" ? "化繁为简 · 提升效率 · 创造更多可能" : "Simplify · Focus · Create more"}</span>
            <Sparkles aria-hidden="true" size={13} strokeWidth={1.6} />
          </p>
          <h1 id="home-title">{heroTitle}</h1>
          <p className="zhiye-home-hero__lede">
            {locale === "zh" ? "精心打造轻盈而强大的工具集，在这里，高效与美感并存" : "A quiet collection of capable tools, designed so speed and beauty can coexist."}
          </p>
          <div className="zhiye-home-hero__actions">
            <Link href="/tools/base64" className="zhiye-home-primary">
              {locale === "zh" ? "开始探索" : "Start exploring"}
              <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
            </Link>
            <a href="#tools" className="zhiye-home-play" aria-label={copy.tools}>
              <span><ArrowRight aria-hidden="true" size={14} strokeWidth={2} /></span>
              {locale === "zh" ? "查看工具" : "View tools"}
            </a>
          </div>
        </motion.div>

        <motion.div
          className="zhiye-home-hero__object"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.54, delay: reducedMotion ? 0 : 0.08 }}
          aria-hidden="true"
        >
          <img src="/studio-object-home.png" alt="" />
        </motion.div>
      </section>

      <section className="zhiye-home-tools" id="tools" aria-label={copy.tools}>
        {cards.map((tool, index) => (
          <motion.article
            className={`zhiye-tool-card zhiye-tool-card--${tool.accent}`}
            key={tool.slug}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.34, delay: reducedMotion ? 0 : index * 0.045 }}
            onMouseEnter={() => setActiveSlug(tool.slug)}
          >
            <Link href={`/tools/${tool.slug}`} aria-label={`${copy.open}：${toolTitle(tool, locale)}`}>
              <span className="zhiye-tool-card__icon"><ToolIcon name={tool.icon} size={26} strokeWidth={1.45} /></span>
              <strong>{toolTitle(tool, locale)}</strong>
              <small>{toolDescription(tool, locale)}</small>
              <span className="zhiye-tool-card__arrow"><ArrowRight aria-hidden="true" size={18} strokeWidth={1.65} /></span>
              <em aria-hidden="true">{tool.slug === "base64" ? "64" : tool.slug === "json-formatter" ? "{}" : tool.slug === "markdown-cleaner" ? "M↓" : "ID"}</em>
            </Link>
          </motion.article>
        ))}
      </section>

      <section className="zhiye-home-quote" aria-label={copy.footer}>
        <div>
          <span aria-hidden="true">知</span>
          <p>{locale === "zh" ? "知页把文本、数据和图片处理留在浏览器本地，打开页面就能完成手边的小事。" : "ZHIYE keeps text, data and image utilities in the browser, ready for the task in front of you."}</p>
          <small>{locale === "zh" ? "无需注册，不上传原始内容" : "No account. No upload of your original input."}</small>
        </div>
        <dl>
          <div><dt>{toolDefinitions.length}</dt><dd>{locale === "zh" ? "当前工具" : "Current tools"}</dd></div>
          <div><dt>{locale === "zh" ? "本地" : "Local"}</dt><dd>{copy.local}</dd></div>
          <div><dt>{locale === "zh" ? "无需" : "No"}</dt><dd>{copy.noAccount}</dd></div>
        </dl>
      </section>
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
