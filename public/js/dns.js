(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, net } = IPC;
  const { req, script, rand, geo, locText, ispText, ccBadge, errText } = net;

  IPC.addI18n({
    zh: {
      dnsTitle: 'DNS 出口查询', dnsDesc: '通过随机子域名触发解析，识别实际替你向权威服务器发起查询的递归 DNS 出口，可用于检测 DNS 泄露',
      dnsSrc: '检测来源', dnsServers: '识别到的 DNS 出口', dnsHits: '命中次数', dnsNone: '未识别到 DNS 出口',
      dnsLeakWarn: '你的 DNS 出口位于中国大陆，而网页出口不在：可能存在 DNS 泄露',
      dnsNsMsg: '网易检测结论', dnsClientIp: '客户端 IP', dnsServerIp: 'DNS 出口 IP'
    },
    en: {
      dnsTitle: 'DNS Egress', dnsDesc: 'Triggers lookups of random subdomains to see which recursive resolver actually queries the authoritative servers for you. Useful for DNS leak tests',
      dnsSrc: 'Source', dnsServers: 'Detected DNS egress', dnsHits: 'Hits', dnsNone: 'No DNS egress detected',
      dnsLeakWarn: 'Your DNS egress is in mainland China while your web egress is not: possible DNS leak',
      dnsNsMsg: 'NetEase verdict', dnsClientIp: 'Client IP', dnsServerIp: 'DNS egress IP'
    }
  });

  let el, runId = 0;
  const state = { list: [], src: {}, geos: {}, ns: null, webCc: null };

  function add(ip, src, hits) {
    let e = state.list.find((x) => x.ip === ip);
    if (!e) { e = { ip, src: [], hits: 0 }; state.list.push(e); }
    if (e.src.indexOf(src) < 0) e.src.push(src);
    e.hits += hits || 1;
    if (!state.geos[ip]) geo(ip).then((g) => { if (g) { state.geos[ip] = g; render(); } });
  }

  function render() {
    const s = state.src;
    const srcRow = (k, name) => {
      const v = s[k];
      return `<span class="src-pill ${v == null ? '' : v === true ? 'ok' : 'bad'}">${esc(name)}${v == null ? ' …' : v === true ? ' ✓' : ' · ' + esc(v)}</span>`;
    };
    el.src.innerHTML = srcRow('ipapi', 'ip-api.com EDNS') + srcRow('ipleak', 'ipleak.net') + srcRow('netease', '网易 NSTool');

    const anyCn = state.list.some((x) => (state.geos[x.ip] || {}).cc === 'CN');
    const warn = anyCn && state.webCc && state.webCc !== 'CN';
    el.warn.hidden = !warn;

    const pending = Object.keys(s).length < 3;
    if (!state.list.length) {
      el.list.innerHTML = pending ? `<tr><td colspan="4"><span class="skel" style="width:14rem"></span></td></tr>` : `<tr><td colspan="4" class="muted">${t('dnsNone')}</td></tr>`;
    } else {
      el.list.innerHTML = state.list.slice().sort((a, b) => b.hits - a.hits).map((x) => {
        const g = state.geos[x.ip];
        return `<tr><td><a class="ipv mono" href="#/query?ip=${encodeURIComponent(x.ip)}">${esc(x.ip)}</a></td>
          <td class="loc">${g ? ccBadge(g.cc) + esc([locText(g), ispText(g)].filter(Boolean).join(' · ')) : '<span class="skel" style="width:10rem"></span>'}</td>
          <td>${x.hits}</td><td><small class="muted">${esc(x.src.join(', '))}</small></td></tr>`;
      }).join('');
    }

    const ns = state.ns;
    el.ns.hidden = !ns;
    if (ns) {
      el.ns.innerHTML = `<div class="section-title">${t('dnsNsMsg')}</div><div class="rows">
        <div class="row"><span class="k">${t('dnsClientIp')}</span><span class="v">${esc(ns.ip)} <small class="muted">${esc([ns.ip_province, ns.ip_city, ns.ip_isp].filter(Boolean).join(' '))}</small></span><span></span></div>
        <div class="row"><span class="k">${t('dnsServerIp')}</span><span class="v">${esc(ns.dns)} <small class="muted">${esc([ns.dns_province, ns.dns_city, ns.dns_isp].filter(Boolean).join(' '))}</small></span><span></span></div>
        <div class="row"><span class="k">${t('dnsNsMsg')}</span><span class="v" style="font-family:inherit">${esc(ns.msg || '')}</span><span></span></div></div>`;
    }
  }

  async function viaIpApi(id) {
    const tasks = [0, 1, 2].map(() => req('https://' + rand(32, 'abcdefghijklmnopqrstuvwxyz') + '.edns.ip-api.com/json', { ms: 8000 }).then((r) => r.data && r.data.dns && r.data.dns.ip));
    const ips = (await Promise.allSettled(tasks)).filter((x) => x.status === 'fulfilled' && x.value).map((x) => x.value);
    if (id !== runId) return;
    ips.forEach((ip) => add(ip, 'ip-api'));
    state.src.ipapi = ips.length ? true : t('errNetwork');
  }

  async function viaIpleak(id) {
    const h = rand(40, '0123456789abcdef');
    await Promise.allSettled(Array.from({ length: 6 }, (_, i) => req('https://' + h + '-' + (i + 1) + '.ipleak.net/dnsdetection/', { as: 'none', ms: 8000 })));
    try {
      const r = await req('https://' + h + '-99.ipleak.net/dnsdetection/', { ms: 8000 });
      if (id !== runId) return;
      const m = (r.data && r.data.ip) || {};
      Object.keys(m).forEach((ip) => add(ip, 'ipleak', m[ip]));
      state.src.ipleak = Object.keys(m).length ? true : t('notDetected');
    } catch (e) { if (id === runId) state.src.ipleak = errText(e); }
  }

  async function viaNetease(id) {
    const keys = ['ip', 'dns', 'ip_province', 'ip_city', 'ip_isp', 'dns_province', 'dns_city', 'dns_isp', 'res', 'msg'];
    keys.forEach((k) => { try { delete window[k]; } catch (e) { window[k] = undefined; } });
    try {
      await script('https://' + rand(16, 'abcdefghijklmnopqrstuvwxyz0123456789') + '.nstool.netease.com/info.js', { charset: 'gbk' });
      if (id !== runId) return;
      const ns = {}; keys.forEach((k) => { ns[k] = window[k]; });
      if (ns.dns) { state.ns = ns; ns.dns.split(/[\s,]+/).filter(Boolean).forEach((ip) => add(ip, 'netease')); state.src.netease = true; }
      else state.src.netease = t('notDetected');
    } catch (e) { if (id === runId) state.src.netease = errText(e); }
  }

  function run() {
    const id = ++runId;
    state.list = []; state.src = {}; state.ns = null;
    render();
    req('https://speed.cloudflare.com/meta', { ms: 6000 }).then((r) => { state.webCc = r.data.country; render(); }, () => { });
    [viaIpApi, viaIpleak, viaNetease].forEach((f) => f(id).finally(() => { if (id === runId) render(); }));
  }

  IPC.register('dns', {
    init() {
      el = { list: $('#dnsList'), src: $('#dnsSrc'), warn: $('#dnsWarn'), ns: $('#dnsNs') };
      $('#dnsRefresh').addEventListener('click', run);
      run();
    },
    lang: render
  });
})();
