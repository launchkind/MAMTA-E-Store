import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "Entry Ecommerce Platform";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 64,
        background: "linear-gradient(to bottom, #3b82f6, #2563eb)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "system-ui",
      }}
    >
      <div style={{ fontSize: 80, fontWeight: "bold", marginBottom: 20 }}>
        Entry Ecommerce
      </div>
      <div style={{ fontSize: 40, opacity: 0.9 }}>
        Premium Baby Products & Essentials
      </div>
      <div style={{ fontSize: 32, marginTop: 40, opacity: 0.8 }}>
        🍼 Safe • Trusted • Fast Delivery
      </div>
    </div>,
    {
      ...size,
    },
  );
}
