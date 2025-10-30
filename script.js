// 年份与主题
(function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.dataset.theme = saved;
  btn?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
  });
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();

// 移动端导航
(function navMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const list = document.getElementById('nav-list');
  toggle?.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    list?.classList.toggle('open');
  });
  list?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    list.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
})();

// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id === '#' || id.length < 2) return;
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 站内搜索（简单标题/正文匹配）
(function siteSearch() {
  const input = document.getElementById('site-search');
  const menu = document.getElementById('search-results');
  if (!input || !menu) return;
  const sections = Array.from(document.querySelectorAll('main .section'));

  function resultsOf(q) {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return sections
      .map(sec => {
        const id = sec.id || '';
        const title = (sec.querySelector('h2')?.textContent || '').trim();
        const text = (sec.textContent || '').trim().toLowerCase();
        const score = (title.toLowerCase().includes(s) ? 3 : 0) + (text.includes(s) ? 1 : 0);
        return score > 0 ? { id, title, score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }

  function render(items) {
    menu.innerHTML = '';
    if (items.length === 0) { menu.classList.remove('show'); return; }
    const frag = document.createDocumentFragment();
    items.forEach(it => {
      const li = document.createElement('li');
      li.textContent = it.title || ('#' + it.id);
      li.addEventListener('click', () => {
        location.hash = '#' + it.id;
        menu.classList.remove('show');
      });
      frag.appendChild(li);
    });
    menu.appendChild(frag);
    menu.classList.add('show');
  }

  let tm;
  input.addEventListener('input', () => {
    clearTimeout(tm);
    tm = setTimeout(() => render(resultsOf(input.value)), 120);
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== input) menu.classList.remove('show');
  });
})();

// 从 extracted/sections 加载“来自手册要点”片段（若存在）
(function loadFragments(){
  const map = {
    start: 'start-source',
    import: 'import-source',
    manage: 'manage-source',
    cite: 'cite-source',
    styles: 'styles-source',
    sync: 'sync-source',
    advanced: 'advanced-source',
  };
  Object.entries(map).forEach(([key, targetId]) => {
    fetch(`extracted/sections_en/${key}.html`).then(r => {
      if (!r.ok) throw new Error('no fragment');
      return r.text();
    }).then(html => {
      const el = document.getElementById(targetId);
      if (el && html.trim()) el.innerHTML = html;
    }).catch(()=>{});
  });
  // PPT 图集
  fetch('extracted/sections_en/ppt-gallery.html').then(r=>{if(!r.ok) throw 0; return r.text();}).then(html=>{
    const el = document.getElementById('ppt-gallery');
    if (el && html.trim()) el.innerHTML = html;
  }).catch(()=>{});
})();
