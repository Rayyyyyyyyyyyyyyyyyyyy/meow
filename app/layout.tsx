import type { Metadata } from "next";
import "./globals.css";

const siteUrl = "https://rayyyyyyyyyyyyyyyyyyyy.github.io/meow/";
const title = "貓語翻譯機｜用訊號組合讀懂你的貓";
const description = "從姿勢、耳朵、尾巴、臉部與情境組合，判讀貓咪較可能的狀態，查行為百科並建立你家貓的日常基準線。";

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
    images: [{ url: `${siteUrl}og.png`, width: 1731, height: 909, alt: "貓語翻譯機：你的貓到底在說什麼？" }],
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
