(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, net, parseAddr, typeOf, ipstr } = IPC;
  const { req, ccBadge, locText, errText } = net;
  const enc = encodeURIComponent;

  IPC.addI18n({
    zh: {
      nav_risk: '住宅 IP', riskTitle: '住宅 IP 检测',
      riskDesc: '综合多个数据库判断 IP 是住宅宽带、移动网络还是机房 / 代理，并检查黑名单与浏览器环境一致性，适合跨境电商、社媒运营自查 IP 可信度',
      riskPh: '输入要检测的 IPv4 / IPv6 地址，留空检测本机', riskBtn: '检测', riskMine: '检测本机',
      riskScore: '可信度评分', riskLvGood: '纯净 · 可信度高', riskLvMid: '一般 · 存在风险特征', riskLvBad: '高风险 · 不建议用于账号运营',
      tyResidential: '住宅宽带', tyMobile: '移动网络', tyBusiness: '商业 / 企业', tyHosting: '机房 / 数据中心', tyEdu: '教育网', tyGov: '政府', tyUnknown: '类型未知',
      riskSources: '各数据库判定', colType: '类型', colFlags: '风险标记', colOrg: '归属 / ASN', fClean: '无标记',
      fVpn: 'VPN', fProxy: '代理', fTor: 'Tor', fRelay: '中继', fHosting: '机房', fCloud: '云服务商', fAbuser: '滥用记录', fThreat: '威胁情报', fAnon: '匿名网络', fResProxy: '住宅代理', fMobile: '移动网络', fAnycast: 'Anycast', fCrawler: '爬虫',
      riskBl: '黑名单 (DNSBL)', blListed: '已列入', blClean: '未列入', blUnknown: '无法查询', blV4only: 'DNSBL 仅支持 IPv4 地址', blPblTip: 'Spamhaus PBL：运营商声明的终端用户（动态住宅）地址段，仅表示不应直接发信，不是滥用记录',
      riskEnv: '浏览器环境一致性', envOther: '检测的不是本机 IP，环境一致性不适用', envTz: '时区', envLang: '语言',
      envTzOk: '浏览器时区 {b} 与 IP 时区 {i} 一致', envTzBad: '浏览器时区 {b} 与 IP 时区 {i} 不一致', envNoTz: '无法获取 IP 时区',
      envLangOk: '浏览器语言 {l} 与 IP 所在地 {c} 匹配', envLangWarn: '浏览器语言 {l} 与 IP 所在地 {c} 不匹配',
      riskReasons: '评分依据', rsType: 'IP 类型：{type}', rsFlag: '{f}（{src}）', rsBl: '被 {n} 个黑名单列入', rsTz: '浏览器时区与 IP 不一致', rsLang: '浏览器语言与 IP 地区不匹配', rsNone: '未发现风险特征',
      riskMore: '外部深度检测', riskDisclaimer: '评分基于公开数据库估算，各平台风控规则不同，仅供参考。住宅 / 移动网络、无代理标记、无黑名单、时区与语言一致的 IP 可信度最高。',
      riskNotPublic: '{ip} 是{type}，无法检测'
    },
    en: {
      nav_risk: 'Residential IP', riskTitle: 'Residential IP Check',
      riskDesc: 'Combines several databases to tell whether an IP is residential, mobile, or datacenter / proxy, and checks blocklists and browser consistency. Useful for e-commerce and social media operators',
      riskPh: 'IPv4 / IPv6 address to check; leave empty for your own IP', riskBtn: 'Check', riskMine: 'My IP',
      riskScore: 'Trust score', riskLvGood: 'Clean · high trust', riskLvMid: 'Fair · some risk signals', riskLvBad: 'High risk · not recommended for accounts',
      tyResidential: 'Residential', tyMobile: 'Mobile', tyBusiness: 'Business', tyHosting: 'Datacenter / hosting', tyEdu: 'Education', tyGov: 'Government', tyUnknown: 'Unknown',
      riskSources: 'Database verdicts', colType: 'Type', colFlags: 'Risk flags', colOrg: 'Owner / ASN', fClean: 'No flags',
      fVpn: 'VPN', fProxy: 'Proxy', fTor: 'Tor', fRelay: 'Relay', fHosting: 'Hosting', fCloud: 'Cloud provider', fAbuser: 'Abuser', fThreat: 'Threat', fAnon: 'Anonymous', fResProxy: 'Residential proxy', fMobile: 'Mobile', fAnycast: 'Anycast', fCrawler: 'Crawler',
      riskBl: 'Blocklists (DNSBL)', blListed: 'Listed', blClean: 'Not listed', blUnknown: 'Unavailable', blV4only: 'DNSBL checks support IPv4 only', blPblTip: 'Spamhaus PBL: end-user (dynamic residential) ranges declared by the ISP. It only means no direct mail sending, not abuse',
      riskEnv: 'Browser consistency', envOther: 'Not your own IP, so browser consistency does not apply', envTz: 'Time zone', envLang: 'Language',
      envTzOk: 'Browser time zone {b} matches IP time zone {i}', envTzBad: 'Browser time zone {b} differs from IP time zone {i}', envNoTz: 'IP time zone unavailable',
      envLangOk: 'Browser language {l} matches IP country {c}', envLangWarn: 'Browser language {l} does not match IP country {c}',
      riskReasons: 'Score breakdown', rsType: 'IP type: {type}', rsFlag: '{f} ({src})', rsBl: 'Listed on {n} blocklist(s)', rsTz: 'Browser time zone differs from IP', rsLang: 'Browser language does not match IP region', rsNone: 'No risk signals found',
      riskMore: 'External deep checks', riskDisclaimer: 'The score is an estimate from public databases; every platform uses its own rules. Residential / mobile IPs with no proxy flags, no blocklist hits and a matching time zone and language are the most trusted.',
      riskNotPublic: '{ip} is {type} and cannot be checked'
    }
  });

  const TYPE_MAP = { isp: 'residential', residential: 'residential', mobile: 'mobile', business: 'business', hosting: 'hosting', datacenter: 'hosting', education: 'edu', government: 'gov' };
  const normType = (s) => TYPE_MAP[String(s || '').toLowerCase()] || '';

  const SOURCES = [
    {
      name: 'IPinfo.io', run: async (ip) => {
        const d = (await req('https://ipinfo.io/widget/demo/' + enc(ip))).data.data;
        const p = d.privacy || {}, f = [];
        if (p.vpn) f.push('vpn'); if (p.proxy) f.push('proxy'); if (p.tor) f.push('tor'); if (p.relay) f.push('relay');
        if (p.hosting || d.is_hosting) f.push('hosting'); if (d.is_mobile) f.push('mobile'); if (d.is_anycast) f.push('anycast');
        const asn = d.asn || {};
        let type = d.is_mobile ? 'mobile' : normType((d.company || {}).type) || normType(asn.type);
        return { type, flags: f, cc: d.country, tz: d.timezone, org: asn.name || d.org, asn: net.parseAsn(asn.asn || d.org), loc: { cc: d.country, region: d.region, city: d.city }, extra: p.service ? p.service : '' };
      }
    },
    {
      name: 'ipregistry', run: async (ip) => {
        const d = (await req('https://api.ipregistry.co/' + enc(ip) + '?key=tryout&fields=ip,security,connection,company,location.country.code,location.region.name,location.city,time_zone.id,carrier')).data;
        const s = d.security || {}, f = [], c = d.connection || {};
        const map = { is_vpn: 'vpn', is_proxy: 'proxy', is_tor: 'tor', is_tor_exit: 'tor', is_relay: 'relay', is_cloud_provider: 'cloud', is_abuser: 'abuser', is_attacker: 'threat', is_threat: 'threat', is_anonymous: 'anon', is_residential_proxy: 'resproxy' };
        for (const k in map) if (s[k] && f.indexOf(map[k]) < 0) f.push(map[k]);
        const loc = d.location || {};
        const type = d.carrier && d.carrier.name ? 'mobile' : s.is_cloud_provider ? 'hosting' : normType((d.company || {}).type) || normType(c.type);
        return { type, flags: f, cc: loc.country && loc.country.code, tz: d.time_zone && d.time_zone.id, org: c.organization, asn: c.asn, loc: { cc: loc.country && loc.country.code, region: loc.region && loc.region.name, city: loc.city } };
      }
    },
    {
      name: 'ipquery.io', run: async (ip) => {
        const d = (await req('https://api.ipquery.io/' + enc(ip) + '?format=json')).data;
        const r = d.risk || {}, f = [];
        if (r.is_vpn) f.push('vpn'); if (r.is_proxy) f.push('proxy'); if (r.is_tor) f.push('tor'); if (r.is_datacenter) f.push('hosting'); if (r.is_mobile) f.push('mobile');
        const l = d.location || {}, i = d.isp || {};
        return { type: r.is_mobile ? 'mobile' : r.is_datacenter ? 'hosting' : '', flags: f, cc: l.country_code, tz: l.timezone, org: i.org || i.isp, asn: net.parseAsn(i.asn), loc: { cc: l.country_code, region: l.state, city: l.city }, score: r.risk_score };
      }
    },
    {
      name: 'ipapi.is', run: async (ip) => {
        const d = (await req('https://api.ipapi.is/?q=' + enc(ip))).data;
        const g = net.N.ipapis(d), f = [];
        const has = 'is_vpn' in d || 'is_datacenter' in d;
        if (has) ['vpn', 'proxy', 'tor', 'datacenter', 'mobile', 'crawler', 'abuser'].forEach((k) => { if (d['is_' + k]) f.push(k === 'datacenter' ? 'hosting' : k); });
        const ty = d.asn && typeof d.asn === 'object' ? normType(d.asn.type) : '';
        return { type: d.is_mobile ? 'mobile' : ty || (has && d.is_datacenter ? 'hosting' : ''), flags: f, partial: !has, cc: g.cc, tz: (d.location && d.location.timezone) || d.timezone, org: g.isp, asn: g.asn, loc: g };
      }
    }
  ];

  const DNSBL = [
    { name: 'Spamhaus ZEN', zone: 'zen.spamhaus.org' },
    { name: 'SpamCop', zone: 'bl.spamcop.net' },
    { name: 'Barracuda', zone: 'b.barracudacentral.org' },
    { name: 'UCEPROTECT L1', zone: 'dnsbl-1.uceprotect.net' },
    { name: 'PSBL', zone: 'psbl.surriel.com' },
    { name: 'DroneBL', zone: 'dnsbl.dronebl.org' },
    { name: 's5h.net', zone: 'all.s5h.net' },
    { name: '0spam', zone: 'bl.0spam.org' }
  ];

  async function dnsbl(ip, zone) {
    const name = ip.split('.').reverse().join('.') + '.' + zone;
    const doh = [
      () => req('https://cloudflare-dns.com/dns-query?type=A&name=' + name, { headers: { accept: 'application/dns-json' }, ms: 6000 }),
      () => req('https://dns.alidns.com/resolve?type=1&name=' + name, { ms: 6000 })
    ];
    for (const q of doh) {
      try {
        const d = (await q()).data;
        if (d.Status === 3) return { listed: false };
        if (d.Status !== 0) continue;
        const a = (d.Answer || []).filter((x) => x.type === 1).map((x) => x.data);
        if (!a.length) return { listed: false };
        if (a.some((x) => /^127\.255\.255\./.test(x))) continue;
        if (zone === 'zen.spamhaus.org' && a.every((x) => x === '127.0.0.10' || x === '127.0.0.11')) return { pbl: true, codes: a };
        return { listed: true, codes: a };
      } catch (e) { }
    }
    return { unknown: true };
  }

  const FLAG_W = { vpn: 25, proxy: 25, tor: 40, relay: 10, resproxy: 30, hosting: 10, cloud: 10, abuser: 20, threat: 30, anon: 15, crawler: 10, mobile: 0, anycast: 0 };
  const FLAG_KEY = { vpn: 'fVpn', proxy: 'fProxy', tor: 'fTor', relay: 'fRelay', resproxy: 'fResProxy', hosting: 'fHosting', cloud: 'fCloud', abuser: 'fAbuser', threat: 'fThreat', anon: 'fAnon', crawler: 'fCrawler', mobile: 'fMobile', anycast: 'fAnycast' };
  const TYPE_W = { residential: 0, mobile: 0, edu: 10, gov: 10, business: 15, hosting: 35, '': 10 };
  const TYPE_KEY = { residential: 'tyResidential', mobile: 'tyMobile', business: 'tyBusiness', hosting: 'tyHosting', edu: 'tyEdu', gov: 'tyGov', '': 'tyUnknown' };
  const TYPE_CLS = { residential: 'ok', mobile: 'ok', edu: 'intl', gov: 'intl', business: '', hosting: 'warn', '': '' };
  const BAD_FLAGS = ['vpn', 'proxy', 'tor', 'relay', 'resproxy', 'abuser', 'threat', 'anon'];
  const flagTag = (f) => `<span class="tag ${BAD_FLAGS.indexOf(f) >= 0 ? 'cn' : f === 'mobile' || f === 'anycast' ? '' : 'warn'}">${t(FLAG_KEY[f] || f)}</span>`;
  const typeTag = (ty) => `<span class="tag ${TYPE_CLS[ty] || ''}">${t(TYPE_KEY[ty] || 'tyUnknown')}</span>`;

  const LANGS = {
    US: ['en'], GB: ['en'], AU: ['en'], CA: ['en', 'fr'], NZ: ['en'], IE: ['en'], SG: ['en', 'zh', 'ms'], IN: ['en', 'hi'],
    CN: ['zh'], TW: ['zh'], HK: ['zh', 'en'], MO: ['zh', 'pt'], JP: ['ja'], KR: ['ko'], DE: ['de'], AT: ['de'], CH: ['de', 'fr', 'it'],
    FR: ['fr'], BE: ['fr', 'nl'], NL: ['nl'], ES: ['es', 'ca'], MX: ['es'], AR: ['es'], CO: ['es'], CL: ['es'], PE: ['es'],
    BR: ['pt'], PT: ['pt'], IT: ['it'], RU: ['ru'], UA: ['uk', 'ru'], PL: ['pl'], TR: ['tr'], VN: ['vi'], TH: ['th'],
    ID: ['id'], MY: ['ms', 'en', 'zh'], PH: ['en', 'fil'], SE: ['sv'], NO: ['nb', 'no', 'nn'], DK: ['da'], FI: ['fi', 'sv'], CZ: ['cs'],
    AE: ['ar', 'en'], SA: ['ar'], IL: ['he'], GR: ['el'], HU: ['hu'], RO: ['ro']
  };

  let el, runId = 0;
  const S = { ip: null, v: 4, self: false, src: {}, bl: {}, selfIp: null };

  function pick() {
    const ok = SOURCES.map((s) => S.src[s.name]).filter((r) => r && !r.error);
    const votes = {};
    ok.forEach((r, i) => { if (r.type) votes[r.type] = (votes[r.type] || 0) + 10 - i; });
    let type = '';
    if (ok.some((r) => r.type === 'mobile' || r.flags.indexOf('mobile') >= 0)) type = 'mobile';
    else type = Object.keys(votes).sort((a, b) => votes[b] - votes[a])[0] || '';
    const flags = {};
    ok.forEach((r, i) => r.flags.forEach((f) => { (flags[f] = flags[f] || []).push(SOURCES.filter((s) => S.src[s.name] === r)[0].name); }));
    const first = (k) => { for (const r of ok) if (r[k]) return r[k]; return ''; };
    return { ok, type, flags, cc: first('cc'), tz: first('tz'), loc: (ok[0] || {}).loc, org: first('org'), asn: first('asn') };
  }

  function envCheck(agg) {
    if (!S.self) return null;
    const btz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } })();
    const lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    const out = { btz, lang, tzOk: null, langOk: null };
    if (agg.tz && btz) {
      const off = (tz) => { try { const d = new Date(); const s = d.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' }); return s.split(' ').pop(); } catch (e) { return tz; } };
      out.tzOk = agg.tz === btz || off(agg.tz) === off(btz);
    }
    const exp = agg.cc && LANGS[String(agg.cc).toUpperCase()];
    if (exp && lang) out.langOk = exp.indexOf(lang.toLowerCase().split('-')[0]) >= 0;
    return out;
  }

  function score(agg, env) {
    let s = 100; const why = [];
    const tw = TYPE_W[agg.type] == null ? 10 : TYPE_W[agg.type];
    why.push({ txt: t('rsType', { type: t(TYPE_KEY[agg.type] || 'tyUnknown') }), d: -tw });
    s -= tw;
    Object.keys(agg.flags).forEach((f) => {
      let w = FLAG_W[f] || 0;
      if ((f === 'hosting' || f === 'cloud') && agg.type === 'hosting') w = Math.min(w, 5);
      if (!w) return;
      s -= w; why.push({ txt: t('rsFlag', { f: t(FLAG_KEY[f]), src: agg.flags[f].join(', ') }), d: -w });
    });
    const listed = Object.values(S.bl).filter((b) => b && b.listed).length;
    if (listed) { const w = Math.min(30, listed * 10); s -= w; why.push({ txt: t('rsBl', { n: listed }), d: -w }); }
    if (env && env.tzOk === false) { s -= 10; why.push({ txt: t('rsTz'), d: -10 }); }
    if (env && env.langOk === false) { s -= 5; why.push({ txt: t('rsLang'), d: -5 }); }
    s = Math.max(0, Math.min(100, s));
    return { s, why, lv: s >= 80 ? 'good' : s >= 50 ? 'mid' : 'bad' };
  }

  function render() {
    if (!S.ip) { el.out.innerHTML = ''; return; }
    const ty = typeOf(parseAddr(S.ip).n, S.v);
    if (!ty.isPublic) { el.out.innerHTML = `<div class="card empty">${t('riskNotPublic', { ip: `<b class="mono">${esc(S.ip)}</b>`, type: t(ty.key) })}</div>`; return; }
    const agg = pick();
    const done = SOURCES.every((s) => S.src[s.name]);
    const env = envCheck(agg);
    const sc = agg.ok.length ? score(agg, env) : null;
    const lvText = sc ? t(sc.lv === 'good' ? 'riskLvGood' : sc.lv === 'mid' ? 'riskLvMid' : 'riskLvBad') : '';

    const head = `<div class="card risk-score ${sc ? sc.lv : ''}">
      <div class="score-ring" style="--p:${sc ? sc.s : 0}"><b>${sc ? sc.s : '<span class="skel"></span>'}</b><small>${t('riskScore')}</small></div>
      <div class="score-main">
        <div class="q-head"><span class="ver-badge ${S.v === 6 ? 'v6' : ''}">IPv${S.v}</span><a class="ipv mono big" href="#/query?ip=${enc(S.ip)}">${esc(S.ip)}</a>
          <button class="copy show" type="button" data-copy="${esc(S.ip)}" title="Copy">${IPC.ICON_COPY}</button></div>
        <div class="score-lv ${sc ? sc.lv : ''}">${sc ? esc(lvText) : t('loading')}</div>
        <div class="score-meta">${agg.ok.length ? typeTag(agg.type) + Object.keys(agg.flags).map(flagTag).join('') : ''}</div>
        <div class="muted score-loc">${agg.loc ? ccBadge(agg.cc) + esc(locText(agg.loc)) : ''}${agg.asn ? ` · <span class="mono asn">AS${esc(agg.asn)}</span>` : ''} ${esc(agg.org || '')}</div>
      </div></div>`;

    const reasons = sc ? sc.why.filter((w) => w.d).map((w) => `<div class="row"><span class="v reason">${esc(w.txt)}</span><b class="bad mono">${w.d}</b><span></span></div>`).join('') : '';
    const reasonCard = `<div class="card"><div class="section-title">${t('riskReasons')}</div>${sc ? `<div class="rows">${reasons || `<div class="row"><span class="v reason good">${t('rsNone')}</span></div>`}</div>` : '<span class="skel" style="width:12rem"></span>'}${done ? '' : `<p class="note">${t('loading')}</p>`}</div>`;

    const rows = SOURCES.map((s) => {
      const r = S.src[s.name];
      if (!r) return `<tr><td><b class="site">${esc(s.name)}</b></td><td colspan="3"><span class="skel" style="width:12rem"></span></td></tr>`;
      if (r.error) return `<tr><td><b class="site">${esc(s.name)}</b></td><td colspan="3" class="err">${esc(r.error)}</td></tr>`;
      const flags = r.flags.length ? r.flags.map(flagTag).join('') : r.partial ? '<span class="muted">—</span>' : `<span class="tag ok">${t('fClean')}</span>`;
      return `<tr><td><b class="site">${esc(s.name)}</b></td><td>${r.type ? typeTag(r.type) : '<span class="muted">—</span>'}</td><td class="loc">${flags}</td><td class="loc">${r.asn ? `<span class="mono asn">AS${esc(r.asn)}</span> ` : ''}${esc(r.org || '')}</td></tr>`;
    }).join('');
    const srcCard = `<div class="card block"><div class="section-title">${t('riskSources')}</div><div class="table-wrap plain"><table><thead><tr><th>${t('colSource')}</th><th>${t('colType')}</th><th>${t('colFlags')}</th><th>${t('colOrg')}</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;

    const bl = S.v !== 4 ? `<p class="muted">${t('blV4only')}</p>` : `<div class="bl-grid">${DNSBL.map((b) => {
      const r = S.bl[b.zone];
      const st = !r ? '<span class="skel" style="width:3rem"></span>' : r.unknown ? `<span class="muted">${t('blUnknown')}</span>` : r.pbl ? `<span class="tag" title="${esc(t('blPblTip'))} (${esc(r.codes.join(', '))})">PBL</span>` : r.listed ? `<span class="tag cn" title="${esc(r.codes.join(', '))}">${t('blListed')}</span>` : `<span class="tag ok">${t('blClean')}</span>`;
      return `<div class="bl-item"><span>${esc(b.name)}</span>${st}</div>`;
    }).join('')}</div>`;

    let envHtml;
    if (!S.self) envHtml = `<p class="muted">${t('envOther')}</p>`;
    else {
      const it = (ok, txt) => `<div class="env-item"><span class="env-dot ${ok == null ? '' : ok ? 'good' : 'bad'}"></span>${txt}</div>`;
      envHtml = it(env.tzOk, env.tzOk == null ? `${t('envTz')}: <b class="mono">${esc(env.btz)}</b> · ${t('envNoTz')}` : t(env.tzOk ? 'envTzOk' : 'envTzBad', { b: `<b class="mono">${esc(env.btz)}</b>`, i: `<b class="mono">${esc(agg.tz)}</b>` }))
        + it(env.langOk, env.langOk == null ? `${t('envLang')}: <b class="mono">${esc(env.lang)}</b>` : t(env.langOk ? 'envLangOk' : 'envLangWarn', { l: `<b class="mono">${esc(env.lang)}</b>`, c: `<b>${esc(agg.cc)}</b>` }));
    }

    const links = [
      ['Scamalytics', 'https://scamalytics.com/ip/' + enc(S.ip)],
      ['IPQualityScore', 'https://www.ipqualityscore.com/free-ip-lookup-proxy-vpn-test/lookup/' + enc(S.ip)],
      ['AbuseIPDB', 'https://www.abuseipdb.com/check/' + enc(S.ip)],
      ['ping0.cc', 'https://ping0.cc/ip/' + enc(S.ip)],
      ['IPinfo', 'https://ipinfo.io/' + enc(S.ip)],
      ['BrowserLeaks', 'https://browserleaks.com/ip']
    ].map(([n, u]) => `<a class="chip" href="${u}" target="_blank" rel="noopener">${esc(n)} ↗</a>`).join('');

    el.out.innerHTML = `<div class="risk-top">${head}${reasonCard}</div>${srcCard}
      <div class="grid2 block"><div class="card"><div class="section-title">${t('riskBl')}</div>${bl}</div><div class="card"><div class="section-title">${t('riskEnv')}</div>${envHtml}</div></div>
      <div class="card block"><div class="section-title">${t('riskMore')}</div><div class="chips">${links}</div><p class="note">${t('riskDisclaimer')}</p></div>`;
  }

  let tmr = 0;
  const schedule = () => { if (!tmr) tmr = setTimeout(() => { tmr = 0; render(); }, 30); };

  function check(ip, self) {
    const a = parseAddr(ip);
    const id = ++runId;
    S.ip = ipstr(a.n, a.v); S.v = a.v; S.src = {}; S.bl = {};
    S.self = !!self || S.ip === S.selfIp;
    el.msg.textContent = '';
    render();
    if (!typeOf(a.n, a.v).isPublic) return;
    SOURCES.forEach((s) => s.run(S.ip).then(
      (r) => { if (id === runId) { S.src[s.name] = r; schedule(); } },
      (e) => { if (id === runId) { S.src[s.name] = { error: errText(e) }; schedule(); } }));
    if (a.v === 4) DNSBL.forEach((b) => dnsbl(S.ip, b.zone).then((r) => { if (id === runId) { S.bl[b.zone] = r; schedule(); } }));
  }

  async function mine() {
    el.msg.textContent = t('loading');
    try {
      const r = await req('https://api64.ipify.org?format=json', { ms: 6000 });
      S.selfIp = r.data.ip; el.input.value = '';
      IPC.setHash('risk', { ip: r.data.ip });
      check(r.data.ip, true);
    } catch (e) { el.msg.textContent = errText(e); }
  }

  function submit(q) {
    q = String(q || '').trim();
    if (!q) { mine(); return; }
    if (!parseAddr(q)) { el.msg.textContent = t('qInvalid'); return; }
    IPC.setHash('risk', { ip: q });
    check(q, false);
  }

  IPC.register('risk', {
    init() {
      el = { input: $('#rInput'), msg: $('#rMsg'), out: $('#rOut') };
      $('#rForm').addEventListener('submit', (e) => { e.preventDefault(); submit(el.input.value); });
      $('#rMine').addEventListener('click', mine);
    },
    enter(params) {
      const ip = params.get('ip');
      if (ip && ip !== S.ip) { el.input.value = ip === S.selfIp ? '' : ip; check(ip, false); }
      else if (!ip && !S.ip) mine();
      else render();
    },
    lang() { render(); }
  });
})();
