# 貓語翻譯機 🐱

一個繁體中文的貓咪行為判讀單頁 App。選出貓咪當下的姿勢、耳朵、尾巴、表情與情境,推測牠較可能的情緒狀態,並附上判讀信心、行為百科與行為日記。

以 Next.js static export 建置,部署在 GitHub Pages。

## 開發

需要 Node.js `>=22.13.0`。

```bash
npm install
npm run dev          # 本機開發
npm run build:pages  # 產出靜態站台到 out/
npm run lint
```

## 部署

Push 到 `main` 會觸發 `.github/workflows/deploy-pages.yml`,以 `npm run build:pages` 產出 `out/` 並部署到 GitHub Pages。

站台掛在 `/meow` 子路徑下(見 `next.config.ts` 的 `basePath` / `assetPrefix`)。若更換 repo 名稱或 Pages URL,需同步更新 `next.config.ts` 與 `app/layout.tsx` 的 `siteUrl`。

## 結構

- `app/page.tsx` —— 整個 App(單一 client component,含首頁、翻譯器、行為百科、行為日記四個 view)。
- `app/layout.tsx`、`app/globals.css` —— metadata 與樣式。
- `docs/build_cat_behavior_guide.py` —— 用 `python-docx` 產生頁尾下載的研究指南 `public/cat-behavior-translation-guide-zh.docx`。

本站僅供教育與娛樂用途,不能取代獸醫診斷。
