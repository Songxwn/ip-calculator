(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, net, parseAddr, typeOf, ipstr } = IPC;
  const { req, jsonp, N, locText, ccBadge, errText } = net;

  IPC.addI18n({
    zh: {
      queryTitle: 'IP 洞察', queryDesc: '同时向多个 IP 数据库查询任意 IP 或域名的归属地、ASN 与注册信息，对比各家差异',
      queryPh: '输入 IP 地址或域名，例如 8.8.8.8 / 2606:4700::1111 / github.com', queryBtn: '查询', queryMine: '查询本机',
      qResolved: '{d} 解析结果', qInvalid: '请输入有效的 IP 地址或域名', qResolveFail: '域名解析失败',
      qNotPublic: '{ip} 是{type}，不在公网数据库中', colSource: '数据源', colAsnIsp: 'ASN / ISP',
      rdapTitle: '注册信息 (RDAP)', rdapName: '网络名称', rdapRange: '地址范围', rdapCidr: 'CIDR', rdapCountry: '国家', rdapOrg: '注册组织', rdapAbuse: '滥用联系', rdapRir: '登记机构',
      qHost: '主机名', qCidr: '所属网段', qPrivacy: '属性', qVpn: 'VPN', qProxy: '代理', qTor: 'Tor', qHosting: '机房', qMobile: '移动网络', qCrawler: '爬虫'
    },
    en: {
      queryTitle: 'IP Insight', queryDesc: 'Look up the location, ASN and registration of any IP or domain across many databases at once and compare them',
      queryPh: 'IP address or domain, e.g. 8.8.8.8 / 2606:4700::1111 / github.com', queryBtn: 'Look up', queryMine: 'My IP',
      qResolved: '{d} resolves to', qInvalid: 'Enter a valid IP address or domain name', qResolveFail: 'Could not resolve the domain',
      qNotPublic: '{ip} is {type} and is not in public databases', colSource: 'Source', colAsnIsp: 'ASN / ISP',
      rdapTitle: 'Registration (RDAP)', rdapName: 'Net name', rdapRange: 'Range', rdapCidr: 'CIDR', rdapCountry: 'Country', rdapOrg: 'Organization', rdapAbuse: 'Abuse contact', rdapRir: 'Registry',
      qHost: 'Hostname', qCidr: 'Network', qPrivacy: 'Flags', qVpn: 'VPN', qProxy: 'Proxy', qTor: 'Tor', qHosting: 'Hosting', qMobile: 'Mobile', qCrawler: 'Crawler'
    }
  });

  const enc = encodeURIComponent;
  const SOURCES = [
    { name: 'IP.SB', run: (ip) => req('https://api.ip.sb/geoip/' + enc(ip)).then((r) => N.ipsb(r.data)) },
    { name: 'IPinfo.io', run: (ip) => req('https://ipinfo.io/' + enc(ip) + '/json').then((r) => N.ipinfo(r.data)) },
    {
      name: 'ipapi.is', run: (ip) => req('https://api.ipapi.is/?q=' + enc(ip)).then((r) => {
        const d = r.data, g = N.ipapis(d);
        if ('is_vpn' in d || 'is_datacenter' in d) g.flags = ['vpn', 'proxy', 'tor', 'datacenter', 'mobile', 'crawler'].filter((k) => d['is_' + k]);
        return g;
      })
    },
    { name: 'ipwho.is', run: (ip) => req('https://ipwho.is/' + enc(ip)).then((r) => N.ipwho(r.data)) },
    { name: 'ipapi.co', run: (ip) => req('https://ipapi.co/' + enc(ip) + '/json/').then((r) => N.ipapico(r.data)) },
    { name: 'FreeIPAPI', run: (ip) => req('https://free.freeipapi.com/api/json/' + enc(ip)).then((r) => N.freeipapi(r.data)) },
    { name: 'GeoJS', run: (ip) => req('https://get.geojs.io/v1/ip/geo/' + enc(ip) + '.json').then((r) => N.geojs(r.data)) },
    { name: 'ip.guide', run: (ip) => req('https://ip.guide/' + enc(ip)).then((r) => N.ipguide(r.data)) },
    { name: 'ipleak.net', run: (ip) => req('https://ipleak.net/json/' + enc(ip)).then((r) => N.ipleak(r.data)) },
    { name: 'iplocation.net', run: (ip) => req('https://api.iplocation.net/?ip=' + enc(ip)).then((r) => N.iplocation(r.data)) },
    { name: '太平洋 PConline', v4only: true, run: (ip) => jsonp('https://whois.pconline.com.cn/ipJson.jsp?ip=' + enc(ip), { charset: 'gbk' }).then((r) => N.pconline(r.data)) }
  ];

  let el, runId = 0;
  const state = { ip: null, v: 4, domain: null, resolved: [], res: {}, rdap: null };

  async function resolve(name) {
    const out = [];
    const q = (type) => req('https://cloudflare-dns.com/dns-query?name=' + enc(name) + '&type=' + type, { headers: { accept: 'application/dns-json' }, ms: 6000 })
      .then((r) => (r.data.Answer || []).filter((a) => a.type === (type === 'A' ? 1 : 28)).map((a) => a.data))
      .catch(() => req('https://dns.alidns.com/resolve?name=' + enc(name) + '&type=' + (type === 'A' ? 1 : 28), { ms: 6000 })
        .then((r) => (r.data.Answer || []).filter((a) => a.type === (type === 'A' ? 1 : 28)).map((a) => a.data)).catch(() => []));
    const [a, aaaa] = await Promise.all([q('A'), q('AAAA')]);
    a.concat(aaaa).forEach((x) => { if (out.indexOf(x) < 0) out.push(x); });
    return out;
  }

  function vcard(ent, key) {
    const v = ent && ent.vcardArray && ent.vcardArray[1];
    if (!v) return '';
    const f = v.find((x) => x[0] === key);
    return f ? (Array.isArray(f[3]) ? f[3].join(' ') : f[3]) : '';
  }
  function findEnt(ents, role) {
    for (const e of ents || []) {
      if ((e.roles || []).indexOf(role) >= 0) return e;
      const s = findEnt(e.entities, role);
      if (s) return s;
    }
    return null;
  }

  async function rdap(ip) {
    const r = await req('https://rdap.org/ip/' + enc(ip), { ms: 10000 });
    const d = r.data;
    const reg = findEnt(d.entities, 'registrant') || findEnt(d.entities, 'administrative');
    const abuse = findEnt(d.entities, 'abuse');
    const cidr = (d.cidr0_cidrs || []).map((c) => (c.v4prefix || c.v6prefix) + '/' + c.length).join(', ');
    const port43 = d.port43 || '';
    const rir = /arin/i.test(port43) ? 'ARIN' : /ripe/i.test(port43) ? 'RIPE NCC' : /apnic/i.test(port43) ? 'APNIC' : /lacnic/i.test(port43) ? 'LACNIC' : /afrinic/i.test(port43) ? 'AFRINIC' : port43;
    return { name: d.name, handle: d.handle, start: d.startAddress, end: d.endAddress, cidr, country: d.country, org: vcard(reg, 'fn'), abuse: vcard(abuse, 'email'), rir };
  }

  function render() {
    if (!state.ip) { el.out.innerHTML = ''; return; }
    const ty = typeOf(parseAddr(state.ip).n, state.v);
    let html = '';
    if (state.domain) {
      html += `<div class="resolved"><span class="muted">${t('qResolved', { d: `<b>${esc(state.domain)}</b>` })}</span>${state.resolved.map((ip) => `<a class="chip ${ip === state.ip ? 'on' : ''}" href="#/query?ip=${enc(ip)}&d=${enc(state.domain)}">${esc(ip)}</a>`).join('')}</div>`;
    }
    if (!ty.isPublic) {
      el.out.innerHTML = html + `<div class="card empty">${t('qNotPublic', { ip: `<b class="mono">${esc(state.ip)}</b>`, type: t(ty.key) })}<div style="margin-top:12px"><a class="btn secondary" href="#/calc?q=${enc(state.ip)}">${t('toCalc')}</a></div></div>`;
      return;
    }

    const rows = SOURCES.filter((s) => !(s.v4only && state.v === 6)).map((s) => {
      const r = state.res[s.name];
      let loc, isp = '', extra = '';
      if (!r) loc = '<span class="skel" style="width:10rem"></span>';
      else if (r.error) loc = `<span class="err">${esc(r.error)}</span>`;
      else {
        loc = `${ccBadge(r.cc)}${esc(locText(r)) || '—'}`;
        isp = `${r.asn ? `<span class="mono asn">AS${esc(r.asn)}</span> ` : ''}${esc(r.isp || r.org || '')}`;
        const ex = [];
        if (r.hostname) ex.push(`<small class="muted mono">${esc(r.hostname)}</small>`);
        if (r.cidr) ex.push(`<small class="muted mono">${esc(r.cidr)}</small>`);
        if (r.flags && r.flags.length) ex.push(r.flags.map((f) => `<span class="tag warn">${t({ vpn: 'qVpn', proxy: 'qProxy', tor: 'qTor', datacenter: 'qHosting', mobile: 'qMobile', crawler: 'qCrawler' }[f])}</span>`).join(''));
        else if (r.flags) ex.push('<span class="tag ok">Residential / ISP</span>');
        extra = ex.join(' ');
      }
      return `<tr><td><b class="site">${esc(s.name)}</b></td><td class="loc">${loc}</td><td class="loc">${isp}</td><td class="loc">${extra}</td></tr>`;
    }).join('');

    html += `<div class="card"><div class="q-head"><span class="ver-badge ${state.v === 6 ? 'v6' : ''}">IPv${state.v}</span><span class="ipv mono big">${esc(state.ip)}</span>
      <button class="copy show" type="button" data-copy="${esc(state.ip)}" title="Copy">${IPC.ICON_COPY}</button>
      <a class="tag link" href="#/calc?q=${enc(state.ip)}">${t('toCalc')} →</a></div>
      <div class="table-wrap plain"><table><thead><tr><th>${t('colSource')}</th><th>${t('location')}</th><th>${t('colAsnIsp')}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;

    const d = state.rdap;
    let rd;
    if (!d) rd = '<span class="skel" style="width:16rem"></span>';
    else if (d.error) rd = `<span class="err">${esc(d.error)}</span>`;
    else {
      const r = (k, v) => v ? `<div class="row"><span class="k">${t(k)}</span><span class="v">${esc(v)}</span><button class="copy" type="button" data-copy="${esc(v)}" title="Copy">${IPC.ICON_COPY}</button></div>` : '';
      rd = `<div class="rows">${r('rdapName', [d.name, d.handle && d.handle !== d.name ? '(' + d.handle + ')' : ''].filter(Boolean).join(' '))}${r('rdapRange', d.start && d.end ? d.start + ' – ' + d.end : '')}${r('rdapCidr', d.cidr)}${r('rdapOrg', d.org)}${r('rdapCountry', d.country)}${r('rdapAbuse', d.abuse)}${r('rdapRir', d.rir)}</div>`;
    }
    html += `<div class="card" style="margin-top:14px"><div class="section-title">${t('rdapTitle')}</div>${rd}</div>`;
    el.out.innerHTML = html;
  }

  let raf = 0;
  const schedule = () => { if (!raf) raf = setTimeout(() => { raf = 0; render(); }, 30); };

  function lookup(ip) {
    const a = parseAddr(ip);
    const id = ++runId;
    state.ip = ipstr(a.n, a.v); state.v = a.v; state.res = {}; state.rdap = null;
    el.msg.textContent = '';
    render();
    if (!typeOf(a.n, a.v).isPublic) return;
    SOURCES.forEach((s) => {
      if (s.v4only && a.v === 6) return;
      s.run(state.ip).then((r) => { if (id === runId) { state.res[s.name] = r && (r.ip || r.cc || r.locText || r.country) ? r : { error: t('notDetected') }; schedule(); } },
        (e) => { if (id === runId) { state.res[s.name] = { error: errText(e) }; schedule(); } });
    });
    rdap(state.ip).then((r) => { if (id === runId) { state.rdap = r; schedule(); } }, (e) => { if (id === runId) { state.rdap = { error: errText(e) }; schedule(); } });
  }

  async function submit(q, domainHint) {
    q = String(q || '').trim().replace(/^https?:\/\//i, '').replace(/[/?#].*$/, '');
    if (!q) return;
    el.input.value = domainHint || q;
    if (parseAddr(q)) {
      if (!domainHint) { state.domain = null; state.resolved = []; }
      IPC.setHash('query', { ip: q, d: domainHint });
      lookup(q);
      return;
    }
    const host = q.replace(/:\d+$/, '').toLowerCase();
    if (!/^(?=.{1,253}$)([a-z0-9_]([a-z0-9-_]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}\.?$/i.test(host)) { el.msg.textContent = t('qInvalid'); return; }
    el.msg.textContent = t('loading');
    const ips = await resolve(host);
    if (!ips.length) { el.msg.textContent = t('qResolveFail'); return; }
    state.domain = host; state.resolved = ips;
    IPC.setHash('query', { ip: ips[0], d: host });
    lookup(ips[0]);
  }

  async function mine() {
    try { const r = await req('https://api64.ipify.org?format=json', { ms: 6000 }); state.domain = null; submit(r.data.ip); }
    catch (e) { el.msg.textContent = errText(e); }
  }

  IPC.register('query', {
    init() {
      el = { input: $('#qInput'), msg: $('#qMsg'), out: $('#qOut') };
      $('#qForm').addEventListener('submit', (e) => { e.preventDefault(); state.domain = null; submit(el.input.value); });
      $('#qMine').addEventListener('click', mine);
    },
    enter(params) {
      const ip = params.get('ip'), d = params.get('d');
      if (ip && ip !== state.ip) {
        if (d && d !== state.domain) { state.domain = null; submit(d); }
        else submit(ip, d || null);
      } else if (!ip && !state.ip) mine();
      else render();
    },
    lang() { render(); }
  });
})();
