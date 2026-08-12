import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "知页浏览器本地工具箱";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f7f8fa",
          color: "#18213b",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", width: 720, flexDirection: "column" }}>
          <div style={{ display: "flex", marginBottom: 50, fontSize: 34 }}>知页</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 64, lineHeight: 1.28 }}>
            <span>把琐碎处理，</span>
            <span>留在这一页。</span>
          </div>
          <div style={{ display: "flex", marginTop: 34, color: "#66718b", fontFamily: "sans-serif", fontSize: 25 }}>
            免费的浏览器本地工具箱
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 240,
            height: 240,
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #d9deea",
            borderRadius: 120,
            background: "#eef1ff",
            color: "#5f72df",
            fontFamily: "sans-serif",
            fontSize: 36,
          }}
        >
          本地处理
        </div>
      </div>
    ),
    size,
  );
}
