export const dynamic = "force-static";

export function GET() {
  return new Response("3bd58866b85f47330b3ce7fe0cf4fe95", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
