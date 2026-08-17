"use client";

import { Check, Clock3, Copy, RotateCcw, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { recordRecentTool } from "@/lib/recent-tools";
import type { ToolDefinition } from "@/lib/tools/registry";
import {
  dateTimeToTimestamp,
  formatDateTimeInput,
  formatLocalDateTime,
  formatUtcDateTime,
  timestampToDate,
  TimestampTransformError,
  type TimestampOutputUnit,
  type TimestampUnit,
  type TimezoneMode,
} from "@/lib/tools/timestamp";

import { PulseShell } from "./pulse-shell";

type TimestampMode = "timestamp-to-date" | "date-to-timestamp";

interface ConversionResult {
  date: Date;
  seconds: number;
  milliseconds: number;
}

const resultLabels = {
  local: "本地时间",
  utc: "UTC 时间",
  iso: "ISO 8601",
  seconds: "秒时间戳",
  milliseconds: "毫秒时间戳",
} as const;

function getCurrentInput(mode: TimestampMode, unit: TimestampUnit, timezone: TimezoneMode): string {
  const now = new Date();
  if (mode === "date-to-timestamp") {
    return formatDateTimeInput(now, timezone);
  }
  return unit === "milliseconds" ? String(now.getTime()) : String(Math.trunc(now.getTime() / 1000));
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const input = document.createElement("textarea");
  input.value = value;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) {
    throw new Error("复制失败");
  }
}

function TimestampWorkspaceContent({ definition }: { definition: ToolDefinition }) {
  const reducedMotion = useReducedMotion();
  const copiedTimerRef = useRef<number | null>(null);
  const [mode, setMode] = useState<TimestampMode>("timestamp-to-date");
  const [unit, setUnit] = useState<TimestampUnit>("auto");
  const [timezone, setTimezone] = useState<TimezoneMode>("local");
  const [input, setInput] = useState(() => String(Math.trunc(Date.now() / 1000)));
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [status, setStatus] = useState({ tone: "idle", text: "输入时间戳后开始转换" });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    recordRecentTool(definition.slug);
  }, [definition.slug]);

  useEffect(() => () => {
    if (copiedTimerRef.current) {
      window.clearTimeout(copiedTimerRef.current);
    }
  }, []);

  const changeMode = (nextMode: TimestampMode) => {
    const nextUnit: TimestampUnit = nextMode === "timestamp-to-date" ? "auto" : "seconds";
    setMode(nextMode);
    setUnit(nextUnit);
    setInput(getCurrentInput(nextMode, nextUnit, timezone));
    setResult(null);
    setStatus({ tone: "idle", text: nextMode === "timestamp-to-date" ? "输入时间戳后开始转换" : "选择日期时间后开始转换" });
  };

  const changeUnit = (nextUnit: TimestampUnit) => {
    setUnit(nextUnit);
    if (mode === "timestamp-to-date" && result) {
      setInput(nextUnit === "milliseconds" ? String(result.milliseconds) : String(Math.trunc(result.seconds)));
    }
    setResult(null);
    setStatus({ tone: "idle", text: "单位已切换，请重新转换" });
  };

  const changeTimezone = (nextTimezone: TimezoneMode) => {
    if (mode === "date-to-timestamp" && input) {
      try {
        const milliseconds = dateTimeToTimestamp(input, "milliseconds", timezone);
        setInput(formatDateTimeInput(new Date(milliseconds), nextTimezone));
      } catch {
        // 保留无效输入，便于用户继续修正。
      }
    }
    setTimezone(nextTimezone);
    setResult(null);
    setStatus({ tone: "idle", text: "时区已切换，请重新转换" });
  };

  const useCurrentTime = () => {
    const value = getCurrentInput(mode, unit, timezone);
    setInput(value);
    setResult(null);
    setStatus({ tone: "idle", text: "已填入当前时间" });
  };

  const convert = () => {
    try {
      if (mode === "timestamp-to-date") {
        const next = timestampToDate(input, unit);
        setResult(next);
        setStatus({ tone: "success", text: `转换完成，按${next.detectedUnit === "seconds" ? "秒" : "毫秒"}解析` });
        return;
      }

      const outputUnit = unit as TimestampOutputUnit;
      const value = dateTimeToTimestamp(input, outputUnit, timezone);
      const milliseconds = outputUnit === "seconds" ? value * 1000 : value;
      setResult({ date: new Date(milliseconds), seconds: milliseconds / 1000, milliseconds });
      setStatus({ tone: "success", text: `转换完成，按${timezone === "local" ? "本地时间" : "UTC"}解析` });
    } catch (error) {
      setResult(null);
      setStatus({
        tone: "error",
        text: error instanceof TimestampTransformError ? error.message : "转换失败，请检查输入内容。",
      });
    }
  };

  const clear = () => {
    setInput("");
    setResult(null);
    setStatus({ tone: "idle", text: "内容已清空" });
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await copyText(value);
      setCopiedKey(key);
      setStatus({ tone: "success", text: `已复制${resultLabels[key as keyof typeof resultLabels]}` });
      if (copiedTimerRef.current) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setStatus({ tone: "error", text: "复制失败，请手动选择结果。" });
    }
  };

  const values = result ? {
    local: formatLocalDateTime(result.date),
    utc: formatUtcDateTime(result.date),
    iso: result.date.toISOString(),
    seconds: String(result.seconds),
    milliseconds: String(result.milliseconds),
  } : null;

  return (
    <motion.section
      className="pulse-workbench pulse-workbench--timestamp-converter"
      aria-labelledby="tool-title"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: "easeOut" }}
    >
      <header className="pulse-workbench__header">
        <div>
          <div className="pulse-workbench__meta" aria-hidden="true">
            <span>知页 / 工具</span><i /><span>{definition.category}</span>
          </div>
          <h1 id="tool-title">{definition.title}</h1>
          <p>{definition.description}</p>
        </div>
      </header>

      <section className="pulse-timestamp-workspace" aria-label="时间戳转换工作区">
        <div className="pulse-timestamp-toolbar" aria-label="转换设置">
          <div className="pulse-timestamp-setting">
            <span>转换方向</span>
            <div className="pulse-segmented-control">
              <button type="button" className={mode === "timestamp-to-date" ? "is-selected" : ""} onClick={() => changeMode("timestamp-to-date")}>时间戳转日期</button>
              <button type="button" className={mode === "date-to-timestamp" ? "is-selected" : ""} onClick={() => changeMode("date-to-timestamp")}>日期转时间戳</button>
            </div>
          </div>
          <div className="pulse-timestamp-setting">
            <span>单位</span>
            <div className="pulse-segmented-control">
              {mode === "timestamp-to-date" ? <button type="button" className={unit === "auto" ? "is-selected" : ""} onClick={() => changeUnit("auto")}>自动</button> : null}
              <button type="button" className={unit === "seconds" ? "is-selected" : ""} onClick={() => changeUnit("seconds")}>秒</button>
              <button type="button" className={unit === "milliseconds" ? "is-selected" : ""} onClick={() => changeUnit("milliseconds")}>毫秒</button>
            </div>
          </div>
          <div className="pulse-timestamp-setting">
            <span>时区</span>
            <div className="pulse-segmented-control">
              <button type="button" className={timezone === "local" ? "is-selected" : ""} onClick={() => changeTimezone("local")}>本地时间</button>
              <button type="button" className={timezone === "utc" ? "is-selected" : ""} onClick={() => changeTimezone("utc")}>UTC</button>
            </div>
          </div>
        </div>

        <div className="pulse-timestamp-grid">
          <section className="pulse-timestamp-panel pulse-timestamp-panel--input">
            <header><div><Clock3 aria-hidden="true" size={17} /><span>{mode === "timestamp-to-date" ? "时间戳" : "日期时间"}</span></div><span>{mode === "date-to-timestamp" ? (timezone === "local" ? "本地" : "UTC") : unit === "auto" ? "自动识别" : unit === "seconds" ? "秒" : "毫秒"}</span></header>
            <div className="pulse-timestamp-input-area">
              <label htmlFor="timestamp-input">{mode === "timestamp-to-date" ? "输入 Unix 时间戳" : "选择要转换的日期和时间"}</label>
              <input
                id="timestamp-input"
                type={mode === "timestamp-to-date" ? "text" : "datetime-local"}
                inputMode={mode === "timestamp-to-date" ? "decimal" : undefined}
                step={mode === "date-to-timestamp" ? "1" : undefined}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    convert();
                  }
                }}
                placeholder={mode === "timestamp-to-date" ? "例如：1723456789" : undefined}
              />
              <div className="pulse-timestamp-input-actions">
                <button type="button" className="pulse-timestamp-now" onClick={useCurrentTime}><RotateCcw aria-hidden="true" size={16} />使用当前时间</button>
                <button type="button" className="pulse-icon-button" onClick={clear} aria-label="清空输入" title="清空输入"><Trash2 aria-hidden="true" size={16} /></button>
              </div>
              <button type="button" className="pulse-timestamp-primary" onClick={convert}>开始转换</button>
            </div>
          </section>

          <section className="pulse-timestamp-panel pulse-timestamp-panel--results" aria-label="转换结果">
            <header><div><Check aria-hidden="true" size={17} /><span>转换结果</span></div>{result ? <span>5 项</span> : null}</header>
            <div className={`pulse-timestamp-results ${result ? "has-result" : ""}`}>
              {values ? Object.entries(values).map(([key, value]) => (
                <div className="pulse-timestamp-result-row" key={key}>
                  <span>{resultLabels[key as keyof typeof resultLabels]}</span>
                  <code>{value}</code>
                  <button type="button" onClick={() => handleCopy(key, value)} aria-label={`复制${resultLabels[key as keyof typeof resultLabels]}`} title={`复制${resultLabels[key as keyof typeof resultLabels]}`}>
                    {copiedKey === key ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
                  </button>
                </div>
              )) : <div className="pulse-timestamp-empty"><Clock3 aria-hidden="true" size={25} /><span>转换后的时间会显示在这里</span></div>}
            </div>
          </section>
        </div>

        <footer className="pulse-timestamp-statusbar">
          <div className={`pulse-status pulse-status--${status.tone}`} role="status" aria-live="polite">
            {status.tone === "success" ? <Check aria-hidden="true" size={16} /> : null}
            {status.tone === "error" ? <TriangleAlert aria-hidden="true" size={16} /> : null}
            <span>{status.text}</span>
          </div>
          <span><ShieldCheck aria-hidden="true" size={15} />所有转换均在浏览器本地完成</span>
        </footer>
      </section>
    </motion.section>
  );
}

export function TimestampWorkspace({ definition, seoContent }: { definition: ToolDefinition; seoContent?: ReactNode }) {
  return <PulseShell activeNavigation="workbench" activeTool={definition.slug}><TimestampWorkspaceContent definition={definition} />{seoContent}</PulseShell>;
}
