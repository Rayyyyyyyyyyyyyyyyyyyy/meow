import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://rayyyyyyyyyyyyyyyyyyyy.github.io/meow/";
const title = "貓語行為觀察室｜有依據的貓咪行為翻譯";
const description = "從姿勢、耳朵、尾巴、眼睛與情境，判讀貓咪較可能的情緒狀態、適合的安全回應與健康警訊。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: { icon: "/meow/favicon.svg", shortcut: "/meow/favicon.svg" },
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    images: [{ url: `${siteUrl}og.png`, width: 1200, height: 630, alt: "貓語行為觀察室" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl}og.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
