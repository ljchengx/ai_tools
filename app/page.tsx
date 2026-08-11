import { ToolWorkspace } from "@/components/tool-workspace";
import { getToolBySlug } from "@/lib/tools/registry";

export default function HomePage() {
  const defaultTool = getToolBySlug("base64");

  if (!defaultTool) {
    return null;
  }

  return <ToolWorkspace definition={defaultTool} />;
}
