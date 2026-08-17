import type { MetadataRoute } from "next";

import { toolDefinitions } from "@/lib/tools/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPages: MetadataRoute.Sitemap = toolDefinitions.map((tool) => ({
    url: `https://www.yzfl.top/${tool.path}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://www.yzfl.top/",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.yzfl.top/tools",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...toolPages,
  ];
}
