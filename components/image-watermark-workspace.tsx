"use client";

import { ArrowRight, Check, Download, FileImage, ImagePlus, RotateCcw, ShieldCheck, Trash2, TriangleAlert } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { recordRecentTool } from "@/lib/recent-tools";
import type { ToolDefinition } from "@/lib/tools/registry";

import { PulseShell, usePulseLocale } from "./pulse-shell";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_IMAGE_PIXELS = 48_000_000;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

type StatusTone = "idle" | "success" | "error";

const watermarkCopy = {
  zh: {
    local: "浏览器本地处理",
    settings: "水印设置",
    text: "水印文本",
    textPlaceholder: "例如：仅供办理业务使用",
    color: "颜色",
    opacity: "透明度",
    angle: "角度",
    source: "原始图片",
    preview: "图片预览",
    livePreview: "实时预览",
    outputEmpty: "上传图片后，水印效果会显示在这里",
    sourceAlt: "待添加水印的原始图片",
    upload: "上传图片",
    replace: "更换图片",
    clear: "清空图片",
    download: "下载水印图片",
    emptyTitle: "拖入身份证或证件图片",
    emptyHint: "支持 JPG、PNG、WebP，最大 25 MB",
    privacy: "图片与水印均不会离开此设备",
    waiting: "等待上传图片",
    loading: "正在读取图片",
    ready: "水印预览已生成",
    downloaded: "水印图片已下载",
    invalidType: "请选择 JPG、PNG 或 WebP 图片。",
    tooLarge: "图片文件不能超过 25 MB。",
    tooManyPixels: "图片分辨率过高，请使用不超过 4800 万像素的图片。",
    loadFailed: "图片读取失败，请重新选择。",
    noImage: "请先上传图片。",
    reset: "恢复默认水印设置",
    imageLabel: "已添加水印的图片预览",
  },
  en: {
    local: "Processed in this browser",
    settings: "Watermark settings",
    text: "Watermark text",
    textPlaceholder: "For example: For verification only",
    color: "Color",
    opacity: "Opacity",
    angle: "Angle",
    source: "Original image",
    preview: "Image preview",
    livePreview: "Live preview",
    outputEmpty: "Your watermarked image will appear here after upload",
    sourceAlt: "Original image before watermarking",
    upload: "Upload image",
    replace: "Replace image",
    clear: "Clear image",
    download: "Download watermarked image",
    emptyTitle: "Drop an ID or document image here",
    emptyHint: "JPG, PNG or WebP, up to 25 MB",
    privacy: "Your image and watermark never leave this device",
    waiting: "Waiting for an image",
    loading: "Reading image",
    ready: "Watermark preview generated",
    downloaded: "Watermarked image downloaded",
    invalidType: "Choose a JPG, PNG or WebP image.",
    tooLarge: "The image must be smaller than 25 MB.",
    tooManyPixels: "The image resolution is too large. Use an image under 48 megapixels.",
    loadFailed: "The image could not be read. Choose it again.",
    noImage: "Upload an image first.",
    reset: "Reset watermark settings",
    imageLabel: "Watermarked image preview",
  },
} as const;

function drawWatermark(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  text: string,
  color: string,
  opacity: number,
  angle: number,
) {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const value = text.trim();
  if (!value) {
    return;
  }

  const shortestSide = Math.min(canvas.width, canvas.height);
  const fontSize = Math.max(18, Math.round(shortestSide * 0.055));
  const diagonal = Math.hypot(canvas.width, canvas.height);

  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((angle * Math.PI) / 180);
  context.globalAlpha = opacity / 100;
  context.fillStyle = color;
  context.font = `600 ${fontSize}px "PingFang SC", "Microsoft YaHei UI", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";

  const textWidth = context.measureText(value).width;
  const stepX = Math.max(textWidth + fontSize * 2.4, shortestSide * 0.62);
  const stepY = Math.max(fontSize * 3.2, shortestSide * 0.19);
  let row = 0;

  for (let y = -diagonal; y <= diagonal; y += stepY) {
    const offset = row % 2 === 0 ? 0 : stepX / 2;
    for (let x = -diagonal; x <= diagonal; x += stepX) {
      context.fillText(value, x + offset, y);
    }
    row += 1;
  }

  context.restore();
}

function ImageWatermarkContent({ definition }: { definition: ToolDefinition }) {
  const { locale } = usePulseLocale();
  const copy = watermarkCopy[locale];
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const dragDepthRef = useRef(0);
  const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState(locale === "zh" ? "仅供办理业务使用" : "For verification only");
  const [watermarkColor, setWatermarkColor] = useState("#8a9299");
  const [opacity, setOpacity] = useState(22);
  const [angle, setAngle] = useState(-24);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<{ tone: StatusTone; text: string }>({ tone: "idle", text: copy.waiting });

  useEffect(() => {
    recordRecentTool(definition.slug);
  }, [definition.slug]);

  useEffect(() => () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
  }, []);

  useEffect(() => {
    if (!sourceImage || !canvasRef.current) {
      return;
    }

    drawWatermark(canvasRef.current, sourceImage, watermarkText, watermarkColor, opacity, angle);
  }, [angle, opacity, sourceImage, watermarkColor, watermarkText]);

  const clearImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSourceImage(null);
    setSourceFile(null);
    setIsDragging(false);
    setStatus({ tone: "idle", text: copy.waiting });
    if (canvasRef.current) {
      canvasRef.current.width = 0;
      canvasRef.current.height = 0;
    }
  };

  const resetSettings = () => {
    setWatermarkText(locale === "zh" ? "仅供办理业务使用" : "For verification only");
    setWatermarkColor("#8a9299");
    setOpacity(22);
    setAngle(-24);
  };

  const loadImage = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setStatus({ tone: "error", text: copy.invalidType });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus({ tone: "error", text: copy.tooLarge });
      return;
    }

    setIsLoading(true);
    setStatus({ tone: "idle", text: copy.loading });
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (image.naturalWidth * image.naturalHeight > MAX_IMAGE_PIXELS) {
        URL.revokeObjectURL(objectUrl);
        setIsLoading(false);
        setStatus({ tone: "error", text: copy.tooManyPixels });
        return;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = objectUrl;
      setSourceImage(image);
      setSourceFile(file);
      setIsLoading(false);
      setStatus({ tone: "success", text: copy.ready });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsLoading(false);
      setStatus({ tone: "error", text: copy.loadFailed });
    };

    image.src = objectUrl;
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      loadImage(file);
    }
    event.target.value = "";
  };

  const handleDragEnter = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      loadImage(file);
    }
  };

  const downloadImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceFile || canvas.width === 0) {
      setStatus({ tone: "error", text: copy.noImage });
      return;
    }

    const outputType = ACCEPTED_IMAGE_TYPES.has(sourceFile.type) ? sourceFile.type : "image/png";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.94));
    if (!blob) {
      setStatus({ tone: "error", text: copy.loadFailed });
      return;
    }

    const extension = outputType === "image/jpeg" ? "jpg" : outputType === "image/webp" ? "webp" : "png";
    const baseName = sourceFile.name.replace(/\.[^.]+$/, "") || "image";
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${baseName}-watermarked.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus({ tone: "success", text: copy.downloaded });
  };

  const title = locale === "zh" ? definition.title : definition.titleEn;
  const description = locale === "zh" ? definition.description : definition.descriptionEn;

  return (
    <motion.section
      className="pulse-workbench pulse-workbench--image-watermark"
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

      <section className="pulse-watermark-workspace" aria-label={`${title} ${locale === "zh" ? "工作区" : "workspace"}`}>
        <section className="pulse-watermark-controls" aria-label={copy.settings}>
          <header className="pulse-watermark-controls__header">
            <span>{copy.settings}</span>
            <button className="pulse-icon-button" type="button" onClick={resetSettings} aria-label={copy.reset} title={copy.reset}>
              <RotateCcw aria-hidden="true" size={17} strokeWidth={1.7} />
            </button>
          </header>

          <div className="pulse-watermark-controls__body">
            <label className="pulse-watermark-field pulse-watermark-field--text">
              <span>{copy.text}</span>
              <input
                type="text"
                value={watermarkText}
                maxLength={80}
                onChange={(event) => setWatermarkText(event.target.value)}
                placeholder={copy.textPlaceholder}
              />
            </label>

            <div className="pulse-watermark-field pulse-watermark-field--color">
              <span>{copy.color}</span>
              <span className="pulse-color-control">
                <input type="color" value={watermarkColor} onChange={(event) => setWatermarkColor(event.target.value)} aria-label={copy.color} />
                <code>{watermarkColor.toUpperCase()}</code>
              </span>
            </div>

            <label className="pulse-watermark-field">
              <span>{copy.opacity}<output>{opacity}%</output></span>
              <input type="range" min="5" max="80" step="1" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} aria-label={copy.opacity} />
            </label>

            <label className="pulse-watermark-field">
              <span>{copy.angle}<output>{angle}°</output></span>
              <input type="range" min="-60" max="60" step="1" value={angle} onChange={(event) => setAngle(Number(event.target.value))} aria-label={copy.angle} />
            </label>
          </div>
        </section>

        <div className="pulse-editor-grid pulse-editor-grid--image-watermark pulse-watermark-panels">
          <section
            className={`pulse-editor-card pulse-watermark-panel pulse-watermark-panel--source ${isDragging ? "is-dragging" : ""}`}
            onDragEnter={handleDragEnter}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <header className="pulse-watermark-panel__header">
              <div>
                <FileImage aria-hidden="true" size={17} strokeWidth={1.65} />
                <span>{copy.source}</span>
                {sourceImage ? <small>{sourceImage.naturalWidth} × {sourceImage.naturalHeight}</small> : null}
              </div>
              {sourceImage ? (
                <div>
                  <label className="pulse-watermark-upload pulse-watermark-upload--quiet">
                    <ImagePlus aria-hidden="true" size={16} strokeWidth={1.7} />
                    <span>{copy.replace}</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} />
                  </label>
                  <button className="pulse-icon-button" type="button" onClick={clearImage} aria-label={copy.clear} title={copy.clear}>
                    <Trash2 aria-hidden="true" size={16} strokeWidth={1.7} />
                  </button>
                </div>
              ) : null}
            </header>
            <div className="pulse-watermark-panel__body">
              {sourceImage ? <img className="pulse-watermark-source-image" src={sourceImage.src} alt={copy.sourceAlt} /> : (
                <label className="pulse-watermark-empty">
                  <span className="pulse-watermark-empty__icon"><ImagePlus aria-hidden="true" size={26} strokeWidth={1.45} /></span>
                  <strong>{isLoading ? copy.loading : copy.emptyTitle}</strong>
                  <small>{copy.emptyHint}</small>
                  <span className="pulse-watermark-upload">
                    <ImagePlus aria-hidden="true" size={16} strokeWidth={1.7} />
                    {copy.upload}
                  </span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} />
                </label>
              )}
              {isDragging ? <div className="pulse-watermark-drop"><ImagePlus aria-hidden="true" size={26} strokeWidth={1.5} /><span>{copy.emptyTitle}</span></div> : null}
            </div>
          </section>

          <div className="pulse-watermark-live-flow" aria-label={copy.livePreview}>
            <span aria-hidden="true"><ArrowRight size={18} strokeWidth={1.65} /></span>
            <span className="sr-only">{copy.livePreview}</span>
          </div>

          <section className="pulse-editor-card pulse-watermark-panel pulse-watermark-panel--output">
            <header className="pulse-watermark-panel__header">
              <div>
                <ShieldCheck aria-hidden="true" size={17} strokeWidth={1.65} />
                <span>{copy.preview}</span>
              </div>
              <button className="pulse-watermark-download" type="button" onClick={downloadImage} disabled={!sourceImage}>
                <Download aria-hidden="true" size={16} strokeWidth={1.75} />
                <span>{copy.download}</span>
              </button>
            </header>
            <div className="pulse-watermark-panel__body">
              {sourceImage ? null : (
                <div className="pulse-watermark-output-empty">
                  <ShieldCheck aria-hidden="true" size={25} strokeWidth={1.4} />
                  <span>{copy.outputEmpty}</span>
                </div>
              )}
              <canvas ref={canvasRef} className={sourceImage ? "is-visible" : ""} aria-label={copy.imageLabel} data-testid="watermark-canvas" />
            </div>
          </section>
        </div>

        <footer className="pulse-watermark-statusbar">
          <div className={`pulse-status pulse-status--${status.tone}`} role="status" aria-live="polite">
            {status.tone === "success" ? <Check aria-hidden="true" size={16} strokeWidth={2} /> : null}
            {status.tone === "error" ? <TriangleAlert aria-hidden="true" size={16} strokeWidth={1.8} /> : null}
            <span>{status.text}</span>
          </div>
          <span><ShieldCheck aria-hidden="true" size={15} strokeWidth={1.7} />{copy.privacy}</span>
        </footer>
      </section>
    </motion.section>
  );
}

export function ImageWatermarkWorkspace({ definition }: { definition: ToolDefinition }) {
  return (
    <PulseShell activeTool={definition.slug}>
      <ImageWatermarkContent definition={definition} />
    </PulseShell>
  );
}
