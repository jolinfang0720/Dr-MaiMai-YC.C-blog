/**
 * Render all posts/*.md to posts/*.html using metadata from posts/posts.json.
 * Also regenerates sitemap.xml with article URLs.
 *
 * Run locally with `node scripts/render-articles.js`,
 * or let GitHub Actions run it automatically on every push.
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const SITE_URL = 'https://dr-maimai-yc-c-blog.vercel.app';
const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const OG_IMAGE = `${SITE_URL}/assets/images/og-image.jpg`;

// ---------- 讀文章 meta ----------
const manifest = JSON.parse(
  fs.readFileSync(path.join(POSTS_DIR, 'posts.json'), 'utf8')
);

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function escapeText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function formatDateZh(s) {
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// ---------- 文章模板 ----------
function renderArticleHtml(post, bodyHtml) {
  const url = `${SITE_URL}/posts/${post.slug}`;
  const tagsHtml = (post.tags || [])
    .map(t => `<span class="post-tag">${escapeText(t)}</span>`)
    .join('');
  const tagsMeta = (post.tags || [])
    .map(t => `<meta property="article:tag" content="${escapeAttr(t)}" />`)
    .join('\n  ');
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': `${url}#webpage`,
        url,
        name: post.title,
        description: post.excerpt || post.title,
        inLanguage: 'zh-Hant',
        lastReviewed: post.date,
        reviewedBy: { '@id': 'https://rong-yi.com.tw/team#zheng-yu-zhang' },
      },
      {
        '@type': 'Article',
        headline: post.title,
        datePublished: post.date,
        dateModified: post.date,
        author: {
          '@type': 'Physician',
          '@id': 'https://rong-yi.com.tw/team#zheng-yu-zhang',
          name: post.author || '鄭毓璋醫師',
        },
        publisher: {
          '@type': 'MedicalClinic',
          name: '榮逸聯合診所',
          url: 'https://rong-yi.com.tw',
        },
        mainEntityOfPage: { '@id': `${url}#webpage` },
        image: OG_IMAGE,
        keywords: (post.tags || []).join(', '),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首頁', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: '衛教文章', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeText(post.title)}｜鄭毓璋醫師</title>
  <meta name="description" content="${escapeAttr(post.excerpt || post.title)}" />
  <meta name="keywords" content="${escapeAttr((post.tags || []).concat(['鄭毓璋醫師','大腸直腸外科','榮逸聯合診所']).join(','))}" />
  <meta name="author" content="${escapeAttr(post.author || '鄭毓璋醫師')}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${url}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeAttr(post.title)}" />
  <meta property="og:description" content="${escapeAttr(post.excerpt || post.title)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${OG_IMAGE}" />
  <meta property="og:locale" content="zh_TW" />
  <meta property="og:site_name" content="鄭毓璋醫師衛教專欄" />
  <meta property="article:published_time" content="${post.date}" />
  <meta property="article:author" content="${escapeAttr(post.author || '鄭毓璋醫師')}" />
  <meta property="article:section" content="衛教文章" />
  ${tagsMeta}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(post.title)}" />
  <meta name="twitter:description" content="${escapeAttr(post.excerpt || post.title)}" />
  <meta name="twitter:image" content="${OG_IMAGE}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/css/style.css" />

  <script type="application/ld+json">
${JSON.stringify(schema, null, 2)}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="brand">
        <span class="brand-mark" aria-hidden="true">
          <img src="/assets/images/colon-icon.png" alt="大腸圖示" width="28" height="28" />
        </span>
        <span class="brand-text"><strong>鄭毓璋醫師</strong><small>大腸直腸外科</small></span>
      </a>
      <nav class="site-nav" aria-label="主選單">
        <button class="nav-toggle" aria-label="開啟選單" aria-expanded="false"><span></span><span></span><span></span></button>
        <ul class="nav-list">
          <li><a href="/">首頁</a></li>
          <li><a href="/about">關於醫師</a></li>
          <li><a href="/blog" class="active">衛教文章</a></li>
          <li><a href="/contact">聯絡資訊</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <article class="article">
      <div class="container narrow">
        <a href="/blog" class="back-link">← 返回文章列表</a>
        <header class="article-head">
          <div class="post-tags">${tagsHtml}</div>
          <h1>${escapeText(post.title)}</h1>
          <div class="article-meta">
            <span>${escapeText(post.author || '鄭毓璋醫師')}</span>
            <span>${formatDateZh(post.date)}</span>
          </div>
        </header>

        <div class="article-body">
${bodyHtml}
        </div>

        <aside class="author-card">
          <div class="bio-avatar small" aria-hidden="true">鄭</div>
          <div>
            <strong>關於鄭毓璋醫師</strong>
            <p>鄭毓璋醫師為台中榮逸聯合診所大腸直腸外科主治醫師，擁有中華民國大腸直腸外科專科醫師及一般外科專科醫師雙執照，專精微創痔瘡手術。</p>
            <p>診所網站：<a href="https://rong-yi.com.tw" target="_blank" rel="noopener">https://rong-yi.com.tw</a></p>
          </div>
        </aside>
      </div>
    </article>
  </main>

  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <strong>鄭毓璋醫師</strong>
        <p>大腸直腸外科 ・ 一般外科 雙專科</p>
        <p>台中榮逸聯合診所 主治醫師</p>
      </div>
      <div>
        <strong>連結</strong>
        <ul>
          <li><a href="/">首頁</a></li>
          <li><a href="/about">關於醫師</a></li>
          <li><a href="/blog">衛教文章</a></li>
          <li><a href="/contact">聯絡資訊</a></li>
        </ul>
      </div>
      <div>
        <strong>免責聲明</strong>
        <p class="footer-note">本網站資訊僅供衛教參考，不能取代專業醫療診斷。如有任何健康問題，請至醫療院所由專業醫師親自評估。</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <small>© <span id="year"></span> Dr. Yu-Chang Cheng (DRMAIMAI). All rights reserved.</small>
    </div>
  </footer>

  <script src="/assets/js/main.js"></script>
</body>
</html>
`;
}

// ---------- 移除 front-matter，只保留 markdown body ----------
function stripFrontMatter(text) {
  const m = text.match(/^---\s*\r?\n[\s\S]*?\r?\n---\s*\r?\n([\s\S]*)$/);
  return m ? m[1] : text;
}

// ---------- 主流程 ----------
let count = 0;
for (const post of manifest) {
  const mdPath = path.join(POSTS_DIR, `${post.slug}.md`);
  const htmlPath = path.join(POSTS_DIR, `${post.slug}.html`);
  if (!fs.existsSync(mdPath)) {
    console.warn(`⚠️  Missing markdown: ${mdPath}`);
    continue;
  }
  const raw = fs.readFileSync(mdPath, 'utf8');
  const body = stripFrontMatter(raw);
  const bodyHtml = marked.parse(body, { breaks: false, gfm: true });
  const html = renderArticleHtml(post, bodyHtml);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`✅ ${post.slug}.html`);
  count++;
}

// ---------- 重新產生 sitemap.xml ----------
const today = new Date().toISOString().slice(0, 10);
const sitemapItems = [
  { loc: `${SITE_URL}/`,        lastmod: today, freq: 'weekly',  pri: '1.0' },
  { loc: `${SITE_URL}/about`,   lastmod: today, freq: 'monthly', pri: '0.9' },
  { loc: `${SITE_URL}/blog`,    lastmod: today, freq: 'weekly',  pri: '0.9' },
  { loc: `${SITE_URL}/contact`, lastmod: today, freq: 'monthly', pri: '0.8' },
  ...manifest.map(p => ({
    loc: `${SITE_URL}/posts/${p.slug}`,
    lastmod: p.date,
    freq: 'monthly',
    pri: '0.8',
  })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapItems.map(i => `  <url>
    <loc>${i.loc}</loc>
    <lastmod>${i.lastmod}</lastmod>
    <changefreq>${i.freq}</changefreq>
    <priority>${i.pri}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
console.log(`✅ sitemap.xml updated (${sitemapItems.length} URLs)`);

console.log(`\n🎉 Done. Rendered ${count} articles.`);
