import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Larger version of icon.tsx for iOS home-screen bookmarks — same mark,
 * no rounded corners here since iOS applies its own mask. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b1626",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#e0a05f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21V10.5L12 4l8 6.5V21" />
          <path d="M9 21v-6a3 3 0 0 1 6 0v6" />
          <path d="M4 21h16" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
