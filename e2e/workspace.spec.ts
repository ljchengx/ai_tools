import { expect, test } from "@playwright/test";

test("首页直接进入 Base64 工作台并保留四个工具入口", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Base64 编解码" })).toBeVisible();
  const navigation = page.getByRole("navigation");
  await expect(navigation.getByRole("link", { name: "Base64" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "JSON" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Markdown" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "水印" })).toBeVisible();
  await expect(page.getByPlaceholder("搜索工具或输入关键词")).toHaveCount(0);
});

test("静谧工坊主题使用冷雾灰、磨砂与聚焦呼吸", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("输入文本").focus();

  const theme = await page.evaluate(() => {
    const app = getComputedStyle(document.querySelector(".pulse-app")!);
    const card = getComputedStyle(document.querySelector(".pulse-editor-card--input")!);
    const button = getComputedStyle(document.querySelector(".pulse-run-button")!);
    const activeIndicator = getComputedStyle(document.querySelector(".pulse-navigation__tool.is-active")!, "::before");

    return {
      pageBackground: app.backgroundColor,
      cardBackground: card.backgroundColor,
      cardBackdrop: card.backdropFilter,
      cardAnimation: card.animationName,
      buttonBackground: button.backgroundColor,
      activeIndicator: activeIndicator.backgroundColor,
    };
  });

  expect(theme.pageBackground).toBe("rgb(248, 249, 250)");
  expect(theme.cardBackground).toBe("rgba(248, 249, 250, 0.86)");
  expect(theme.cardBackdrop).toBe("blur(18px)");
  expect(theme.cardAnimation).toBe("pulse-card-breathe");
  expect(theme.buttonBackground).toBe("rgb(237, 242, 239)");
  expect(theme.activeIndicator).toBe("rgb(100, 123, 114)");
});

test("专注模式收起桌面侧栏并保留工具入口", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "进入专注模式" }).click();

  await expect(page.locator(".pulse-app")).toHaveClass(/is-focus-mode/);
  await expect(page.locator(".pulse-sidebar")).toHaveCSS("width", "72px");
  await expect(page.getByRole("navigation").getByRole("link", { name: "JSON" })).toBeAttached();
  await expect(page.getByRole("button", { name: "退出专注模式" })).toBeVisible();

  await page.setViewportSize({ width: 820, height: 1180 });
  const compactLayout = await page.evaluate(() => {
    const sidebar = document.querySelector(".pulse-sidebar")!.getBoundingClientRect();
    const focusButton = document.querySelector(".pulse-focus-toggle")!.getBoundingClientRect();
    const toolbar = document.querySelector(".pulse-toolbar")!.getBoundingClientRect();

    return {
      buttonInsideRail: focusButton.left >= sidebar.left && focusButton.right <= sidebar.right,
      toolbarInsideViewport: toolbar.left >= sidebar.right && toolbar.right <= window.innerWidth,
      noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth,
    };
  });

  expect(compactLayout).toEqual({
    buttonInsideRail: true,
    toolbarInsideViewport: true,
    noHorizontalOverflow: true,
  });
});

test("Base64 可处理 UTF-8 文本", async ({ page }) => {
  await page.goto("/tools/base64");

  await page.getByLabel("输入文本").fill("你好🙂");
  await page.getByRole("button", { name: "执行编码文本" }).click();

  await expect(page.getByLabel("处理结果")).toHaveValue("5L2g5aW98J+Zgg==");
  await expect(page.getByRole("status")).toContainText("文本已编码");
});

test("JSON 在出错时显示行列位置", async ({ page }) => {
  await page.goto("/tools/json-formatter");

  await page.getByLabel("输入文本").fill('{\n  "name": "MORPH",\n}');
  await page.getByRole("button", { name: "执行格式化" }).click();

  await expect(page.getByRole("status")).toContainText("第");
});

test("Markdown 清理保留可读内容", async ({ page }) => {
  await page.goto("/tools/markdown-cleaner");

  await page.getByLabel("输入文本").fill("# 标题\n\n**保留文本** [链接](https://example.com)");
  await page.getByRole("button", { name: "执行清理文本" }).click();

  await expect(page.getByLabel("处理结果")).toHaveValue("标题\n\n保留文本 链接");
});

test("减少动态效果时保留可访问的工具入口", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();

  await page.goto("/");

  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "打开导航" }).click();
  await expect(page.getByRole("navigation").getByRole("link", { name: "Markdown" })).toBeVisible();
  await context.close();
});

test("Base64 支持 URL-safe 输出与结果交换", async ({ page }) => {
  await page.goto("/tools/base64");

  await page.getByRole("button", { name: "URL-safe" }).click();
  await page.getByLabel("输入文本").fill("你好🙂");
  await page.getByRole("button", { name: "执行编码文本" }).click();
  await expect(page.getByLabel("处理结果")).toHaveValue("5L2g5aW98J-Zgg");

  await page.getByRole("button", { name: "交换输入和结果" }).click();
  await page.getByRole("button", { name: "解码" }).click();
  await page.getByRole("button", { name: "执行解码文本" }).click();
  await expect(page.getByLabel("处理结果")).toHaveValue("你好🙂");
});

test("JSON 支持键排序与结构视图", async ({ page }) => {
  await page.goto("/tools/json-formatter");

  await page.getByLabel("输入文本").fill('{"z":1,"a":{"d":2,"b":3}}');
  await page.getByRole("button", { name: "4 空格" }).click();
  await page.getByLabel("按名称排序").check();
  await page.getByRole("button", { name: "执行格式化" }).click();
  await expect(page.getByLabel("处理结果")).toHaveValue('{\n    "a": {\n        "b": 3,\n        "d": 2\n    },\n    "z": 1\n}');

  await page.getByRole("button", { name: "结构" }).click();
  await expect(page.getByLabel("JSON 结构视图")).toBeVisible();
});

test("Markdown 清理可保留列表并合并空行", async ({ page }) => {
  await page.goto("/tools/markdown-cleaner");

  await page.getByLabel("合并空行").check();
  await page.getByLabel("输入文本").fill("1. 第一项\n   - 子项\n\n2. 第二项");
  await page.getByRole("button", { name: "执行清理文本" }).click();
  await expect(page.getByLabel("处理结果")).toHaveValue("1. 第一项\n  - 子项\n2. 第二项");
});

test("图片水印支持四项自定义并下载原尺寸结果", async ({ page }) => {
  await page.goto("/tools/image-watermark");
  await expect(page.getByLabel("颜色", { exact: true })).toHaveValue("#8a9299");
  await expect(page.getByRole("slider", { name: "透明度" })).toHaveValue("22");
  const png = Buffer.from(await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 150;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#f7f7f5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png").split(",")[1];
  }), "base64");

  await page.locator('input[type="file"]').first().setInputFiles({
    name: "id-card.png",
    mimeType: "image/png",
    buffer: png,
  });

  await expect(page.locator('.pulse-watermark-statusbar [role="status"]')).toContainText("水印预览已生成");
  await expect(page.getByTestId("watermark-canvas")).toHaveAttribute("width", "240");
  const previewBefore = await page.getByTestId("watermark-canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL());
  await page.getByLabel("水印文本").fill("仅供开户验证使用");
  await page.getByLabel("颜色", { exact: true }).fill("#b42318");
  await page.getByRole("slider", { name: "透明度" }).fill("36");
  await page.getByRole("slider", { name: "角度" }).fill("-18");

  await expect(page.getByLabel("水印文本")).toHaveValue("仅供开户验证使用");
  await expect(page.getByRole("slider", { name: "透明度" })).toHaveValue("36");
  await expect(page.getByRole("slider", { name: "角度" })).toHaveValue("-18");
  await expect(page.getByRole("button", { name: "生成水印" })).toHaveCount(0);
  await expect.poll(() => page.getByTestId("watermark-canvas").evaluate((canvas) => (canvas as HTMLCanvasElement).toDataURL())).not.toBe(previewBefore);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载水印图片" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("id-card-watermarked.png");
});
