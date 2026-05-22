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
   Scroll-reveal：元素進入視窗時加 .in-view 觸發 CSS 動畫
   ----------------------------------------------------------- */
(function () {
  if (!('IntersectionObserver' in window)) return;
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return;

  function setup() {
    const targets = document.querySelectorAll([
      '.hero-text', '.hero-card',
      '.section-head',
      '.card', '.post-card', '.info-block',
      '.cta-card', '.bio-card',
      '.cta-banner', '.notice-box',
      '.contact-card', '.contact-side',
      '.author-card', '.article-head',
      '.media-list li'
    ].join(','));
    targets.forEach(el => el.classList.add('reveal'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => io.observe(el));
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
