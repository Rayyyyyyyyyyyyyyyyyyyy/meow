# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 這個 repo 是什麼

一個繁體中文的「貓語翻譯機」單頁 App(`app/page.tsx`),透過使用者選擇的貓咪訊號組合推測情緒狀態。以 **Next.js static export 部署到 GitHub Pages**。

## 部署

`npm run build:pages`(= `next build`,`output: "export"`)產出到 `out/`,由 `.github/workflows/deploy-pages.yml` 在 push 到 `main` 時部署到 GitHub Pages。要驗證正式行為就跑這個。

`next.config.ts` 綁定 GitHub Pages:`basePath` / `assetPrefix` 為 `/meow`、`trailingSlash: true`、`images.unoptimized`。**若 repo 名稱或 Pages URL 改變,必須同步更新** `next.config.ts` 的 basePath/assetPrefix、`app/layout.tsx` 的 `siteUrl`,以及 icon/OG 路徑。

## 核心資料模型(`app/page.tsx`)

整個 App 是**單一 client component**,含 4 個 view(`home` / `translate` / `encyclopedia` / `diary`),用 module 層級的 const 表格驅動:

- 五種狀態 `StateId = relaxed | curious | fear | arousal | pain`,定義於 `stateDefinitions`(順序即索引)。
- 每個訊號選項帶一個 `Scores` = 長度 5 的 tuple,**順序必須對齊 `stateDefinitions`**(relaxed, curious, fear, arousal, pain)。
- 翻譯邏輯:把已選訊號的 Scores 逐欄相加 → argmax 得出 `result.top` → 用 `result.top` 去索引 `stateDefinitions[result.top]`。信心值由「最高分佔比 + 已選訊號數」推導。
- **索引對齊是 load-bearing**:新增/刪除狀態時,`stateDefinitions`、每個 `signalCategories[*].options[*].scores`、`moodOptions` 都要一起改,否則分數會錯位對應到別的狀態。

其他:行為日記存在 localStorage key `cat-diary-v1`;分享卡片用 `navigator.clipboard`。頁尾連到 `public/cat-behavior-translation-guide-zh.docx`。

## 研究指南 docx

`public/cat-behavior-translation-guide-zh.docx`(頁尾下載連結)由 `docs/build_cat_behavior_guide.py` 用 `python-docx` 產生,不是手改。要更新指南內容請改該 script 再重跑,別直接編輯 docx。

## 常用指令

```bash
npm run build:pages   # 正式路徑:next build → out/(GitHub Pages 部署的內容)
npm run lint          # eslint(忽略 dist、.next)
```
