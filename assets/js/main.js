/* ===========================================================
   鄭毓璋醫師部落格 - 共用 JS
   負責：手機選單、文章載入、Markdown 渲染、搜尋與篩選
   =========================================================== */

(function () {
  // 頁尾年份
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 手機選單
  const toggle = document.querySelector('.nav-toggle');
  const list = document.querySelector('.nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', () => {
      const open = list.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
})();

/* -----------------------------------------------------------
   Header 透明 → 捲動或聚焦時變白底
   ----------------------------------------------------------- */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  function onScroll() {
    if (window.scrollY > 40) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // 鍵盤聚焦時也視為「使用中」
  header.addEventListener('focusin', () => header.classList.add('is-focused'));
  header.addEventListener('focusout', () => header.classList.remove('is-focused'));
})();

/* -----------------------------------------------------------
   自製語言切換器 — 點選後同步至隱藏的 Google Translate <select>
   ----------------------------------------------------------- */
(function () {
  const switchers = document.querySelectorAll('[data-lang-switcher]');
  if (!switchers.length) return;

  // 從 cookie 讀取目前語言（Google Translate 用 googtrans cookie）
  function getCurrentLang() {
    const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    return m ? m[1] : 'zh-TW';
  }

  // 清除既有 googtrans cookie（多種 domain 變體都清）
  function clearGoogtransCookies() {
    const domains = ['', '.' + location.hostname, location.hostname];
    domains.forEach((d) => {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/' + (d ? '; domain=' + d : '');
    });
  }

  // 設定語言：寫入 cookie + reload，讓 Google Translate 整頁翻譯
  function setLang(lang) {
    clearGoogtransCookies();
    if (lang === 'zh-TW') {
      // 回到原文，重整即可
      location.reload();
      return;
    }
    const value = `/zh-TW/${lang}`;
    document.cookie = `googtrans=${value}; path=/`;
    // 同時對 root domain 設一次，避免子網域問題
    try { document.cookie = `googtrans=${value}; path=/; domain=.${location.hostname}`; } catch (e) {}
    location.reload();
  }

  switchers.forEach((root) => {
    const btn = root.querySelector('.lang-button');
    const menu = root.querySelector('.lang-menu');
    const flagBtn = btn.querySelector('.lang-flag');
    const labelBtn = btn.querySelector('.lang-name-short');
    const options = root.querySelectorAll('.lang-option');

    // 標記目前語言
    const cur = getCurrentLang();
    options.forEach((o) => {
      o.classList.toggle('is-current', o.dataset.lang === cur);
      if (o.dataset.lang === cur) {
        flagBtn.textContent = o.querySelector('.lang-flag').textContent;
        labelBtn.textContent = o.querySelector('.lang-name').textContent.slice(0, 6);
      }
    });

    // 開關下拉
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = root.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    // 點外面關閉
    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) {
        root.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // ESC 鍵關閉
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        root.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // 選擇語言
    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        const lang = opt.dataset.lang;
        options.forEach((o) => o.classList.remove('is-current'));
        opt.classList.add('is-current');
        flagBtn.textContent = opt.querySelector('.lang-flag').textContent;
        labelBtn.textContent = opt.querySelector('.lang-name').textContent.slice(0, 6);
        root.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        setLang(lang);
      });
    });
  });
})();

/* -----------------------------------------------------------
   Scroll-reveal：元素進入視窗時加 .in-view 觸發 CSS 動畫
   ----------------------------------------------------------- */
(function () {
  if (!('IntersectionObserver' in window)) return;
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return;

  function setup() {
    // 不同元件用不同方向，避免單調
    const groups = [
      { selector: '.hero-text',                cls: 'reveal reveal-left' },
      { selector: '.hero-card',                cls: 'reveal reveal-right' },
      { selector: '.section-head',             cls: 'reveal reveal-up-lg' },
      { selector: '.card',                     cls: 'reveal reveal-scale' },
      { selector: '.post-card',                cls: 'reveal' },
      { selector: '.info-block',               cls: 'reveal reveal-left' },
      { selector: '.cta-card',                 cls: 'reveal reveal-scale' },
      { selector: '.bio-card',                 cls: 'reveal reveal-up-lg' },
      { selector: '.cta-banner',               cls: 'reveal' },
      { selector: '.notice-box',               cls: 'reveal' },
      { selector: '.contact-card',             cls: 'reveal reveal-left' },
      { selector: '.contact-side',             cls: 'reveal reveal-right' },
      { selector: '.author-card',              cls: 'reveal reveal-scale' },
      { selector: '.article-head',             cls: 'reveal reveal-up-lg' },
      { selector: '.media-list li',            cls: 'reveal' }
    ];

    const allTargets = [];
    groups.forEach(({ selector, cls }) => {
      document.querySelectorAll(selector).forEach((el) => {
        cls.split(' ').forEach((c) => el.classList.add(c));
        allTargets.push(el);
      });
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -60px 0px' });

    allTargets.forEach(el => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();


/* -----------------------------------------------------------
   讀取文章清單 (posts/posts.json)
   ----------------------------------------------------------- */
let _postsCache = null;
async function fetchPosts() {
  if (_postsCache) return _postsCache;
  try {
    const res = await fetch('posts/posts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('讀取文章清單失敗');
    const data = await res.json();
    // 依日期由新到舊排序
    data.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    _postsCache = data;
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}

function formatDate(s) {
  if (!s) return '';
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function postCardHtml(post) {
  const tagsHtml = (post.tags || [])
    .map((t) => `<span class="post-tag">${escapeHtml(t)}</span>`)
    .join('');
  return `
    <a href="/posts/${encodeURIComponent(post.slug)}" class="post-card">
      <div class="post-tags">${tagsHtml}</div>
      <h3>${escapeHtml(post.title)}</h3>
      <p class="post-excerpt">${escapeHtml(post.excerpt || '')}</p>
      <div class="post-meta">
        <span>${escapeHtml(post.author || '鄭毓璋醫師')}</span>
        <span>${formatDate(post.date)}</span>
      </div>
    </a>
  `;
}

/* -----------------------------------------------------------
   首頁：渲染最新 N 篇文章
   ----------------------------------------------------------- */
async function renderLatestPosts(containerId, limit = 3) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const posts = await fetchPosts();
  if (!posts.length) {
    el.innerHTML = '<p class="empty-state">尚未發布文章，敬請期待。</p>';
    return;
  }
  el.innerHTML = posts.slice(0, limit).map(postCardHtml).join('');
}

/* -----------------------------------------------------------
   部落格列表頁：渲染所有文章 + 搜尋 + 標籤篩選
   ----------------------------------------------------------- */
async function renderAllPosts(containerId, searchId, tagFilterId) {
  const container = document.getElementById(containerId);
  const searchInput = document.getElementById(searchId);
  const tagWrap = document.getElementById(tagFilterId);
  if (!container) return;

  const posts = await fetchPosts();
  if (!posts.length) {
    container.innerHTML = '<p class="empty-state">尚未發布文章，敬請期待。</p>';
    return;
  }

  // 收集所有標籤
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags || []))
  ).sort();
  if (tagWrap) {
    tagWrap.innerHTML =
      `<button class="tag-btn active" data-tag="">全部</button>` +
      allTags
        .map(
          (t) => `<button class="tag-btn" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`
        )
        .join('');
  }

  let activeTag = '';
  let keyword = '';

  function apply() {
    const k = keyword.trim().toLowerCase();
    const filtered = posts.filter((p) => {
      const matchTag = !activeTag || (p.tags || []).includes(activeTag);
      const haystack = [
        p.title,
        p.excerpt,
        (p.tags || []).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      const matchKw = !k || haystack.includes(k);
      return matchTag && matchKw;
    });
    if (!filtered.length) {
      container.innerHTML = '<p class="empty-state">沒有符合條件的文章。</p>';
    } else {
      container.innerHTML = filtered.map(postCardHtml).join('');
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      keyword = e.target.value;
      apply();
    });
  }
  if (tagWrap) {
    tagWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.tag-btn');
      if (!btn) return;
      tagWrap.querySelectorAll('.tag-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      activeTag = btn.dataset.tag || '';
      apply();
    });
  }

  apply();
}

/* -----------------------------------------------------------
   單篇文章頁：讀取 markdown 並渲染
   ----------------------------------------------------------- */
function parseFrontMatter(text) {
  // 簡易 YAML front matter 解析：--- key: value ---
  const meta = {};
  let body = text;
  const fmMatch = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (fmMatch) {
    const block = fmMatch[1];
    body = fmMatch[2];
    block.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (!m) return;
      const key = m[1];
      let val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        val = val
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
      } else {
        val = val.replace(/^["']|["']$/g, '');
      }
      meta[key] = val;
    });
  }
  return { meta, body };
}

async function renderSinglePost() {
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const titleEl = document.getElementById('post-title');
  const contentEl = document.getElementById('post-content');
  const tagsEl = document.getElementById('post-tags');
  const dateEl = document.getElementById('post-date');
  const authorEl = document.getElementById('post-author');
  const metaDescEl = document.getElementById('meta-description');
  const navEl = document.getElementById('post-nav');

  if (!slug) {
    if (titleEl) titleEl.textContent = '找不到文章';
    if (contentEl)
      contentEl.innerHTML = '<p>請從 <a href="blog.html">文章列表</a> 選擇文章閱讀。</p>';
    return;
  }

  const posts = await fetchPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    if (titleEl) titleEl.textContent = '找不到此文章';
    if (contentEl)
      contentEl.innerHTML = '<p>該文章可能已移除，請回 <a href="blog.html">文章列表</a>。</p>';
    return;
  }

  // 從 posts.json 先顯示 meta
  if (titleEl) titleEl.textContent = post.title;
  if (dateEl) dateEl.textContent = formatDate(post.date);
  if (authorEl) authorEl.textContent = post.author || '鄭毓璋醫師';
  if (tagsEl)
    tagsEl.innerHTML = (post.tags || [])
      .map((t) => `<span class="post-tag">${escapeHtml(t)}</span>`)
      .join('');
  document.title = `${post.title}｜鄭毓璋醫師`;
  if (metaDescEl) metaDescEl.setAttribute('content', post.excerpt || post.title);

  // 載入 markdown
  try {
    const res = await fetch(`posts/${post.slug}.md`, { cache: 'no-store' });
    if (!res.ok) throw new Error('讀取文章失敗：' + res.status);
    const md = await res.text();
    const { body } = parseFrontMatter(md);
    const rawHtml = window.marked
      ? window.marked.parse(body, { breaks: false, gfm: true })
      : escapeHtml(body);
    const safeHtml = window.DOMPurify ? window.DOMPurify.sanitize(rawHtml) : rawHtml;
    if (contentEl) contentEl.innerHTML = safeHtml;
  } catch (err) {
    console.error(err);
    if (contentEl)
      contentEl.innerHTML =
        '<p>很抱歉，目前無法載入此文章內容，請稍後再試。</p>';
  }

  // 上一篇 / 下一篇導覽
  if (navEl) {
    const idx = posts.findIndex((p) => p.slug === slug);
    const prev = idx > 0 ? posts[idx - 1] : null; // 較新的
    const next = idx < posts.length - 1 ? posts[idx + 1] : null; // 較舊的
    let html = '';
    if (next) {
      html += `<a href="post.html?slug=${encodeURIComponent(next.slug)}">
        <small>← 較舊文章</small><strong>${escapeHtml(next.title)}</strong>
      </a>`;
    }
    if (prev) {
      html += `<a href="post.html?slug=${encodeURIComponent(prev.slug)}" style="text-align:right">
        <small>較新文章 →</small><strong>${escapeHtml(prev.title)}</strong>
      </a>`;
    }
    navEl.innerHTML = html;
  }
}
