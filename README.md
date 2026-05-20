# 鄭毓璋醫師衛教部落格

> 大腸直腸外科專科 ・ 微創痔瘡手術 ・ 台中榮逸聯合診所

這是一個**純靜態網站**（HTML/CSS/JS），無須 Node.js 或建置工具，
您只要在 GitHub 上新增一個 Markdown 檔，Vercel 就會在約 30 秒內自動更新網站。

---

## 📁 專案結構

```
Dr-MaiMai-YC.C-blog/
├── index.html        ← 首頁
├── about.html        ← 關於醫師
├── blog.html         ← 文章列表
├── post.html         ← 文章內頁（共用模板）
├── contact.html      ← 聯絡資訊
├── posts/
│   ├── posts.json    ← 文章清單（每篇文章的標題、日期、摘要、標籤）
│   ├── welcome.md
│   ├── lhp-laser-hemorrhoid.md
│   ├── hemorrhoid-treatment-options.md
│   └── post-op-care.md
├── assets/
│   ├── css/style.css ← 水藍 + 淡綠主題樣式
│   ├── js/main.js    ← 文章載入、Markdown 渲染、搜尋
│   └── images/       ← 圖片資料夾
├── robots.txt
├── sitemap.xml
└── vercel.json
```

---

## ⚡ 自動 SEO 渲染

本網站使用 **GitHub Actions** 自動把您的 `.md` 文章轉成 SEO 完整的 `.html` 靜態頁面，
包含：
- 文章專屬 `<title>` / meta description / canonical
- Open Graph + Twitter Card 標記
- Schema.org `Article` + `MedicalWebPage` + `BreadcrumbList` 結構化資料
- 自動同步 `sitemap.xml`

→ AI 爬蟲（ChatGPT、Perplexity、Gemini）與 Google 都能完整讀到文章內容。

## ✍️ 如何新增一篇文章（GitHub 網頁操作，無須安裝任何軟體）

每篇新文章需要 **2 個步驟**：

### 步驟 1：建立 Markdown 文章檔

1. 進入 GitHub 上的這個 repo
2. 點 `posts/` 資料夾
3. 點右上角 **「Add file → Create new file」**
4. 檔名請用**英文+連字號**，例如：`colon-polyp-faq.md`
5. 在編輯區貼入文章內容，格式範例如下：

```markdown
---
title: 大腸瘜肉一定會變癌症嗎？切除後還會復發嗎？
date: 2026-06-01
author: 鄭毓璋醫師
tags: [大腸瘜肉, 衛教知識]
---

## 病患情境

（描述常見病患困擾，約 100 字）

## 主題說明

（清楚解釋疾病或手術，約 400 字）

## 鄭毓璋醫師怎麼說

> 「（專業建議）」

## 什麼時候該就醫？

- （列出就醫時機）

## 關於鄭毓璋醫師

鄭毓璋醫師為台中榮逸聯合診所大腸直腸外科主治醫師...
```

6. 拉到最底，點 **「Commit new file」**

### 步驟 2：更新 posts.json，讓文章顯示在列表中

1. 進入 `posts/posts.json` 檔案
2. 點右上角**鉛筆 ✏️ 圖示**進入編輯
3. 在 `[` 之後新增一筆（**請放在最上面，這樣會顯示為最新**）：

```json
  {
    "slug": "colon-polyp-faq",
    "title": "大腸瘜肉一定會變癌症嗎？切除後還會復發嗎？",
    "date": "2026-06-01",
    "author": "鄭毓璋醫師",
    "tags": ["大腸瘜肉", "衛教知識"],
    "excerpt": "大腸瘜肉是大腸癌的前身嗎？切除後還會復發嗎？鄭毓璋醫師為您完整說明..."
  },
```

> ⚠️ **重要：**
> - `slug` 必須與 `.md` 檔名相同（不含 `.md`）
> - 每筆之間要加 `,`，最後一筆**不要**加逗號
> - 日期格式為 `YYYY-MM-DD`

4. 點 **「Commit changes」**

### 步驟 3：等 30 秒，網站自動更新！

Vercel 會偵測到 GitHub 變更，**約 30 秒**內自動部署。您可以到 Vercel Dashboard 查看部署進度。

---

## 📝 文章寫作建議（依鄭毓璋醫師部落格 System Prompt）

### 語氣

- 親切、平易近人，讓一般民眾看得懂
- 避免艱深術語，若使用則附白話說明
- 文章中**自然帶入「鄭毓璋醫師」全名 3 次以上**

### 結構

1. **吸引人的標題**（含關鍵字：痔瘡 / 微創手術 / 大腸直腸 等）
2. **病患情境開場**（常見困擾或問題）
3. **主體說明**（症狀、治療、注意事項）
4. **鄭醫師觀點**（引號標註的專業建議）
5. **什麼時候該就醫？**
6. **關於鄭毓璋醫師**（每篇結尾固定段落）

### SEO 關鍵字（每篇自然融入 3–5 個）

- 鄭毓璋醫師
- 大腸直腸外科
- 台中痔瘡手術
- 雷射痔瘡消融術
- 微創痔瘡手術
- 榮逸聯合診所
- 痔瘡治療台中

---

## 🎨 Markdown 語法速查

```markdown
## 大標題
### 小標題

**粗體** *斜體*

- 項目 1
- 項目 2

1. 編號項目
2. 編號項目

> 引述（鄭醫師觀點建議用這個）

[連結文字](https://網址)

| 表頭 1 | 表頭 2 |
|---|---|
| 內容 | 內容 |
```

---

## 🖼️ 加入圖片

1. 在 GitHub 上點 `assets/images/` 資料夾 → Add file → Upload files
2. 上傳圖片（建議 jpg/png，寬度 1200px 以內）
3. 在 Markdown 中引用：

```markdown
![圖片描述](../assets/images/your-image.jpg)
```

---

## 🛠️ 技術細節

- **無建置工具**：純 HTML/CSS/JS，瀏覽器直接執行
- **Markdown 渲染**：[marked.js](https://github.com/markedjs/marked)（CDN 引入）
- **安全性**：[DOMPurify](https://github.com/cure53/DOMPurify) 防止 XSS
- **字型**：Google Fonts Noto Sans TC
- **SEO**：每頁皆有獨立 `<title>`、`<meta description>`、首頁含 Schema.org Physician/MedicalClinic 結構化資料

---

## 📞 聯絡資訊

- **榮逸聯合診所**：[https://rong-yi.com.tw](https://rong-yi.com.tw)
- **看診醫師**：鄭毓璋醫師（大腸直腸外科專科）

---

© 鄭毓璋醫師 ・ 榮逸聯合診所
