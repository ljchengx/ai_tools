"use client";

import Link from "next/link";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { toolDefinitions } from "@/lib/tools/registry";

import { PulseShell } from "./pulse-shell";
import { ToolIcon } from "./tool-icon";

const productPrinciples = [
  {
    label: "无需登录",
    detail: "打开即用，不建立账号体系。",
  },
  {
    label: "本地处理",
    detail: "文本和图片不上传到服务器。",
  },
  {
    label: "始终免费",
    detail: "当前工具无需付费即可使用。",
  },
];

export function HomeExperience() {
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <PulseShell surface="home">
      <div className="zhiye-product-home">
        <header className="zhiye-product-nav">
          <Link href="/" className="zhiye-product-brand" aria-label="知页首页">
            知页
          </Link>
          <nav aria-label="首页导航">
            <a href="#about">关于知页</a>
            <a href="#principles">产品原则</a>
            <Link href="/tools">工作台</Link>
          </nav>
          <Link href="/tools" className="zhiye-product-nav__cta">
            进入工作台
            <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
          </Link>
        </header>

        <main>
          <section className="zhiye-product-hero" id="about" aria-labelledby="home-title">
            <motion.div
              className="zhiye-product-hero__copy"
              initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.44 }}
            >
              <p className="zhiye-product-kicker">知页 / 浏览器本地工具</p>
              <h1 id="home-title">
                把琐碎处理，<br />
                留在<span>这一页</span>。
              </h1>
              <p>
                知页为文本、数据与图片准备了一组轻量工具。
                不必注册，不必上传，在浏览器里把手边的问题处理完。
              </p>
              <div className="zhiye-product-hero__actions">
                <Link href="/tools" className="zhiye-product-primary">
                  进入工作台
                  <ArrowRight aria-hidden="true" size={17} strokeWidth={1.85} />
                </Link>
                <a href="#principles" className="zhiye-product-secondary">了解知页</a>
              </div>
              <ul aria-label="知页产品承诺">
                {productPrinciples.map((principle) => (
                  <li key={principle.label}>
                    <Check aria-hidden="true" size={14} strokeWidth={2.1} />
                    {principle.label}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="zhiye-product-hero__visual"
              initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : 0.08 }}
              aria-hidden="true"
            >
              <img src="/studio-object-home.png" alt="" />
              <div className="zhiye-product-hero__note">
                <ShieldCheck size={18} strokeWidth={1.55} />
                <span>内容仅在你的浏览器中处理</span>
              </div>
            </motion.div>
          </section>

          <section className="zhiye-product-intro" aria-label="知页简介">
            <p>不是堆叠功能的工具站。</p>
            <h2>每一个工具，都只解决一个常见问题。</h2>
            <span>需要使用时进入工作台，选择工具后直接处理。</span>
          </section>

          <section className="zhiye-product-principles" id="principles" aria-labelledby="principles-title">
            <header>
              <p>产品原则</p>
              <h2 id="principles-title">少一点步骤，多一点确定性。</h2>
            </header>
            <div>
              {productPrinciples.map((principle, index) => (
                <article key={principle.label}>
                  <span>0{index + 1}</span>
                  <h3>{principle.label}</h3>
                  <p>{principle.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="zhiye-product-tools" aria-labelledby="tools-title">
            <header>
              <div>
                <p>工作台</p>
                <h2 id="tools-title">为手边的实际任务准备。</h2>
              </div>
              <Link href="/tools">
                查看全部工具
                <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
              </Link>
            </header>
            <div className="zhiye-product-tool-grid">
              {toolDefinitions.map((tool, index) => (
                <article key={tool.slug} className={`zhiye-product-tool-card zhiye-product-tool-card--${tool.accent}`}>
                  <Link href={`/tools/${tool.slug}`} aria-label={`打开${tool.title}`}>
                    <span className="zhiye-product-tool-card__number">0{index + 1}</span>
                    <span className="zhiye-product-tool-card__icon"><ToolIcon name={tool.icon} size={24} strokeWidth={1.45} /></span>
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>
                    <span className="zhiye-product-tool-card__action">
                      打开工具
                      <ArrowRight aria-hidden="true" size={16} strokeWidth={1.8} />
                    </span>
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="zhiye-product-cta" aria-labelledby="cta-title">
            <div>
              <p>准备开始</p>
              <h2 id="cta-title">从一个具体问题开始。</h2>
              <span>打开工作台，选择所需工具，即刻处理。</span>
            </div>
            <Link href="/tools">
              进入工作台
              <ArrowRight aria-hidden="true" size={17} strokeWidth={1.85} />
            </Link>
          </section>
        </main>

        <footer className="zhiye-product-footer">
          <span>知页</span>
          <p>聪明处理，止于本页。</p>
          <small>浏览器本地工具</small>
        </footer>
      </div>
    </PulseShell>
  );
}
