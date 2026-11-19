(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, net } = IPC;
  const { req, jsonp, trace, N, geo, locText, ispText, ccBadge, latClass, errText, iataName } = net;

  IPC.addI18n({
    zh: {
      splitTitle: '网站分流检测', splitDesc: '分别请求国内外各类网站，查看访问它们时使用的出口 IP，判断代理 / 分流规则是否生效',
      gCn: '国内网站', gAi: 'AI 服务', gSocial: '社交与内容', gDev: '开发者与工具', gApi: 'IP 查询接口',
      colSite: '网站', colExit: '出口 IP', colLoc: '出口归属', colNode: '节点', colLatency: '延迟',
      verdictSplit: '检测到 {n} 个不同的出口 IP，你的网络存在分流', verdictSame: '所有网站使用同一出口 IP：{ip}',
      verdictWait: '正在检测各网站出口…', verdictNone: '未能获取任何出口 IP',
      exitN: '出口 {n}'
    },
    en: {
      splitTitle: 'Split Tunnel Test', splitDesc: 'Requests sites at home and abroad to see which egress IP each one sees, so you can verify proxy / routing rules',
      gCn: 'China sites', gAi: 'AI services', gSocial: 'Social & content', gDev: 'Developer & tools', gApi: 'IP APIs',
      colSite: 'Site', colExit: 'Egress IP', colLoc: 'Egress location', colNode: 'Node', colLatency: 'Latency',
      verdictSplit: '{n} different egress IPs detected: your traffic is split', verdictSame: 'All sites see the same egress IP: {ip}',
      verdictWait: 'Checking egress for each site…', verdictNone: 'Could not detect any egress IP',
      exitN: 'Exit {n}'
    }
  });

  const tr = (host) => () => trace(host).then((r) => ({ ip: r.data.ip, colo: r.data.colo, ms: r.ms }));
  const js = (url, f) => () => req(url).then((r) => Object.assign({ ms: r.ms }, f(r.data)));

  const SITES = [
    { g: 'gCn', name: 'Cloudflare 中国网络', host: 'www.cloudflare-cn.com', run: tr('www.cloudflare-cn.com') },
    { g: 'gCn', name: 'Visa 中国', host: 'www.visa.cn', run: tr('www.visa.cn') },
    { g: 'gCn', name: '网易 126', host: 'ipservice.ws.126.net', run: () => jsonp('https://ipservice.ws.126.net/locate/api/getLocByIp').then((r) => Object.assign({ ms: r.ms }, N.n126(r.data))) },
    { g: 'gCn', name: '太平洋 PConline', host: 'whois.pconline.com.cn', run: () => jsonp('https://whois.pconline.com.cn/ipJson.jsp', { charset: 'gbk' }).then((r) => Object.assign({ ms: r.ms }, N.pconline(r.data))) },
    { g: 'gCn', name: 'ipify.cn', host: 'api.ipify.cn', run: js('https://api.ipify.cn?format=json', (d) => ({ ip: d.ip })) },
    { g: 'gAi', name: 'ChatGPT', host: 'chatgpt.com', run: tr('chatgpt.com') },
    { g: 'gAi', name: 'OpenAI', host: 'openai.com', run: tr('openai.com') },
    { g: 'gAi', name: 'Claude', host: 'claude.ai', run: tr('claude.ai') },
    { g: 'gAi', name: 'Perplexity', host: 'www.perplexity.ai', run: tr('www.perplexity.ai') },
    { g: 'gSocial', name: 'X (Twitter)', host: 'x.com', run: tr('x.com') },
    { g: 'gSocial', name: 'Medium', host: 'medium.com', run: tr('medium.com') },
    { g: 'gSocial', name: '4chan', host: 'www.4chan.org', run: tr('www.4chan.org') },
    { g: 'gSocial', name: 'Canva', host: 'www.canva.com', run: tr('www.canva.com') },
    { g: 'gSocial', name: 'Udemy', host: 'www.udemy.com', run: tr('www.udemy.com') },
    { g: 'gDev', name: 'GitLab', host: 'gitlab.com', run: tr('gitlab.com') },
    { g: 'gDev', name: 'npm', host: 'www.npmjs.com', run: tr('www.npmjs.com') },
    { g: 'gDev', name: 'Shopify', host: 'www.shopify.com', run: tr('www.shopify.com') },
    { g: 'gDev', name: 'Coinbase', host: 'www.coinbase.com', run: tr('www.coinbase.com') },
    { g: 'gDev', name: 'Cloudflare', host: 'cloudflare.com', run: tr('cloudflare.com') },
    { g: 'gDev', name: 'Cloudflare DNS 1.1.1.1', host: '1.1.1.1', run: tr('1.1.1.1') },
    { g: 'gApi', name: 'ipify', host: 'api64.ipify.org', run: js('https://api64.ipify.org?format=json', (d) => ({ ip: d.ip })) },
    { g: 'gApi', name: 'IP.SB', host: 'api.ip.sb', run: js('https://api.ip.sb/geoip', N.ipsb) },
    { g: 'gApi', name: 'IPinfo.io', host: 'ipinfo.io', run: js('https://ipinfo.io/json', N.ipinfo) },
    { g: 'gApi', name: 'ipapi.is', host: 'api.ipapi.is', run: js('https://api.ipapi.is/', N.ipapis) },
    { g: 'gApi', name: 'GeoJS', host: 'get.geojs.io', run: js('https://get.geojs.io/v1/ip/geo.json', N.geojs) },
    { g: 'gApi', name: 'ipleak.net', host: 'ipleak.net', run: js('https://ipleak.net/json/', N.ipleak) }
  ];

  let el, runId = 0;
  const res = {}, geos = {};
  const exits = () => {
    const ips = [];
    SITES.forEach((s) => { const r = res[s.host]; if (r && r.ip && ips.indexOf(r.ip) < 0) ips.push(r.ip); });
    return ips;
  };

  function render() {
    const ips = exits();
    const done = SITES.every((s) => res[s.host]);
    let cls = '', msg;
    if (!done && !ips.length) msg = t('verdictWait');
    else if (!ips.length) { cls = 'bad'; msg = t('verdictNone'); }
    else if (ips.length > 1) { cls = 'warn'; msg = t('verdictSplit', { n: ips.length }); }
    else { cls = 'good'; msg = t('verdictSame', { ip: `<span class="ipv mono">${esc(ips[0])}</span>` }); }
    el.verdict.className = 'verdict ' + cls;
    el.verdict.innerHTML = `<b>${msg}</b>${!done && ips.length ? ` <span class="muted">· ${t('loading')}</span>` : ''}` +
      (ips.length > 1 ? `<div class="exit-list">${ips.map((ip, i) => {
        const g = geos[ip];
        return `<span class="exit-chip c${i % 6}"><b>${t('exitN', { n: i + 1 })}</b><span class="ipv mono">${esc(ip)}</span>${g ? ccBadge(g.cc) + esc(locText(g)) : ''}</span>`;
      }).join('')}</div>` : '');

    const groups = [];
    SITES.forEach((s) => { if (groups.indexOf(s.g) < 0) groups.push(s.g); });
    el.list.innerHTML = groups.map((g) => {
      const rows = SITES.filter((s) => s.g === g).map((s) => {
        const r = res[s.host];
        let ipCell, locCell = '', node = '', lat = '';
        if (!r) ipCell = '<span class="skel" style="width:8rem"></span>';
        else if (r.error) ipCell = `<span class="err">${esc(r.error)}</span>`;
        else {
          const idx = ips.indexOf(r.ip);
          ipCell = `<a class="ipv mono exit-ip c${idx % 6}" href="#/query?ip=${encodeURIComponent(r.ip)}">${esc(r.ip)}</a>`;
          const g2 = geos[r.ip] || (r.cc || r.locText ? r : null);
          locCell = g2 ? `${ccBadge(g2.cc)}${esc([locText(g2), ispText(g2)].filter(Boolean).join(' · '))}` : '<span class="skel" style="width:9rem"></span>';
          if (r.colo) node = `<span class="tag" title="${esc(iataName(r.colo))}">${esc(r.colo)}</span><small class="muted">${esc(iataName(r.colo))}</small>`;
          lat = `<span class="lat ${latClass(r.ms)}">${r.ms} ms</span>`;
        }
        return `<tr><td><b class="site">${esc(s.name)}</b><small class="muted host">${esc(s.host)}</small></td><td>${ipCell}</td><td class="loc">${locCell}</td><td>${node}</td><td>${lat}</td></tr>`;
      }).join('');
      return `<div class="card group-card"><div class="section-title">${t(g)}</div><div class="table-wrap plain"><table>
        <thead><tr><th>${t('colSite')}</th><th>${t('colExit')}</th><th>${t('colLoc')}</th><th>${t('colNode')}</th><th>${t('colLatency')}</th></tr></thead>
        <tbody>${rows}</tbody></table></div></div>`;
    }).join('');
  }

  let raf = 0;
  const schedule = () => { if (!raf) raf = setTimeout(() => { raf = 0; render(); }, 30); };

  function run() {
    const id = ++runId;
    SITES.forEach((s) => { delete res[s.host]; });
    render();
    SITES.forEach((s) => {
      s.run().then((r) => {
        if (id !== runId) return;
        res[s.host] = r && r.ip ? r : { error: t('notDetected') };
        if (r && r.ip && !geos[r.ip]) geo(r.ip).then((g) => { if (g) { geos[r.ip] = g; schedule(); } });
        schedule();
      }, (e) => {
        if (id !== runId) return;
        res[s.host] = { error: errText(e) };
        schedule();
      });
    });
  }

  IPC.register('split', {
    init() {
      el = { verdict: $('#splitVerdict'), list: $('#splitList') };
      $('#splitRefresh').addEventListener('click', run);
      run();
    },
    lang: render
  });
})();
