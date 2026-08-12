"use client";

import Link from "next/link";
import { Home, LayoutGrid, Menu, X } from "lucide-react";
import { createContext, useContext, useState, type ReactNode } from "react";

import { toolDefinitions, type ToolSlug } from "@/lib/tools/registry";

import { ToolIcon } from "./tool-icon";

export type PulseLocale = "zh" | "en";

interface PulseLocaleValue {
  locale: PulseLocale;
  setLocale: (locale: PulseLocale) => void;
}

interface PulseShellProps {
  activeNavigation?: "workbench";
  activeTool?: ToolSlug;
  children: ReactNode;
  surface?: "home" | "workspace";
}

const PulseLocaleContext = createContext<PulseLocaleValue>({
  locale: "zh",
  setLocale: () => undefined,
});

const localeValue: PulseLocaleValue = {
  locale: "zh",
  setLocale: () => undefined,
};

export function usePulseLocale(): PulseLocaleValue {
  return useContext(PulseLocaleContext);
}

export function PulseShell({ activeNavigation, activeTool, children, surface = "workspace" }: PulseShellProps) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const hasWorkspaceNavigation = surface === "workspace";
  const closeNavigation = () => setNavigationOpen(false);

  return (
    <PulseLocaleContext.Provider value={localeValue}>
      <div className={`pulse-app pulse-surface--${surface} ${navigationOpen ? "is-navigation-open" : ""}`}>
        {hasWorkspaceNavigation ? (
          <>
            <button
              className="pulse-mobile-menu"
              type="button"
              aria-label={navigationOpen ? "关闭导航" : "打开导航"}
              aria-controls="pulse-navigation"
              aria-expanded={navigationOpen}
              onClick={() => setNavigationOpen((open) => !open)}
            >
              {navigationOpen ? <X aria-hidden="true" size={20} strokeWidth={1.7} /> : <Menu aria-hidden="true" size={20} strokeWidth={1.7} />}
            </button>

            <Link className="pulse-mobile-brand" href="/" aria-label="知页首页">
              <span>知页</span>
            </Link>

            <aside className="pulse-sidebar" id="pulse-navigation" aria-label="知页导航">
              <Link className="pulse-brand" href="/" onClick={closeNavigation} aria-label="知页首页">
                <span>知页</span>
                <i aria-hidden="true" />
              </Link>

              <nav className="pulse-navigation">
                <Link
                  className="pulse-navigation__item"
                  href="/"
                  onClick={closeNavigation}
                >
                  <Home aria-hidden="true" size={21} strokeWidth={1.55} />
                  <span>首页</span>
                </Link>
                <Link
                  className={`pulse-navigation__item ${activeNavigation === "workbench" ? "is-active" : ""}`}
                  href="/tools"
                  onClick={closeNavigation}
                  aria-current={activeNavigation === "workbench" ? "page" : undefined}
                >
                  <LayoutGrid aria-hidden="true" size={21} strokeWidth={1.55} />
                  <span>工作台</span>
                </Link>

                <div className="pulse-navigation__tools" aria-label="工具列表">
                  {toolDefinitions.map((tool) => {
                    const isActive = activeTool === tool.slug;

                    return (
                      <Link
                        key={tool.slug}
                        className={`pulse-navigation__tool ${isActive ? "is-active" : ""}`}
                        href={`/tools/${tool.slug}`}
                        onClick={closeNavigation}
                        aria-current={isActive ? "page" : undefined}
                        title={tool.shortTitle}
                      >
                        <ToolIcon name={tool.icon} size={21} strokeWidth={1.45} />
                        <span>{tool.shortTitle}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </aside>

            <button className="pulse-nav-scrim" type="button" aria-label="关闭导航" onClick={closeNavigation} />
          </>
        ) : null}

        <main className="pulse-content">{children}</main>
      </div>
    </PulseLocaleContext.Provider>
  );
}
