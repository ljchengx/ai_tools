"use client";

import {
  ArrowDown,
  ArrowRight,
  Check,
  Database,
  Flame,
  LockKeyhole,
  MessageCircleQuestion,
  NotebookPen,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import styles from "./chewsy-product-home.module.css";

type ScreenId = "home" | "record" | "universe" | "restaurant" | "history" | "data";

type Screen = {
  id: ScreenId;
  label: string;
  shortLabel: string;
  title: string;
  description: string;
  src: string;
  alt: string;
  icon: LucideIcon;
  color: "orange" | "pink" | "purple" | "lime";
  points: string[];
};

const screens: Screen[] = [
  {
    id: "home",
    label: "首页",
    shortLabel: "先回忆",
    title: "首页：先回忆，再决定",
    description: "首页不是推荐流，而是你的吃饭档案。搜店名或菜名，把上次的判断带回到今天。",
    src: "/chewsy/screens/home.png",
    alt: "好吃不 App 首页真机截图",
    icon: NotebookPen,
    color: "orange",
    points: ["搜索店名、菜名和上次的坑", "最近记录按时间回放", "从首页直接开始记一口"],
  },
  {
    id: "record",
    label: "记一口",
    shortLabel: "先判词",
    title: "记一口：先判词，再写理由",
    description: "先选种草、观望或踩雷，再补店名、菜名和理由。草稿会自动保存，不必在饭桌上一次写完。",
    src: "/chewsy/screens/record.png",
    alt: "好吃不 App 记一口页面真机截图",
    icon: Flame,
    color: "pink",
    points: ["三种判词，先留下最重要的判断", "支持多道菜、图片和短评", "草稿自动保存，随时继续"],
  },
  {
    id: "universe",
    label: "吃饭宇宙",
    shortLabel: "全量回放",
    title: "吃饭宇宙：把经历放在一起看",
    description: "按判词和月份筛选历史记录，想起某家店时，直接回看自己真实吃过什么。",
    src: "/chewsy/screens/universe.png",
    alt: "好吃不 App 吃饭宇宙真机截图",
    icon: Sparkles,
    color: "purple",
    points: ["全部、种草、观望、踩雷和本月筛选", "搜索我的店、菜和理由", "支持从种草记录里盲抽今晚吃啥"],
  },
  {
    id: "restaurant",
    label: "店铺历史",
    shortLabel: "看发生过什么",
    title: "店铺历史：不把记录变成结论",
    description: "同一家店的多次到店经历集中在一起。你看到的是发生过什么，而不是一个脱离上下文的分数。",
    src: "/chewsy/screens/restaurant-detail.png",
    alt: "好吃不 App 店铺历史真机截图",
    icon: Store,
    color: "lime",
    points: ["多次到店记录集中展示", "看见每次吃过的菜和理由", "原记录支持编辑和永久删除"],
  },
  {
    id: "history",
    label: "吃饭回放",
    shortLabel: "回看细节",
    title: "吃饭回放：记住当时为什么",
    description: "回到一顿饭的完整上下文，菜名、时间、图片、理由和短评都留在同一条经历里。",
    src: "/chewsy/screens/restaurant-history.png",
    alt: "好吃不 App 吃饭回放真机截图",
    icon: Search,
    color: "orange",
    points: ["按时间倒序查看真实经历", "一条记录支持多道菜", "不需要为每次用餐写长评"],
  },
  {
    id: "data",
    label: "数据中心",
    shortLabel: "随手管理",
    title: "数据中心：记录和图片都在这里",
    description: "离线优先的本地档案。需要换设备时，再导出一份备份，不把数据管理变成产品主线。",
    src: "/chewsy/screens/data-center.png",
    alt: "好吃不 App 数据中心真机截图",
    icon: Database,
    color: "pink",
    points: ["记录和图片都保存在本机", "支持本地备份和导入", "不接入账号、地图和统计 SDK"],
  },
];

const galleryScreens = [screens[0], screens[1], screens[2], screens[5]];

export function ChewsyProductHome() {
  const [activeScreenId, setActiveScreenId] = useState<ScreenId>("home");
  const activeScreen = screens.find((screen) => screen.id === activeScreenId) ?? screens[0];
  const ActiveIcon = activeScreen.icon;

  return (
    <div className={styles.site} id="top">
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="好吃不 Chewsy 首页">
          <span className={styles.brandMark} aria-hidden="true">
            <MessageCircleQuestion size={22} strokeWidth={2.4} />
          </span>
          <span className={styles.brandName}>
            <strong>好吃不</strong>
            <small>CHEWSY / APP PRODUCT</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label="产品主页导航">
          <a href="#product">产品画面</a>
          <a href="#record">记录流程</a>
          <a href="#data">离线数据</a>
        </nav>

        <div className={styles.headerTools}>
          <a
            className={styles.githubLink}
            href="https://github.com/ljchengx/Chewsy"
            target="_blank"
            rel="noreferrer"
            aria-label="在 GitHub 查看好吃不 Chewsy 源码"
            title="在 GitHub 查看好吃不 Chewsy 源码"
          >
            <img className={styles.githubIcon} src="/github-mark.svg" alt="" aria-hidden="true" />
          </a>
          <a className={styles.headerAction} href="#product">
            查看真实界面
            <ArrowRight size={16} strokeWidth={2.1} aria-hidden="true" />
          </a>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="chewsy-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>真实 App / 离线吃饭档案</p>
            <h1 id="chewsy-title">好吃不</h1>
            <h2>
              把每一次吃饭，
              <br />
              变成下一次的答案。
            </h2>
            <p className={styles.heroDescription}>
              记住每一次吃过的店，下次少踩一次雷。
              <br />
              不是大众评分，也不是美食推荐，只记录你自己的真实体验。
            </p>
            <a className={styles.primaryAction} href="#product">
              直接看产品界面
              <ArrowDown size={17} strokeWidth={2.2} aria-hidden="true" />
            </a>
            <div className={styles.heroProof} aria-label="产品特征">
              <span><Check size={14} strokeWidth={2.5} aria-hidden="true" />Android 优先</span>
              <span><Check size={14} strokeWidth={2.5} aria-hidden="true" />Flutter 构建</span>
              <span><Check size={14} strokeWidth={2.5} aria-hidden="true" />本地优先</span>
            </div>
          </div>

          <div className={styles.heroProduct}>
            <span className={styles.heroLabel}>首页 / 我的记录</span>
            <div className={`${styles.deviceFrame} ${styles.heroDevice}`}>
              <img src={screens[0].src} alt={screens[0].alt} />
            </div>
            <span className={`${styles.heroNote} ${styles.heroNoteOrange}`}>先回忆，再决定</span>
            <span className={`${styles.heroNote} ${styles.heroNotePurple}`}>真实界面</span>
          </div>
        </section>

        <section className={styles.statementSection} aria-labelledby="statement-title">
          <div className={styles.sectionKicker}>
            <span>它到底是什么</span>
            <span>CHEWSY / PRODUCT MODEL</span>
          </div>
          <div className={styles.statementGrid}>
            <div>
              <h2 id="statement-title">
                首页不是推荐流，
                <br />
                是你的吃饭档案。
              </h2>
              <p>
                好吃不把一顿饭看成一道孤立的菜，而是看成一次到店经历：店名是入口，菜名是线索，判词和理由才是下次决定是否再去的依据。
              </p>
            </div>
            <div className={styles.modelList}>
              <div><strong>一家店</strong><span>进入自己的历史</span></div>
              <div><strong>多次到店</strong><span>保留完整上下文</span></div>
              <div><strong>一个判断</strong><span>替未来的自己省一次猜</span></div>
            </div>
          </div>
        </section>

        <section className={styles.productSection} id="product" aria-labelledby="product-title">
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionKicker}>
                <span>App 产品画面</span>
                <span>01 / ACTUAL SCREENS</span>
              </div>
              <h2 id="product-title">每一张，都是真实的产品界面。</h2>
            </div>
            <p>不是概念图，不是装饰 mockup。下面展示的是当前 App 已经存在的页面和信息结构。</p>
          </div>

          <div className={styles.screenStage}>
            <div className={styles.screenRail} role="tablist" aria-label="选择 App 页面">
              {screens.map((screen) => {
                const Icon = screen.icon;
                return (
                  <button
                    type="button"
                    key={screen.id}
                    role="tab"
                    aria-selected={activeScreenId === screen.id}
                    className={`${styles.screenTab} ${activeScreenId === screen.id ? styles.screenTabActive : ""}`}
                    onClick={() => setActiveScreenId(screen.id)}
                  >
                    <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                    <span>{screen.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.screenViewer}>
              <div className={styles.viewerCopy}>
                <span className={`${styles.toneLabel} ${styles[`tone${activeScreen.color}`]}`}>
                  <ActiveIcon size={16} strokeWidth={2.4} aria-hidden="true" />
                  {activeScreen.shortLabel}
                </span>
                <h3>{activeScreen.title}</h3>
                <p>{activeScreen.description}</p>
                <ul>
                  {activeScreen.points.map((point) => (
                    <li key={point}><Check size={15} strokeWidth={2.4} aria-hidden="true" />{point}</li>
                  ))}
                </ul>
              </div>
              <div className={`${styles.deviceFrame} ${styles.viewerDevice}`}>
                <img src={activeScreen.src} alt={activeScreen.alt} />
              </div>
            </div>
          </div>

          <div className={styles.gallery} aria-label="更多 App 页面截图">
            {galleryScreens.map((screen) => (
              <button
                type="button"
                key={screen.id}
                className={styles.galleryCard}
                onClick={() => setActiveScreenId(screen.id)}
              >
                <span className={`${styles.galleryFrame} ${styles[`gallery${screen.color}`]}`}>
                  <img src={screen.src} alt={screen.alt} loading="lazy" />
                </span>
                <span className={styles.galleryCaption}>
                  <strong>{screen.label}</strong>
                  <span>{screen.shortLabel}</span>
                  <ArrowRight size={15} strokeWidth={2.2} aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.recordSection} id="record" aria-labelledby="record-title">
          <div className={styles.recordVisuals}>
            <div className={`${styles.deviceFrame} ${styles.recordDevice}`}>
              <img src="/chewsy/screens/record.png" alt="好吃不 App 选择种草、观望、踩雷的真机界面" loading="lazy" />
            </div>
            <div className={`${styles.deviceFrame} ${styles.detailDevice}`}>
              <img src="/chewsy/screens/restaurant-detail.png" alt="好吃不 App 店铺详情真机界面" loading="lazy" />
            </div>
          </div>
          <div className={styles.recordCopy}>
            <div className={styles.sectionKicker}>
              <span>记录逻辑</span>
              <span>02 / RECORD FIRST</span>
            </div>
            <h2 id="record-title">先判词，再写这家店的体验。</h2>
            <p>
              记录流程从最重要的判断开始。你可以只留下店名和一个判词，也可以继续补菜名、图片、自定义理由和一句短评。
            </p>
            <div className={styles.recordSteps}>
              <div><span>01</span><strong>先选判词</strong><small>种草 / 观望 / 踩雷</small></div>
              <div><span>02</span><strong>写下理由</strong><small>预设理由或自己的话</small></div>
              <div><span>03</span><strong>随时回改</strong><small>编辑，不让错误一直影响你</small></div>
            </div>
          </div>
        </section>

        <section className={styles.historySection} aria-labelledby="history-title">
          <div className={styles.historyCopy}>
            <div className={styles.sectionKicker}>
              <span>店铺历史</span>
              <span>03 / FULL CONTEXT</span>
            </div>
            <h2 id="history-title">同一家店，保留每次发生过什么。</h2>
            <p>
              好吃不不把多次到店压成一个评分。它把每一次吃过的菜、当时的判词、理由、短评和图片排在一起，让未来的你看见完整经过。
            </p>
            <a className={styles.textAction} href="#product">
              查看全部产品画面
              <ArrowRight size={16} strokeWidth={2.1} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.historyVisuals}>
            <div className={`${styles.deviceFrame} ${styles.historyDeviceBack}`}>
              <img src="/chewsy/screens/restaurant-history.png" alt="好吃不 App 店铺历史列表真机界面" loading="lazy" />
            </div>
            <div className={`${styles.deviceFrame} ${styles.historyDeviceFront}`}>
              <img src="/chewsy/screens/universe.png" alt="好吃不 App 吃饭宇宙真机界面" loading="lazy" />
            </div>
          </div>
        </section>

        <section className={styles.flowSection} aria-labelledby="flow-title">
          <div className={styles.flowIntro}>
            <div className={styles.sectionKicker}>
              <span>产品主线</span>
              <span>04 / FROM A BITE TO NEXT TIME</span>
            </div>
            <h2 id="flow-title">记录、搜索、回看。</h2>
            <p>工具藏在产品结构后面，用户真正要做的只有三件事：留下这一口，找到那家店，少走一次弯路。</p>
          </div>
          <div className={styles.flowGrid}>
            <article><span>01</span><NotebookPen size={24} strokeWidth={2} aria-hidden="true" /><h3>留下一口</h3><p>先把当下最重要的判词保存下来。</p></article>
            <article><span>02</span><Search size={24} strokeWidth={2} aria-hidden="true" /><h3>搜回经历</h3><p>从店名、菜名和理由进入自己的历史。</p></article>
            <article><span>03</span><ShieldCheck size={24} strokeWidth={2} aria-hidden="true" /><h3>相信自己</h3><p>不看大众结论，只看真实发生过什么。</p></article>
          </div>
        </section>

        <section className={styles.dataSection} id="data" aria-labelledby="data-title">
          <div className={styles.dataCopy}>
            <div className={styles.sectionKicker}>
              <span>离线优先</span>
              <span>05 / LOCAL BY DEFAULT</span>
            </div>
            <h2 id="data-title">你的记录和图片，都在自己的设备里。</h2>
            <p>数据中心提供备份和导入入口，但它不抢占产品主线。先记录，想换设备时再管理自己的档案。</p>
            <div className={styles.dataPromises}>
              <span><LockKeyhole size={16} strokeWidth={2.2} aria-hidden="true" />本地保存</span>
              <span><Database size={16} strokeWidth={2.2} aria-hidden="true" />支持备份</span>
              <span><ShieldCheck size={16} strokeWidth={2.2} aria-hidden="true" />不接统计 SDK</span>
            </div>
          </div>
          <div className={`${styles.deviceFrame} ${styles.dataDevice}`}>
            <img src="/chewsy/screens/data-center.png" alt="好吃不 App 数据中心真机界面" loading="lazy" />
          </div>
        </section>

        <section className={styles.ctaSection} aria-labelledby="cta-title">
          <div>
            <p>好吃不 Chewsy / Personal food log</p>
            <h2 id="cta-title">把下一次的选择，交还给自己。</h2>
          </div>
          <a className={styles.ctaAction} href="#top">
            回到开头
            <ArrowRight size={18} strokeWidth={2.1} aria-hidden="true" />
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <MessageCircleQuestion size={19} strokeWidth={2.2} aria-hidden="true" />
          <strong>好吃不</strong>
          <span>CHEWSY</span>
        </div>
        <p>记住每一次吃过的店，下次少踩一次雷。</p>
        <a
          className={styles.footerGithub}
          href="https://github.com/ljchengx/Chewsy"
          target="_blank"
          rel="noreferrer"
          aria-label="在 GitHub 查看好吃不 Chewsy 源码"
          title="在 GitHub 查看好吃不 Chewsy 源码"
        >
          <img className={styles.githubIcon} src="/github-mark.svg" alt="" aria-hidden="true" />
          <span className={styles.footerMeta}>GitHub / Chewsy</span>
        </a>
      </footer>
    </div>
  );
}
