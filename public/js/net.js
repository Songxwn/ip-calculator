(() => {
  'use strict';
  const IPC = window.IPC;
  const t = IPC.t, esc = IPC.esc;

  const rand = (n = 16, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') => {
    const a = new Uint8Array(n); crypto.getRandomValues(a);
    return Array.from(a, (x) => chars[x % chars.length]).join('');
  };

  async function req(url, { ms = 8000, as = 'json', headers, mode } = {}) {
    const ctl = new AbortController();
    const tm = setTimeout(() => ctl.abort(), ms);
    const t0 = performance.now();
    try {
      const res = await fetch(url, { signal: ctl.signal, cache: 'no-store', headers, mode, credentials: 'omit', referrerPolicy: 'strict-origin-when-cross-origin' });
      if (mode !== 'no-cors' && !res.ok) throw new Error('HTTP ' + res.status);
      const data = as === 'json' ? await res.json() : as === 'text' ? await res.text() : null;
      return { data, res, ms: Math.round(performance.now() - t0) };
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('timeout');
      throw e;
    } finally { clearTimeout(tm); }
  }

  let seq = 0;
  function jsonp(url, { param = 'callback', charset, ms = 8000 } = {}) {
    return new Promise((resolve, reject) => {
      const cb = '__ipc_cb' + (++seq) + rand(6);
      const s = document.createElement('script');
      const t0 = performance.now();
      const tm = setTimeout(() => { window[cb] = () => { }; s.remove(); reject(new Error('timeout')); }, ms);
      window[cb] = (d) => { clearTimeout(tm); delete window[cb]; s.remove(); resolve({ data: d, ms: Math.round(performance.now() - t0) }); };
      if (charset) s.charset = charset;
      s.referrerPolicy = 'no-referrer';
      s.onerror = () => { clearTimeout(tm); delete window[cb]; s.remove(); reject(new Error('load error')); };
      s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + param + '=' + cb;
      document.head.appendChild(s);
    });
  }

  function script(url, { charset, ms = 8000 } = {}) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      const t0 = performance.now();
      const tm = setTimeout(() => { s.remove(); reject(new Error('timeout')); }, ms);
      if (charset) s.charset = charset;
      s.referrerPolicy = 'no-referrer';
      s.onload = () => { clearTimeout(tm); s.remove(); resolve({ ms: Math.round(performance.now() - t0) }); };
      s.onerror = () => { clearTimeout(tm); s.remove(); reject(new Error('load error')); };
      s.src = url;
      document.head.appendChild(s);
    });
  }

  async function ping(url, ms = 5000) {
    const t0 = performance.now();
    await req(url + (url.indexOf('?') >= 0 ? '&' : '?') + '_=' + rand(8), { mode: 'no-cors', as: 'none', ms });
    return Math.round(performance.now() - t0);
  }

  async function trace(host, ms) {
    const r = await req('https://' + host + '/cdn-cgi/trace', { as: 'text', ms });
    const o = {};
    r.data.trim().split('\n').forEach((l) => { const i = l.indexOf('='); if (i > 0) o[l.slice(0, i)] = l.slice(i + 1); });
    return { data: o, ms: r.ms };
  }

  /* ---------------- Names ---------------- */
  const dnCache = {};
  function countryName(cc) {
    if (!cc || !/^[A-Za-z]{2}$/.test(cc)) return '';
    const l = IPC.lang === 'zh' ? 'zh-CN' : 'en';
    try {
      dnCache[l] = dnCache[l] || new Intl.DisplayNames([l], { type: 'region' });
      return dnCache[l].of(cc.toUpperCase());
    } catch (e) { return cc.toUpperCase(); }
  }
  const parseAsn = (s) => { const m = /AS?(\d+)/i.exec(String(s == null ? '' : s)); return m ? Number(m[1]) : (typeof s === 'number' ? s : null); };
  const stripAsn = (s) => String(s || '').replace(/^AS\d+\s*/i, '');

  const N = {
    ipsb: (d) => ({ ip: d.ip, cc: d.country_code, country: d.country, region: d.region, city: d.city, isp: d.isp, org: d.organization || d.asn_organization, asn: d.asn }),
    ipwho: (d) => d.success === false ? null : ({ ip: d.ip, cc: d.country_code, country: d.country, region: d.region, city: d.city, isp: d.connection && d.connection.isp, org: d.connection && d.connection.org, asn: d.connection && d.connection.asn }),
    ipinfo: (d) => ({ ip: d.ip, cc: d.country, region: d.region, city: d.city, isp: stripAsn(d.org), asn: parseAsn(d.org), hostname: d.hostname }),
    ipapis: (d) => {
      const loc = d.location || {}, asn = d.asn && typeof d.asn === 'object' ? d.asn : null;
      const company = d.company && typeof d.company === 'object' ? d.company.name : d.company;
      return { ip: d.ip, cc: loc.country_code || d.country_code, country: loc.country || d.country, region: loc.state || d.region, city: loc.city || d.city, isp: (asn && asn.org) || company || stripAsn(d.asn), asn: asn ? asn.asn : parseAsn(d.asn) };
    },
    geojs: (d) => ({ ip: d.ip, cc: d.country_code, country: d.country, region: d.region, city: d.city, isp: d.organization_name || stripAsn(d.organization), asn: d.asn }),
    freeipapi: (d) => ({ ip: d.ipAddress, cc: d.countryCode, country: d.countryName, region: d.regionName, city: d.cityName, isp: d.asnOrganization || d.asnOrganisation, asn: parseAsn(d.asn) }),
    ipapico: (d) => d.error ? null : ({ ip: d.ip, cc: d.country_code, country: d.country_name, region: d.region, city: d.city, isp: d.org, asn: parseAsn(d.asn) }),
    ipbase: (d) => ({ ip: d.ip, cc: d.country_code, country: d.country_name, region: d.region_name, city: d.city }),
    iplocation: (d) => ({ ip: d.ip, cc: d.country_code2, country: d.country_name, isp: d.isp }),
    ipguide: (d) => {
      const as = (d.network && d.network.autonomous_system) || {}, loc = d.location || {};
      return { ip: d.ip, country: loc.country, city: loc.city, isp: as.organization || as.name, asn: as.asn, cidr: d.network && d.network.cidr };
    },
    myipla: (d) => ({ ip: d.ip, cc: d.location && d.location.country_code, country: d.location && d.location.country_name, region: d.location && d.location.province, city: d.location && d.location.city }),
    cfmeta: (d) => ({ ip: d.clientIp, cc: d.country, region: d.region, city: d.city, isp: d.asOrganization, asn: d.asn, colo: d.colo && d.colo.iata }),
    ipleak: (d) => ({ ip: d.ip, cc: d.country_code, country: d.country_name, region: d.region_name, city: d.city_name, isp: d.isp_name, asn: d.as_number }),
    n126: (d) => { const r = d.result || {}; return { ip: r.ip, cc: r.countrySymbol, country: r.country, region: r.province, city: r.city, isp: r.company || r.operator, zh: true }; },
    pconline: (d) => ({ ip: d.ip, locText: String(d.addr || '').trim(), zh: true }),
    speedtestcn: (d) => { const r = d.data || {}; return { ip: r.ip, cc: r.countryCode, country: r.country, region: r.province, city: r.city, isp: r.isp, zh: true }; },
    zxinc: (d) => { const r = d.data || {}; return { ip: r.myip || (r.ip && r.ip.query), locText: String(r.location || '').replace(/–/g, ' ').trim(), zh: true }; }
  };

  function locText(g) {
    if (!g) return '';
    if (g.locText) return g.locText;
    const parts = [];
    const cn = (!g.zh && g.cc && countryName(g.cc)) || g.country || (g.cc ? g.cc.toUpperCase() : '');
    [cn, g.region, g.city].forEach((p) => { p = String(p || '').trim(); if (p && parts.indexOf(p) < 0 && !(parts.length && parts[parts.length - 1].indexOf(p) >= 0)) parts.push(p); });
    return parts.join(' · ');
  }
  function ispText(g) {
    if (!g) return '';
    const isp = String(g.isp || g.org || '').trim();
    return (g.asn ? 'AS' + g.asn + ' ' : '') + isp;
  }

  const geoCache = {};
  function geo(ip) {
    if (!ip) return Promise.resolve(null);
    if (geoCache[ip]) return geoCache[ip];
    const p = (async () => {
      const tries = [
        () => req('https://api.ip.sb/geoip/' + ip, { ms: 6000 }).then((r) => N.ipsb(r.data)),
        () => req('https://ipwho.is/' + ip, { ms: 6000 }).then((r) => N.ipwho(r.data)),
        () => req('https://ipinfo.io/' + ip + '/json', { ms: 6000 }).then((r) => N.ipinfo(r.data))
      ];
      for (const f of tries) { try { const g = await f(); if (g) return g; } catch (e) { } }
      return null;
    })();
    geoCache[ip] = p;
    p.then((g) => { if (!g) delete geoCache[ip]; });
    return p;
  }

  function ccBadge(cc) {
    if (!cc || !/^[A-Za-z]{2}$/.test(cc)) return '';
    return `<span class="cc" title="${esc(countryName(cc))}">${esc(cc.toUpperCase())}</span>`;
  }

  const IATA = {
    HKG: ['香港', 'Hong Kong'], TPE: ['台北', 'Taipei'], KHH: ['高雄', 'Kaohsiung'], MFM: ['澳门', 'Macau'],
    NRT: ['东京', 'Tokyo'], HND: ['东京', 'Tokyo'], KIX: ['大阪', 'Osaka'], FUK: ['福冈', 'Fukuoka'], OKA: ['冲绳', 'Okinawa'],
    ICN: ['首尔', 'Seoul'], SIN: ['新加坡', 'Singapore'], KUL: ['吉隆坡', 'Kuala Lumpur'], BKK: ['曼谷', 'Bangkok'],
    MNL: ['马尼拉', 'Manila'], SGN: ['胡志明市', 'Ho Chi Minh City'], HAN: ['河内', 'Hanoi'], CGK: ['雅加达', 'Jakarta'],
    BOM: ['孟买', 'Mumbai'], DEL: ['新德里', 'New Delhi'], MAA: ['金奈', 'Chennai'], DXB: ['迪拜', 'Dubai'],
    SYD: ['悉尼', 'Sydney'], MEL: ['墨尔本', 'Melbourne'], AKL: ['奥克兰', 'Auckland'],
    LAX: ['洛杉矶', 'Los Angeles'], SJC: ['圣何塞', 'San Jose'], SFO: ['旧金山', 'San Francisco'], SEA: ['西雅图', 'Seattle'],
    PDX: ['波特兰', 'Portland'], DEN: ['丹佛', 'Denver'], DFW: ['达拉斯', 'Dallas'], ORD: ['芝加哥', 'Chicago'],
    IAD: ['华盛顿', 'Ashburn'], EWR: ['纽瓦克', 'Newark'], JFK: ['纽约', 'New York'], LGA: ['纽约', 'New York'],
    ATL: ['亚特兰大', 'Atlanta'], MIA: ['迈阿密', 'Miami'], BOS: ['波士顿', 'Boston'], PHX: ['凤凰城', 'Phoenix'],
    YYZ: ['多伦多', 'Toronto'], YVR: ['温哥华', 'Vancouver'], YUL: ['蒙特利尔', 'Montreal'], GRU: ['圣保罗', 'São Paulo'],
    LHR: ['伦敦', 'London'], LON: ['伦敦', 'London'], AMS: ['阿姆斯特丹', 'Amsterdam'], FRA: ['法兰克福', 'Frankfurt'],
    CDG: ['巴黎', 'Paris'], MAD: ['马德里', 'Madrid'], MXP: ['米兰', 'Milan'], ZRH: ['苏黎世', 'Zurich'],
    VIE: ['维也纳', 'Vienna'], WAW: ['华沙', 'Warsaw'], ARN: ['斯德哥尔摩', 'Stockholm'], CPH: ['哥本哈根', 'Copenhagen'],
    HEL: ['赫尔辛基', 'Helsinki'], OSL: ['奥斯陆', 'Oslo'], DUB: ['都柏林', 'Dublin'], BRU: ['布鲁塞尔', 'Brussels'],
    MUC: ['慕尼黑', 'Munich'], DUS: ['杜塞尔多夫', 'Düsseldorf'], PRG: ['布拉格', 'Prague'], IST: ['伊斯坦布尔', 'Istanbul'],
    JNB: ['约翰内斯堡', 'Johannesburg'],
    PEK: ['北京', 'Beijing'], PKX: ['北京', 'Beijing'], SHA: ['上海', 'Shanghai'], PVG: ['上海', 'Shanghai'],
    CAN: ['广州', 'Guangzhou'], SZX: ['深圳', 'Shenzhen'], CTU: ['成都', 'Chengdu'], TFU: ['成都', 'Chengdu'],
    CKG: ['重庆', 'Chongqing'], HGH: ['杭州', 'Hangzhou'], NKG: ['南京', 'Nanjing'], TSN: ['天津', 'Tianjin'],
    XIY: ['西安', "Xi'an"], WUH: ['武汉', 'Wuhan'], CSX: ['长沙', 'Changsha'], TAO: ['青岛', 'Qingdao'],
    SJW: ['石家庄', 'Shijiazhuang'], TNA: ['济南', 'Jinan'], CGO: ['郑州', 'Zhengzhou'], SHE: ['沈阳', 'Shenyang'],
    DLC: ['大连', 'Dalian'], HRB: ['哈尔滨', 'Harbin'], FOC: ['福州', 'Fuzhou'], XMN: ['厦门', 'Xiamen'],
    KMG: ['昆明', 'Kunming'], NNG: ['南宁', 'Nanning'], HAK: ['海口', 'Haikou'], HFE: ['合肥', 'Hefei'],
    KWE: ['贵阳', 'Guiyang'], TYN: ['太原', 'Taiyuan'], LHW: ['兰州', 'Lanzhou'], URC: ['乌鲁木齐', 'Ürümqi'],
    CGQ: ['长春', 'Changchun'], NNY: ['南阳', 'Nanyang'], WUX: ['无锡', 'Wuxi'], CZX: ['常州', 'Changzhou'],
    NGB: ['宁波', 'Ningbo'], DGM: ['东莞', 'Dongguan'], FUO: ['佛山', 'Foshan'], ZUH: ['珠海', 'Zhuhai']
  };
  const iataName = (code) => {
    if (!code) return '';
    const c = IATA[String(code).toUpperCase()];
    return c ? c[IPC.lang === 'zh' ? 0 : 1] : '';
  };

  function latClass(ms) {
    if (ms == null) return 'fail';
    if (ms < 150) return 'good';
    if (ms < 400) return 'mid';
    return 'bad';
  }

  const errText = (e) => {
    const m = (e && e.message) || String(e);
    if (m === 'timeout') return t('errTimeout');
    if (/Failed to fetch|NetworkError|load error|Load failed/i.test(m)) return t('errNetwork');
    return m;
  };

  IPC.addI18n({
    zh: { errTimeout: '超时', errNetwork: '无法连接', loading: '检测中…', refresh: '重新检测', notDetected: '未检测到' },
    en: { errTimeout: 'Timed out', errNetwork: 'Unreachable', loading: 'Checking…', refresh: 'Re-run', notDetected: 'Not detected' }
  });

  IPC.net = { rand, req, jsonp, script, trace, ping, N, geo, locText, ispText, countryName, ccBadge, iataName, latClass, errText, parseAsn };
})();
