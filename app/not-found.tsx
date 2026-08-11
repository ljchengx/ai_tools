import Link from "next/link";

import { PulseShell } from "@/components/pulse-shell";

export default function NotFound() {
  return (
    <PulseShell>
      <section className="pulse-not-found">
        <p>404 / 未找到工具</p>
        <h1>这里还没有一件可用的文具。</h1>
        <Link href="/">回到工作台</Link>
      </section>
    </PulseShell>
  );
}
