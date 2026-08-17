export type ToolSlug = "base64" | "json-formatter" | "markdown-cleaner" | "image-watermark" | "timestamp-converter";

export type ToolIconName = "binary" | "braces" | "eraser" | "stamp" | "clock";

export type ToolAccent = "amber" | "sage" | "clay";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolSeoContent {
  heading: string;
  summary: string;
  intro: string;
  features: readonly string[];
  steps: readonly string[];
  faqs: readonly ToolFaq[];
}

export interface ToolDefinition {
  slug: ToolSlug;
  component: ToolSlug;
  title: string;
  titleEn: string;
  shortTitle: string;
  shortTitleEn: string;
  description: string;
  descriptionEn: string;
  category: string;
  categoryEn: string;
  keywords: readonly string[];
  icon: ToolIconName;
  accent: ToolAccent;
  metadata: {
    title: string;
    description: string;
  };
  seo: ToolSeoContent;
}

export const toolDefinitions: readonly ToolDefinition[] = [
  {
    slug: "base64",
    component: "base64",
    title: "Base64 编解码",
    titleEn: "Base64 Codec",
    shortTitle: "Base64",
    shortTitleEn: "Base64",
    description: "在明文与编码之间，做一个深呼吸。",
    descriptionEn: "A quiet passage between plain text and encoded form.",
    category: "文本转换",
    categoryEn: "Text conversion",
    keywords: [
      "base64",
      "base64在线编码",
      "base64在线解码",
      "base64转文本",
      "base64字符串解码",
      "编码",
      "解码",
      "utf-8",
      "文本",
    ],
    icon: "binary",
    accent: "amber",
    metadata: {
      title: "Base64 在线编码解码工具 - UTF-8、URL Safe",
      description: "在浏览器本地进行 UTF-8 Base64 编码解码，支持标准与 URL Safe 格式，输入内容不会上传。",
    },
    seo: {
      heading: "Base64 在线编码与解码",
      summary: "支持 Base64 在线编码、解码和 UTF-8 文本转换，兼容标准与 URL Safe 格式。",
      intro: "知页 Base64 工具适合处理接口参数、文本片段和开发调试中的 Base64 字符串。编码与解码都在浏览器本地完成，无需登录，也不会把输入内容上传到服务器。",
      features: [
        "Base64 文本编码：将 UTF-8 明文转换为 Base64 字符串。",
        "Base64 文本解码：将标准或 URL Safe 字符串还原为文本。",
        "支持保留或移除等号填充，方便处理不同接口格式。",
      ],
      steps: [
        "选择“编码”或“解码”模式。",
        "在输入框粘贴或输入需要处理的文本。",
        "执行转换后复制或下载结果。",
      ],
      faqs: [
        {
          question: "Base64 编码是加密吗？",
          answer: "不是。Base64 是一种可逆的数据编码方式，任何拿到字符串的人都可以解码；它不能替代密码学加密。",
        },
        {
          question: "Base64 如何解码成文本？",
          answer: "选择“解码”模式，粘贴 Base64 字符串并执行转换即可。工具会按 UTF-8 文本处理常见中文和其他 Unicode 字符。",
        },
        {
          question: "标准 Base64 和 URL Safe Base64 有什么区别？",
          answer: "URL Safe Base64 会用连字符和下划线替代容易出现在 URL 中产生歧义的字符，适合放入 URL 或文件名。",
        },
      ],
    },
  },
  {
    slug: "json-formatter",
    component: "json-formatter",
    title: "JSON 格式化",
    titleEn: "JSON Formatter",
    shortTitle: "JSON",
    shortTitleEn: "JSON",
    description: "让杂乱的结构，重新显出秩序。",
    descriptionEn: "Bring order back to complex data structures.",
    category: "结构处理",
    categoryEn: "Data structure",
    keywords: ["json", "json格式化", "json在线格式化", "json美化", "json压缩", "json校验", "json解析", "格式化", "压缩", "校验", "格式"],
    icon: "braces",
    accent: "sage",
    metadata: {
      title: "JSON 在线格式化工具 - 美化、压缩与校验",
      description: "在浏览器本地格式化、压缩和校验 JSON，支持键排序、结构视图与精确错误定位。",
    },
    seo: {
      heading: "JSON 在线格式化、美化与校验",
      summary: "在线 JSON 格式化工具，支持美化、压缩、键排序、结构查看和错误定位。",
      intro: "知页 JSON 工具可以把紧凑或杂乱的 JSON 快速整理成易读格式，也可以压缩、校验和查看数据结构。所有 JSON 内容只在浏览器本地解析，适合调试接口响应和检查配置文件。",
      features: [
        "JSON 美化与格式化：按 2 个或 4 个空格缩进整理结构。",
        "JSON 压缩：移除多余空白，生成适合传输或保存的紧凑内容。",
        "JSON 校验与错误定位：发现语法问题并提示出错位置。",
        "支持键排序、结构视图和对象、数组统计。",
      ],
      steps: [
        "把 JSON 粘贴到输入区，选择格式化、压缩或校验。",
        "按需要调整缩进方式或开启键排序。",
        "在结果区查看、复制或下载处理后的 JSON。",
      ],
      faqs: [
        {
          question: "JSON 格式化和 JSON 压缩有什么区别？",
          answer: "格式化会增加缩进和换行，让 JSON 更容易阅读；压缩会移除多余空白，让内容更紧凑。两种操作不会改变有效 JSON 的数据结构。",
        },
        {
          question: "JSON 格式错误时能定位原因吗？",
          answer: "可以。校验和格式化失败时，工具会尽量提供行号、列号和错误信息，帮助检查逗号、引号、括号以及值类型。",
        },
        {
          question: "粘贴到 JSON 工具中的数据会上传吗？",
          answer: "不会。JSON 解析和格式化在当前浏览器中完成，页面没有上传输入内容的服务端接口。",
        },
      ],
    },
  },
  {
    slug: "markdown-cleaner",
    component: "markdown-cleaner",
    title: "Markdown 清理",
    titleEn: "Markdown Cleaner",
    shortTitle: "Markdown",
    shortTitleEn: "Markdown",
    description: "剥去标记，只留下可读的文字。",
    descriptionEn: "Remove the markup and leave the words intact.",
    category: "文本净化",
    categoryEn: "Text cleanup",
    keywords: ["markdown", "markdown清理", "markdown转纯文本", "markdown去格式", "markdown文本清理", "md", "清理", "去标签", "纯文本"],
    icon: "eraser",
    accent: "clay",
    metadata: {
      title: "Markdown 转纯文本工具 - 在线去除格式",
      description: "在浏览器本地去除 Markdown 语法标记，保留段落、列表、代码、链接文字与表格结构。",
    },
    seo: {
      heading: "Markdown 在线转纯文本与格式清理",
      summary: "在线清理 Markdown 格式，转换为更易阅读的纯文本，同时保留段落、列表和代码内容。",
      intro: "知页 Markdown 清理工具适合把 Markdown 文档转换成纯文本，用于复制到邮件、表单、知识库或其他不支持 Markdown 的编辑器。清理过程在浏览器本地完成，也支持直接导入 .md 文件。",
      features: [
        "移除标题、强调、删除线和链接标记，保留可读文字。",
        "保留段落、列表、引用、代码和表格的基本结构。",
        "支持合并多余空行，让输出更适合复制和再次编辑。",
      ],
      steps: [
        "粘贴 Markdown 内容，或导入 .md / .markdown 文件。",
        "选择清理文本，按需要开启段落整理。",
        "复制或下载转换后的纯文本。",
      ],
      faqs: [
        {
          question: "Markdown 清理后会保留哪些内容？",
          answer: "工具会保留正文文字、段落、列表、引用、代码和表格的可读结构，同时移除 Markdown 标记符号。",
        },
        {
          question: "Markdown 可以转换成纯文本吗？",
          answer: "可以。执行清理后，输出结果会去除标题符号、加粗符号、链接语法等格式标记，只保留适合阅读和复制的文字。",
        },
        {
          question: "导入的 Markdown 文件会上传到服务器吗？",
          answer: "不会。文件读取和 Markdown 解析均在浏览器本地进行，原始文件不会发送到服务器。",
        },
      ],
    },
  },
  {
    slug: "timestamp-converter",
    component: "timestamp-converter",
    title: "时间戳转换",
    titleEn: "Timestamp Converter",
    shortTitle: "时间戳",
    shortTitleEn: "Timestamp",
    description: "在时间戳与日期时间之间准确换算。",
    descriptionEn: "Convert precisely between timestamps and date-time values.",
    category: "时间处理",
    categoryEn: "Time conversion",
    keywords: ["时间戳", "时间戳转换", "Unix时间戳转换", "时间戳在线转换", "时间戳转日期", "日期转时间戳", "Unix", "timestamp", "日期", "秒", "毫秒", "UTC"],
    icon: "clock",
    accent: "sage",
    metadata: {
      title: "Unix 时间戳在线转换工具 - 秒、毫秒与日期互转",
      description: "在浏览器本地进行 Unix 时间戳与日期时间转换，支持秒、毫秒、本地时间和 UTC。",
    },
    seo: {
      heading: "Unix 时间戳在线转换",
      summary: "支持 Unix 时间戳转日期、日期转时间戳，以及秒、毫秒、本地时间和 UTC 之间的转换。",
      intro: "知页时间戳工具用于检查接口时间、日志时间和数据库时间字段。输入 Unix 时间戳即可查看日期时间，也可以把日期转换为秒或毫秒时间戳，所有计算都在浏览器本地完成。",
      features: [
        "Unix 时间戳转日期：自动识别秒级或毫秒级输入。",
        "日期转时间戳：支持本地时间和 UTC 两种时区模式。",
        "同时显示秒、毫秒、ISO 8601 和可读日期时间结果。",
      ],
      steps: [
        "选择时间戳转日期，或选择日期转时间戳。",
        "输入时间戳或选择日期时间，并设置单位和时区。",
        "执行转换后复制需要的结果字段。",
      ],
      faqs: [
        {
          question: "Unix 时间戳的秒和毫秒如何区分？",
          answer: "秒级时间戳通常是 10 位左右，毫秒级时间戳通常是 13 位左右。工具支持自动识别，也可以手动指定单位。",
        },
        {
          question: "时间戳转换使用本地时间还是 UTC？",
          answer: "日期转时间戳时可以选择本地时间或 UTC；时间戳转日期时会同时展示本地时间和 UTC，方便核对时区差异。",
        },
        {
          question: "时间戳转换结果会发送到服务器吗？",
          answer: "不会。转换只依赖当前设备的时间计算能力，在浏览器本地完成，不需要上传输入内容。",
        },
      ],
    },
  },
  {
    slug: "image-watermark",
    component: "image-watermark",
    title: "图片水印",
    titleEn: "Image Watermark",
    shortTitle: "水印",
    shortTitleEn: "Watermark",
    description: "给证件图片覆盖清晰、克制的用途声明。",
    descriptionEn: "Add a clear purpose statement to sensitive document images.",
    category: "图片保护",
    categoryEn: "Image protection",
    keywords: ["水印", "图片加水印", "在线图片水印", "图片添加水印", "图片水印工具", "身份证", "证件", "watermark", "image", "隐私"],
    icon: "stamp",
    accent: "clay",
    metadata: {
      title: "在线图片加文字水印 - 本地处理证件图片",
      description: "在浏览器本地为身份证和证件图片添加文字水印，实时调整颜色、透明度与角度，无需上传。",
    },
    seo: {
      heading: "在线图片加文字水印",
      summary: "无需上传图片，直接在浏览器本地添加文字水印，支持调整颜色、透明度、大小和角度。",
      intro: "知页图片水印工具适合为身份证、证件或其他敏感图片添加用途声明。图片只在当前浏览器中读取和处理，完成后可按原尺寸导出带水印的 JPEG、PNG 或 WebP 图片。",
      features: [
        "添加自定义水印文字，适合填写使用目的和日期。",
        "调整水印颜色、透明度、字号和旋转角度。",
        "实时预览效果，并按原始图片尺寸导出结果。",
      ],
      steps: [
        "选择或拖入 JPEG、PNG、WebP 图片。",
        "输入水印文字，调整颜色、透明度、大小和角度。",
        "确认预览效果后下载带水印图片。",
      ],
      faqs: [
        {
          question: "图片加水印时会上传原图吗？",
          answer: "不会。图片读取、预览和导出都在浏览器本地完成，原图不会上传到知页服务器。",
        },
        {
          question: "图片水印工具支持哪些格式？",
          answer: "目前支持 JPEG、PNG 和 WebP 图片。单张图片最大 25 MB，过大的图片可能受浏览器内存限制影响。",
        },
        {
          question: "可以给身份证图片添加用途声明吗？",
          answer: "可以。你可以输入“仅供某某业务使用”等用途文字，并调整透明度和角度，让水印清晰可见且尽量不遮挡关键信息。",
        },
      ],
    },
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return toolDefinitions.find((tool) => tool.slug === slug);
}

export function searchTools(query: string): ToolDefinition[] {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");

  if (!normalized) {
    return [...toolDefinitions];
  }

  return toolDefinitions.filter((tool) => {
    const index = [tool.title, tool.shortTitle, tool.description, tool.category, ...tool.keywords]
      .join(" ")
      .toLocaleLowerCase("zh-CN");

    return index.includes(normalized);
  });
}
