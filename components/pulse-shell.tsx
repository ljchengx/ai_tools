"use client";

import Link from "next/link";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { toolDefinitions, type ToolSlug } from "@/lib/tools/registry";

import { ToolIcon } from "./tool-icon";

export type PulseLocale = "zh" | "en";

interface PulseLocaleValue {
  locale: PulseLocale;
  setLocale: (locale: PulseLocale) => void;
}

interface PulseShellProps {
  activeTool?: ToolSlug;
  children: ReactNode;
}

const localeStorageKey = "pulse:locale";
const lightStorageKey = "pulse:light";
const focusStorageKey = "pulse:focus";

const PulseLocaleContext = createContext<PulseLocaleValue>({
  locale: "zh",
  setLocale: () => undefined,
});

const shellCopy = {
  zh: {
    tools: "文本工具",
    local: "仅在本地处理",
    menu: "打开导航",
    closeMenu: "关闭导航",
    enterFocus: "进入专注模式",
    leaveFocus: "退出专注模式",
    lightToggle: "切换晨光与月光",
    morning: "晨光",
    noon: "正午",
    afternoon: "午后",
    night: "月光",
  },
  en: {
    tools: "Tools",
    local: "Local only",
    menu: "Open navigation",
    closeMenu: "Close navigation",
    enterFocus: "Enter focus mode",
    leaveFocus: "Leave focus mode",
    lightToggle: "Switch between morning and moonlight",
    morning: "Morning",
    noon: "Noon",
    afternoon: "Afternoon",
    night: "Moonlight",
  },
} as const;

type DayPeriod = "morning" | "noon" | "afternoon" | "night";

function getDayPeriod(): DayPeriod {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 10) {
    return "morning";
  }

  if (hour >= 10 && hour < 15) {
    return "noon";
  }

  if (hour >= 15 && hour < 19) {
    return "afternoon";
  }

  return "night";
}

export function usePulseLocale(): PulseLocaleValue {
  return useContext(PulseLocaleContext);
}

export function PulseShell({ activeTool, children }: PulseShellProps) {
  const [locale, setLocale] = useState<PulseLocale>("zh");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [dayPeriod, setDayPeriod] = useState<DayPeriod>("morning");
  const [focusMode, setFocusMode] = useState(false);
  const copy = shellCopy[locale];

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem(localeStorageKey);
      if (savedLocale === "zh" || savedLocale === "en") {
        setLocale(savedLocale);
      }
      setFocusMode(window.localStorage.getItem(focusStorageKey) === "true");
    } catch {
      // Private browsing can deny storage access; Chinese remains the default.
    }

    let savedLight: string | null = null;
    try {
      savedLight = window.localStorage.getItem(lightStorageKey);
    } catch {
      // Automatic time-based light remains available when storage is blocked.
    }
    if (savedLight === "morning" || savedLight === "night") {
      setDayPeriod(savedLight);
      return;
    }

    const updateDayPeriod = () => setDayPeriod(getDayPeriod());
    updateDayPeriod();
    const interval = window.setInterval(updateDayPeriod, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const toggleLight = () => {
    setDayPeriod((current) => {
      const next = current === "night" ? "morning" : "night";
      try {
        window.localStorage.setItem(lightStorageKey, next);
      } catch {
        // The selected light remains active for the current visit.
      }
      return next;
    });
  };

  const toggleFocusMode = () => {
    setFocusMode((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(focusStorageKey, String(next));
      } catch {
        // The selected focus state remains active for the current visit.
      }
      return next;
    });
  };

  const contextValue = useMemo<PulseLocaleValue>(() => ({
    locale,
    setLocale: (nextLocale) => {
      setLocale(nextLocale);
      try {
        window.localStorage.setItem(localeStorageKey, nextLocale);
      } catch {
        // Locale is still applied for the current visit when storage is unavailable.
      }
    },
  }), [locale]);

  return (
    <PulseLocaleContext.Provider value={contextValue}>
      <div className={`pulse-app pulse-day--${dayPeriod} ${navigationOpen ? "is-navigation-open" : ""} ${focusMode ? "is-focus-mode" : ""}`}>
        <button
          className="pulse-mobile-menu"
          type="button"
          aria-label={navigationOpen ? copy.closeMenu : copy.menu}
          aria-controls="pulse-navigation"
          aria-expanded={navigationOpen}
          onClick={() => setNavigationOpen((open) => !open)}
        >
          {navigationOpen ? <X aria-hidden="true" size={20} strokeWidth={1.7} /> : <Menu aria-hidden="true" size={20} strokeWidth={1.7} />}
        </button>

        <aside className="pulse-sidebar" id="pulse-navigation" aria-label={copy.tools}>
          <Link className="pulse-brand" href="/" onClick={() => setNavigationOpen(false)} aria-label="Pulse 首页">
            <span className="pulse-brand__mark" aria-hidden="true"><i /></span>
            <span>
              <strong>PULSE</strong>
              <small>TEXT UTILITY</small>
            </span>
          </Link>

          <button
            className="pulse-focus-toggle"
            type="button"
            onClick={toggleFocusMode}
            aria-label={focusMode ? copy.leaveFocus : copy.enterFocus}
            aria-pressed={focusMode}
            title={focusMode ? copy.leaveFocus : copy.enterFocus}
          >
            {focusMode ? <PanelLeftOpen aria-hidden="true" size={17} strokeWidth={1.6} /> : <PanelLeftClose aria-hidden="true" size={17} strokeWidth={1.6} />}
            <span>{focusMode ? copy.leaveFocus : copy.enterFocus}</span>
          </button>

          <nav className="pulse-navigation">
            <div className="pulse-navigation__tools">
              {toolDefinitions.map((tool) => {
                const isActive = activeTool === tool.slug;
                const title = locale === "zh" ? tool.shortTitle : tool.shortTitleEn;

                return (
                  <Link
                    key={tool.slug}
                    className={`pulse-navigation__tool ${isActive ? "is-active" : ""}`}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setNavigationOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    title={title}
                  >
                    <ToolIcon name={tool.icon} size={17} strokeWidth={1.55} />
                    <span>{title}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <footer className="pulse-sidebar__footer">
            <button
              className="pulse-language-toggle"
              type="button"
              onClick={() => contextValue.setLocale(locale === "zh" ? "en" : "zh")}
              aria-label={locale === "zh" ? "Switch to English" : "切换至中文"}
            >
              <span className={locale === "zh" ? "is-active" : ""}>中</span>
              <span className={locale === "en" ? "is-active" : ""}>EN</span>
            </button>
            <button className="pulse-time-light" type="button" onClick={toggleLight} aria-label={copy.lightToggle} title={copy.lightToggle}>
              <i aria-hidden="true" />
              {copy[dayPeriod]}
            </button>
          </footer>
        </aside>

        <button className="pulse-nav-scrim" type="button" aria-label={copy.closeMenu} onClick={() => setNavigationOpen(false)} />

        <main className="pulse-content">{children}</main>
      </div>
    </PulseLocaleContext.Provider>
  );
}
