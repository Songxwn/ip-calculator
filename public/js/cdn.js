(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, net } = IPC;
  const { req, trace, latClass, errText, iataName, rand } = net;

  IPC.addI18n({
    zh: {
      cdnTitle: 'CDN 命中节点', cdnDesc: '检测你访问各大 CDN 时被调度到的边缘节点（机场代码）与延迟，可用于判断线路与 Anycast 调度情况',
      colCdn: 'CDN / 服务', colPop: '命中节点', colCity: '节点城市', colVia: '识别依据',
      cdnCfCn: 'Cloudflare 中国网络', cdnSummary: '已命中 {n} 个不同的节点'
    },
    en: {
      cdnTitle: 'CDN Edge Nodes', cdnDesc: 'Which edge node (airport code) each major CDN routes you to, and its latency. Useful for checking routing and Anycast steering',
      colCdn: 'CDN / Service', colPop: 'Edge node', colCity: 'City', colVia: 'Detected via',
      cdnCfCn: 'Cloudflare China Network', cdnSummary: '{n} distinct edge nodes hit'
    }
  });

  const lastPop = (v) => { const m = String(v || '').split(',').pop().trim().match(/-([A-Z]{3})$/); return m ? m[1] : ''; };
  const rayPop = (v) => { const m = /-([A-Z]{3})$/.exec(String(v || '')); return m ? m[1] : ''; };

  const cfTrace = (host) => () => trace(host).then((r) => ({ pop: r.data.colo, ms: r.ms, ip: r.data.ip, via: 'cdn-cgi/trace' }));
  const hdr = (url) => () => req(url + (url.indexOf('?') >= 0 ? '&' : '?') + '_=' + rand(6), { as: 'none' }).then((r) => {
    const h = r.res.headers;
    const ray = h.get('cf-ray'), served = h.get('x-served-by');
    if (ray) return { pop: rayPop(ray), ms: r.ms, via: 'cf-ray', extra: 'Cloudflare' };
    if (served) return { pop: lastPop(served), ms: r.ms, via: 'x-served-by', extra: 'Fastly' };
    return { pop: '', ms: r.ms, via: '—' };
  });

  const ITEMS = [
    { name: 'Cloudflare', host: 'www.cloudflare.com', run: cfTrace('www.cloudflare.com') },
    { name: 'Cloudflare 1.1.1.1', host: '1.1.1.1', run: cfTrace('1.1.1.1') },
    { name: 'Cloudflare Speed', host: 'speed.cloudflare.com', run: () => req('https://speed.cloudflare.com/meta').then((r) => ({ pop: r.data.colo && r.data.colo.iata, city: r.data.colo && r.data.colo.city, ms: r.ms, ip: r.data.clientIp, via: '/meta' })) },
    { nameKey: 'cdnCfCn', host: 'www.cloudflare-cn.com', run: cfTrace('www.cloudflare-cn.com') },
    { name: 'ChatGPT (Cloudflare)', host: 'chatgpt.com', run: cfTrace('chatgpt.com') },
    { name: 'X (Cloudflare)', host: 'x.com', run: cfTrace('x.com') },
    { name: 'jsDelivr', host: 'cdn.jsdelivr.net', run: hdr('https://cdn.jsdelivr.net/npm/jquery@3/package.json') },
    { name: 'jsDelivr · Fastly', host: 'fastly.jsdelivr.net', run: hdr('https://fastly.jsdelivr.net/npm/jquery@3/package.json') },
    { name: 'jsDelivr · Cloudflare', host: 'testingcf.jsdelivr.net', run: hdr('https://testingcf.jsdelivr.net/npm/jquery@3/package.json') },
    { name: 'jsDelivr · Gcore', host: 'gcore.jsdelivr.net', run: hdr('https://gcore.jsdelivr.net/npm/jquery@3/package.json') },
    { name: 'unpkg', host: 'unpkg.com', run: hdr('https://unpkg.com/react@18/package.json') }
  ];

  let el, runId = 0;
  const res = {};

  function render() {
    const pops = [];
    ITEMS.forEach((it) => { const r = res[it.host]; if (r && r.pop && pops.indexOf(r.pop) < 0) pops.push(r.pop); });
    el.sum.textContent = pops.length ? t('cdnSummary', { n: pops.length }) : t('loading');
    el.list.innerHTML = ITEMS.map((it) => {
      const r = res[it.host];
      let pop, city = '', via = '', lat = '';
      if (!r) pop = '<span class="skel" style="width:4rem"></span>';
      else if (r.error) pop = `<span class="err">${esc(r.error)}</span>`;
      else {
        pop = r.pop ? `<span class="pop">${esc(r.pop)}</span>` : '<span class="muted">—</span>';
        city = esc(iataName(r.pop) || r.city || '');
        via = `<small class="muted mono">${esc(r.via)}</small>`;
        lat = `<span class="lat ${latClass(r.ms)}">${r.ms} ms</span>`;
      }
      return `<tr><td><b class="site">${esc(it.nameKey ? t(it.nameKey) : it.name)}</b><small class="muted host">${esc(it.host)}</small></td><td>${pop}</td><td class="loc">${city}</td><td>${lat}</td><td>${via}</td></tr>`;
    }).join('');
  }

  function run() {
    const id = ++runId;
    ITEMS.forEach((it) => { delete res[it.host]; });
    render();
    ITEMS.forEach((it) => {
      it.run().then((r) => { if (id === runId) { res[it.host] = r; render(); } },
        (e) => { if (id === runId) { res[it.host] = { error: errText(e) }; render(); } });
    });
  }

  IPC.register('cdn', {
    init() {
      el = { list: $('#cdnList'), sum: $('#cdnSummary') };
      $('#cdnRefresh').addEventListener('click', run);
      run();
    },
    lang: render
  });
})();
