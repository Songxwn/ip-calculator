(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, store, net } = IPC;
  const { req, jsonp, N, geo, locText, ispText, ccBadge, latClass, errText, ping } = net;

  IPC.addI18n({
    zh: {
      homeTitle: '本机 IP 查询', homeDesc: '查看你当前网络的 IPv4 / IPv6 地址、归属地与网络连通性',
      location: '归属地', isp: '运营商 / ISP', asn: 'ASN', noV6: '未检测到 IPv6 连接', noV4: '未检测到 IPv4 连接',
      multiSrc: '多源出口 IP', multiSrcDesc: '国内与国际服务分别看到的出口 IP。如果两者不同，说明你的网络存在分流。',
      domestic: '国内', intl: '国际', hideIp: '隐藏 IP', hideCn: '隐藏国内', hideIntl: '隐藏国际',
      connTitle: '网站连通性', connDesc: '从浏览器直接请求各网站，测量往返延迟（首个结果包含 DNS 与 TLS 握手）',
      moreSplit: '完整的分流检测请使用「分流检测」页面', toCalc: '在计算器中打开'
    },
    en: {
      homeTitle: 'What is my IP', homeDesc: 'Your current IPv4 / IPv6 addresses, location and connectivity',
      location: 'Location', isp: 'ISP', asn: 'ASN', noV6: 'No IPv6 connectivity detected', noV4: 'No IPv4 connectivity detected',
      multiSrc: 'Egress IP by source', multiSrcDesc: 'Your public IP as seen by domestic (China) and international services. Different results mean your traffic is split.',
      domestic: 'CN', intl: 'Intl', hideIp: 'Hide IP', hideCn: 'Hide CN', hideIntl: 'Hide Intl',
      connTitle: 'Connectivity', connDesc: 'Round-trip time measured by your browser (the first sample includes DNS and TLS handshake)',
      moreSplit: 'For a full split-tunnel check, use the Split Tunnel page', toCalc: 'Open in calculator'
    }
  });

  const SOURCES = [
    { id: 'n126', name: '网易 126', region: 'cn', run: () => jsonp('https://ipservice.ws.126.net/locate/api/getLocByIp').then((r) => N.n126(r.data)) },
    { id: 'pconline', name: '太平洋 PConline', region: 'cn', run: () => jsonp('https://whois.pconline.com.cn/ipJson.jsp', { charset: 'gbk' }).then((r) => N.pconline(r.data)) },
    { id: 'speedtestcn', name: '测速网 Speedtest.cn', region: 'cn', run: () => req('https://api-v3.speedtest.cn/ip').then((r) => N.speedtestcn(r.data)) },
    { id: 'cf', name: 'Cloudflare', region: 'intl', run: () => req('https://speed.cloudflare.com/meta').then((r) => N.cfmeta(r.data)) },
    { id: 'ipinfo', name: 'IPinfo.io', region: 'intl', run: () => req('https://ipinfo.io/json').then((r) => N.ipinfo(r.data)) },
    { id: 'ipapis', name: 'ipapi.is', region: 'intl', run: () => req('https://api.ipapi.is/').then((r) => N.ipapis(r.data)) }
  ];

  const SITES = [
    { name: '百度', region: 'cn', url: 'https://www.baidu.com/favicon.ico' },
    { name: 'Bilibili', region: 'cn', url: 'https://www.bilibili.com/favicon.ico' },
    { name: '淘宝', region: 'cn', url: 'https://www.taobao.com/favicon.ico' },
    { name: '微信', region: 'cn', url: 'https://mp.weixin.qq.com/favicon.ico' },
    { name: '抖音', region: 'cn', url: 'https://www.douyin.com/favicon.ico' },
    { name: 'GitHub', region: 'intl', url: 'https://github.com/favicon.ico' },
    { name: 'Cloudflare', region: 'intl', url: 'https://www.cloudflare.com/favicon.ico' },
    { name: 'jsDelivr', region: 'intl', url: 'https://cdn.jsdelivr.net/favicon.ico' },
    { name: 'Google', region: 'intl', url: 'https://www.google.com/favicon.ico' },
    { name: 'YouTube', region: 'intl', url: 'https://www.youtube.com/favicon.ico' },
    { name: 'ChatGPT', region: 'intl', url: 'https://chatgpt.com/cdn-cgi/trace' }
  ];
  const ROUNDS = 8;

  let el, opts, runId = 0;
  const results = { v4: null, v6: null, src: {}, ping: {} };

  const regionTag = (r) => `<span class="tag ${r === 'cn' ? 'cn' : 'intl'}">${t(r === 'cn' ? 'domestic' : 'intl')}</span>`;
  const ipLink = (ip) => ip ? `<a class="ipv mono" href="#/query?ip=${encodeURIComponent(ip)}" title="${esc(ip)}">${esc(ip)}</a>` : '';

  function renderMain(ver) {
    const r = results[ver], box = el[ver];
    const label = ver === 'v4' ? 'IPv4' : 'IPv6';
    let body;
    if (!r) body = `<div class="big-ip skel"></div><div class="kv"><span>${t('location')}</span><b class="skel"></b></div><div class="kv"><span>${t('isp')}</span><b class="skel"></b></div><div class="kv"><span>${t('asn')}</span><b class="skel"></b></div>`;
    else if (r.error) body = `<div class="big-ip muted none">${t(ver === 'v4' ? 'noV4' : 'noV6')}</div>`;
    else {
      const g = r.geo || {};
      body = `<div class="big-ip"><span class="ipv mono">${esc(r.ip)}</span>
          <button class="copy show" type="button" data-copy="${esc(r.ip)}" title="Copy">${IPC.ICON_COPY}</button>
          <a class="copy show" href="#/calc?q=${encodeURIComponent(r.ip)}" title="${t('toCalc')}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M12 10h2M16 10v8M8 14h2M12 14h2M8 18h6"/></svg></a></div>
        <div class="kv"><span>${t('location')}</span><b>${ccBadge(g.cc)}${esc(locText(g)) || '—'}</b></div>
        <div class="kv"><span>${t('isp')}</span><b>${esc(g.isp || g.org || '—')}</b></div>
        <div class="kv"><span>${t('asn')}</span><b class="mono">${g.asn ? 'AS' + esc(g.asn) : '—'}</b></div>`;
    }
    box.innerHTML = `<div class="ip-head"><span class="ver-badge ${ver === 'v6' ? 'v6' : ''}">${label}</span></div>${body}`;
  }

  function renderSources() {
    el.src.innerHTML = SOURCES.map((s) => {
      const r = results.src[s.id];
      let body;
      if (!r) body = `<div class="src-ip"><span class="skel" style="width:8rem"></span></div><div class="src-loc"><span class="skel" style="width:11rem"></span></div>`;
      else if (r.error) body = `<div class="src-ip err">${esc(r.error)}</div>`;
      else body = `<div class="src-ip">${ipLink(r.ip)}</div><div class="src-loc">${ccBadge(r.cc)}${esc([locText(r), r.locText ? '' : ispText(r)].filter(Boolean).join(' · ')) || '—'}</div>`;
      return `<div class="src-card" data-region="${s.region}"><div class="src-head"><b>${esc(s.name)}</b>${regionTag(s.region)}</div>${body}</div>`;
    }).join('');
  }

  function renderPing() {
    el.ping.innerHTML = SITES.map((s) => {
      const arr = results.ping[s.name] || [];
      const last = arr.length ? arr[arr.length - 1] : undefined;
      const dots = [];
      for (let i = 0; i < ROUNDS; i++) {
        const v = arr[i];
        dots.push(`<i class="dot ${v === undefined ? '' : latClass(v)}" title="${v === undefined ? '…' : v == null ? t('errTimeout') : v + ' ms'}"></i>`);
      }
      const ok = arr.filter((x) => x != null);
      const best = ok.length ? Math.min(...ok) : null;
      return `<div class="ping-row" data-region="${s.region}">
        <div class="ping-name"><b>${esc(s.name)}</b>${regionTag(s.region)}</div>
        <div class="ping-ms ${last === undefined ? '' : latClass(last)}">${last === undefined ? '-- ms' : last == null ? t('errTimeout') : last + ' ms'}${best != null && ok.length > 1 ? `<small>min ${best}</small>` : ''}</div>
        <div class="dots">${dots.join('')}</div></div>`;
    }).join('');
  }

  async function detectMain(ver, id) {
    const host = ver === 'v4' ? 'https://api-ipv4.ip.sb/geoip' : 'https://api-ipv6.ip.sb/geoip';
    let r = null;
    try { r = N.ipsb((await req(host, { ms: 7000 })).data); } catch (e) { }
    if (!r || !r.ip) {
      try {
        const ip = (await req(ver === 'v4' ? 'https://api4.ipify.org?format=json' : 'https://api6.ipify.org?format=json', { ms: 7000 })).data.ip;
        r = { ip }; geo(ip).then((g) => { if (id !== runId) return; results[ver] = { ip, geo: g }; renderMain(ver); });
      } catch (e) { }
    }
    if (id !== runId) return;
    results[ver] = r && r.ip ? { ip: r.ip, geo: r.asn || r.cc ? r : null } : { error: true };
    renderMain(ver);
  }

  function runSources(id) {
    SOURCES.forEach((s) => {
      s.run().then((r) => {
        if (id !== runId) return;
        results.src[s.id] = r && r.ip ? r : { error: t('notDetected') };
        renderSources();
      }, (e) => {
        if (id !== runId) return;
        results.src[s.id] = { error: errText(e) };
        renderSources();
      });
    });
  }

  async function runPing(id) {
    for (let i = 0; i < ROUNDS; i++) {
      await Promise.all(SITES.map(async (s) => {
        let v = null;
        try { v = await ping(s.url); } catch (e) { }
        if (id !== runId) return;
        (results.ping[s.name] = results.ping[s.name] || []).push(v);
      }));
      if (id !== runId) return;
      renderPing();
      if (IPC.current() !== 'home') break;
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  function run() {
    const id = ++runId;
    results.v4 = results.v6 = null; results.src = {}; results.ping = {};
    renderMain('v4'); renderMain('v6'); renderSources(); renderPing();
    detectMain('v4', id); detectMain('v6', id);
    runSources(id);
    runPing(id);
  }

  function applyOpts() {
    const p = $('#page-home');
    p.classList.toggle('hide-ip', !!opts.ip);
    p.classList.toggle('hide-cn', !!opts.cn);
    p.classList.toggle('hide-intl', !!opts.intl);
    p.querySelectorAll('[data-opt]').forEach((c) => { c.checked = !!opts[c.dataset.opt]; });
  }

  IPC.register('home', {
    init() {
      el = { v4: $('#homeV4'), v6: $('#homeV6'), src: $('#homeSrc'), ping: $('#homePing') };
      opts = store.get('ipc-home-opts', {});
      $('#page-home').addEventListener('change', (e) => {
        const o = e.target.dataset.opt;
        if (o) { opts[o] = e.target.checked; store.set('ipc-home-opts', opts); applyOpts(); }
      });
      $('#homeRefresh').addEventListener('click', run);
      applyOpts();
      run();
    },
    enter() {
      const arr = results.ping[SITES[0].name];
      if (arr && arr.length < ROUNDS) runPing(runId);
    },
    lang() { renderMain('v4'); renderMain('v6'); renderSources(); renderPing(); }
  });
})();
