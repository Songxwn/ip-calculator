(() => {
  'use strict';

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };

  const I18N = {
    zh: {
      brand: 'IP 工具箱', brandSub: '本机 IP · 网络诊断 · 子网计算',
      nav_home: '本机 IP', nav_split: '分流检测', nav_cdn: 'CDN 节点', nav_dns: 'DNS 出口',
      nav_webrtc: 'WebRTC', nav_query: 'IP 查询', nav_calc: 'IP 计算器',
      switchLang: '切换语言', switchTheme: '切换主题',
      themeAuto: '自动', themeLight: '浅色', themeDark: '深色',
      copied: '已复制', linkCopied: '分享链接已复制', na: '不适用',
      footer: '纯静态站点 · 子网计算完全在本地完成；网络检测由你的浏览器直接请求第三方公开接口',
      tPublic: '公网地址', tPrivate: '私有地址', tLoopback: '环回地址', tLinkLocal: '链路本地', tMulticast: '组播',
      tReserved: '保留地址', tCGNAT: '运营商级 NAT', tDoc: '文档示例', tBench: '基准测试', tThis: '本网络',
      tBroadcast: '受限广播', tUnspec: '未指定地址', tMapped: 'IPv4 映射', tNAT64: 'NAT64', tTeredo: 'Teredo',
      t6to4: '6to4', tULA: '唯一本地 ULA', tGUA: '全球单播', tDiscard: '丢弃前缀', tIETF: 'IETF 协议分配', t6to4Relay: '6to4 中继'
    },
    en: {
      brand: 'IP Toolbox', brandSub: 'My IP · Network diagnostics · Subnetting',
      nav_home: 'My IP', nav_split: 'Split Tunnel', nav_cdn: 'CDN Nodes', nav_dns: 'DNS Egress',
      nav_webrtc: 'WebRTC', nav_query: 'IP Lookup', nav_calc: 'IP Calculator',
      switchLang: 'Switch language', switchTheme: 'Switch theme',
      themeAuto: 'Auto', themeLight: 'Light', themeDark: 'Dark',
      copied: 'Copied', linkCopied: 'Share link copied', na: 'N/A',
      footer: '100% static · subnet math runs locally; network checks are requested by your browser directly from public third-party APIs',
      tPublic: 'Public', tPrivate: 'Private', tLoopback: 'Loopback', tLinkLocal: 'Link-local', tMulticast: 'Multicast',
      tReserved: 'Reserved', tCGNAT: 'Carrier-grade NAT', tDoc: 'Documentation', tBench: 'Benchmarking', tThis: 'This network',
      tBroadcast: 'Limited broadcast', tUnspec: 'Unspecified', tMapped: 'IPv4-mapped', tNAT64: 'NAT64', tTeredo: 'Teredo',
      t6to4: '6to4', tULA: 'Unique local (ULA)', tGUA: 'Global unicast', tDiscard: 'Discard prefix', tIETF: 'IETF protocol assignment', t6to4Relay: '6to4 relay'
    }
  };

  const IPC = window.IPC = { store, I18N };
  IPC.lang = store.get('ipc-lang', (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
  IPC.addI18n = (o) => { for (const l in o) Object.assign(I18N[l] || (I18N[l] = {}), o[l]); };
  IPC.t = (k, vars) => {
    let s = (I18N[IPC.lang] && I18N[IPC.lang][k]) || I18N.en[k] || k;
    if (vars) for (const v in vars) s = s.split('{' + v + '}').join(vars[v]);
    return s;
  };
  IPC.$ = (s) => document.querySelector(s);
  IPC.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  IPC.fmt = (n) => { try { return n.toLocaleString(IPC.lang === 'zh' ? 'zh-CN' : 'en-US'); } catch (e) { return String(n); } };
  const t = IPC.t;

  /* ---------------- IP math (BigInt) ---------------- */
  const BITS = { 4: 32, 6: 128 };
  const MAX = { 4: (1n << 32n) - 1n, 6: (1n << 128n) - 1n };

  function parseV4(s) {
    const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
    if (!m) return null;
    let n = 0n;
    for (let i = 1; i <= 4; i++) {
      const o = Number(m[i]);
      if (o > 255) return null;
      n = (n << 8n) | BigInt(o);
    }
    return n;
  }

  function parseV6(s) {
    s = s.replace(/%.*$/, '');
    if (!/^[0-9a-fA-F:.]+$/.test(s) || s.indexOf(':') < 0) return null;
    if (s.indexOf('.') >= 0) {
      const lc = s.lastIndexOf(':');
      const v4 = parseV4(s.slice(lc + 1));
      if (v4 == null) return null;
      s = s.slice(0, lc + 1) + (v4 >> 16n).toString(16) + ':' + (v4 & 0xffffn).toString(16);
    }
    const parts = s.split('::');
    if (parts.length > 2) return null;
    const head = parts[0] ? parts[0].split(':') : [];
    const tail = parts.length === 2 && parts[1] ? parts[1].split(':') : [];
    let groups;
    if (parts.length === 1) {
      if (head.length !== 8) return null;
      groups = head;
    } else {
      if (head.length + tail.length > 7) return null;
      groups = head.concat(Array(8 - head.length - tail.length).fill('0'), tail);
    }
    let n = 0n;
    for (const g of groups) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null;
      n = (n << 16n) | BigInt(parseInt(g, 16));
    }
    return n;
  }

  const v4str = (n) => [24n, 16n, 8n, 0n].map((s) => Number((n >> s) & 255n)).join('.');
  const v6groups = (n) => { const g = []; for (let i = 7; i >= 0; i--) g.push(Number((n >> BigInt(i * 16)) & 0xffffn)); return g; };

  function v6str(n) {
    if (n >> 32n === 0xffffn) return '::ffff:' + v4str(n & 0xffffffffn);
    const g = v6groups(n);
    let bs = -1, bl = 0;
    for (let i = 0; i < 8;) {
      if (g[i] === 0) {
        let j = i; while (j < 8 && g[j] === 0) j++;
        if (j - i > bl && j - i >= 2) { bs = i; bl = j - i; }
        i = j;
      } else i++;
    }
    const h = g.map((x) => x.toString(16));
    if (bs < 0) return h.join(':');
    return h.slice(0, bs).join(':') + '::' + h.slice(bs + bl).join(':');
  }
  const v6full = (n) => v6groups(n).map((x) => x.toString(16).padStart(4, '0')).join(':');
  const ipstr = (n, v) => (v === 4 ? v4str(n) : v6str(n));

  function maskOf(p, v) {
    if (p === 0) return 0n;
    return ((1n << BigInt(p)) - 1n) << BigInt(BITS[v] - p);
  }
  function prefixOfMask(m, v) {
    const inv = ~m & MAX[v];
    if ((inv & (inv + 1n)) !== 0n) return -1;
    let c = 0, x = m;
    while (x) { c += Number(x & 1n); x >>= 1n; }
    return c;
  }
  const inNet = (n, net, p, v) => { const m = maskOf(p, v); return (n & m) === (net & m); };

  function parseAddr(s) {
    s = String(s || '').trim().replace(/^\[|\]$/g, '');
    if (s.indexOf(':') >= 0) { const n = parseV6(s); return n == null ? null : { n, v: 6 }; }
    const n = parseV4(s); return n == null ? null : { n, v: 4 };
  }

  const TYPES = {
    4: [
      ['255.255.255.255/32', 'tBroadcast', 'warn'], ['0.0.0.0/8', 'tThis', 'warn'], ['10.0.0.0/8', 'tPrivate', 'ok'],
      ['100.64.0.0/10', 'tCGNAT', 'warn'], ['127.0.0.0/8', 'tLoopback', 'warn'], ['169.254.0.0/16', 'tLinkLocal', 'warn'],
      ['172.16.0.0/12', 'tPrivate', 'ok'], ['192.0.0.0/24', 'tIETF', 'warn'], ['192.0.2.0/24', 'tDoc', 'warn'],
      ['192.88.99.0/24', 't6to4Relay', 'warn'], ['192.168.0.0/16', 'tPrivate', 'ok'], ['198.18.0.0/15', 'tBench', 'warn'],
      ['198.51.100.0/24', 'tDoc', 'warn'], ['203.0.113.0/24', 'tDoc', 'warn'], ['224.0.0.0/4', 'tMulticast', 'warn'],
      ['240.0.0.0/4', 'tReserved', 'warn']
    ],
    6: [
      ['::/128', 'tUnspec', 'warn'], ['::1/128', 'tLoopback', 'warn'], ['::ffff:0:0/96', 'tMapped', 'warn'],
      ['64:ff9b::/96', 'tNAT64', 'warn'], ['100::/64', 'tDiscard', 'warn'], ['2001::/32', 'tTeredo', 'warn'],
      ['2001:db8::/32', 'tDoc', 'warn'], ['2002::/16', 't6to4', 'warn'], ['fc00::/7', 'tULA', 'ok'],
      ['fe80::/10', 'tLinkLocal', 'warn'], ['ff00::/8', 'tMulticast', 'warn'], ['2000::/3', 'tGUA', '']
    ]
  };
  function typeOf(n, v) {
    for (const [cidr, key, cls] of TYPES[v]) {
      const [a, pp] = cidr.split('/');
      const net = v === 4 ? parseV4(a) : parseV6(a);
      if (inNet(n, net, Number(pp), v)) return { key, cls, isPublic: key === 'tGUA' };
    }
    return { key: v === 4 ? 'tPublic' : 'tReserved', cls: v === 4 ? '' : 'warn', isPublic: v === 4 };
  }

  Object.assign(IPC, { BITS, MAX, parseV4, parseV6, v4str, v6str, v6full, ipstr, maskOf, prefixOfMask, inNet, parseAddr, typeOf });

  /* ---------------- Toast & clipboard ---------------- */
  let toastTimer;
  IPC.toast = (msg) => {
    const el = IPC.$('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  };
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { }
    ta.remove();
  }
  IPC.copy = (text, msg) => {
    const done = () => IPC.toast(msg || t('copied'));
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    else fallbackCopy(text, done);
  };
  IPC.ICON_COPY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  IPC.ICON_REFRESH = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8"/><path d="M21 3v5h-5"/></svg>';
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy]');
    if (c) { e.preventDefault(); IPC.copy(c.dataset.copy); }
  });

  /* ---------------- Theme ---------------- */
  let themeMode = store.get('ipc-theme-mode', 'auto');
  const mq = matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    const dark = themeMode === 'dark' || (themeMode === 'auto' && mq.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.mode = themeMode;
    IPC.$('#themeLabel').textContent = t(themeMode === 'auto' ? 'themeAuto' : themeMode === 'light' ? 'themeLight' : 'themeDark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0b0d14' : '#f5f6fb';
    try { localStorage.setItem('ipc-theme', themeMode); } catch (e) { }
  }
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(() => { if (themeMode === 'auto') applyTheme(); });

  /* ---------------- Router ---------------- */
  const pages = {};
  const inited = new Set();
  let current = null;
  IPC.register = (name, page) => { pages[name] = page; };
  IPC.current = () => current;

  function parseHash() {
    const h = location.hash.slice(1);
    if (!h || h === '/') return { name: 'home', params: new URLSearchParams() };
    if (h[0] !== '/') return { name: 'calc', params: new URLSearchParams('q=' + encodeURIComponent(decodeURIComponent(h))) };
    const i = h.indexOf('?');
    const name = (i < 0 ? h.slice(1) : h.slice(1, i)) || 'home';
    return { name: pages[name] ? name : 'home', params: new URLSearchParams(i < 0 ? '' : h.slice(i + 1)) };
  }
  IPC.hashQuery = (obj) => Object.keys(obj).filter((k) => obj[k] != null && obj[k] !== '')
    .map((k) => k + '=' + encodeURIComponent(obj[k]).replace(/%2F/g, '/').replace(/%3A/g, ':')).join('&');
  IPC.setHash = (name, obj) => {
    const q = obj ? IPC.hashQuery(obj) : '';
    history.replaceState(null, '', '#/' + (name === 'home' ? '' : name) + (q ? '?' + q : ''));
  };

  function setTitle() {
    document.title = (current && current !== 'home' ? t('nav_' + current) + ' · ' : '') + t('brand') + (current === 'home' ? ' · ' + t('nav_home') : '');
  }

  function route() {
    const r = parseHash();
    const p = pages[r.name];
    document.querySelectorAll('.page').forEach((s) => s.classList.toggle('active', s.id === 'page-' + r.name));
    document.querySelectorAll('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.route === r.name));
    const changed = current !== r.name;
    current = r.name;
    if (!inited.has(r.name)) { inited.add(r.name); if (p.init) p.init(); }
    if (p.enter) p.enter(r.params);
    setTitle();
    if (changed) {
      window.scrollTo(0, 0);
      const link = document.querySelector('.nav-link.active');
      if (link && link.scrollIntoView) link.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  /* ---------------- Language ---------------- */
  function applyLang() {
    document.documentElement.lang = IPC.lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach((e) => { e.title = t(e.dataset.i18nTitle); e.setAttribute('aria-label', e.title); });
    document.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.placeholder = t(e.dataset.i18nPh); });
    IPC.$('#langLabel').textContent = IPC.lang === 'zh' ? 'EN' : '中文';
    applyTheme();
    setTitle();
    inited.forEach((n) => { if (pages[n].lang) pages[n].lang(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    IPC.$('#langBtn').addEventListener('click', () => {
      IPC.lang = IPC.lang === 'zh' ? 'en' : 'zh';
      store.set('ipc-lang', IPC.lang);
      applyLang();
    });
    IPC.$('#themeBtn').addEventListener('click', () => {
      themeMode = { auto: 'light', light: 'dark', dark: 'auto' }[themeMode] || 'auto';
      store.set('ipc-theme-mode', themeMode);
      applyTheme();
    });
    window.addEventListener('hashchange', route);
    applyLang();
    route();
  });
})();
