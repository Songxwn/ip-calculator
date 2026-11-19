(() => {
  'use strict';

  /* ---------------- i18n ---------------- */
  const I18N = {
    zh: {
      title: 'IP 子网计算器', subtitle: 'IPv4 · IPv6 · CIDR',
      switchLang: '切换语言', switchTheme: '切换主题',
      themeAuto: '自动', themeLight: '浅色', themeDark: '深色',
      inputLabel: '输入 IP 地址 / CIDR（支持 IPv4、IPv6、掩码、反掩码）',
      inputPh: '192.168.1.10/24 · 10.0.0.1 255.255.0.0 · 2001:db8::1/64',
      clear: '清空', share: '复制分享链接',
      examples: '示例', history: '最近', clearHistory: '清除',
      tabCalc: '计算结果', tabSplit: '子网划分', tabRange: '范围 → CIDR', tabCheat: '速查表',
      rangeTitle: 'IP 范围转换为 CIDR', rangeDesc: '输入起始与结束地址，计算精确覆盖该范围的最少 CIDR 块。',
      footer: '纯静态 · 所有计算均在浏览器本地完成，不上传任何数据',
      kbdFocus: '聚焦输入', kbdPrefix: '调整前缀',
      errInvalid: '无法识别的地址格式', errPrefix: '前缀长度超出范围（0–{max}）', errMask: '无效的子网掩码',
      cidr: 'CIDR 网段', usable: '可用主机数', totalAddr: '地址总数', netmask: '子网掩码', type: '地址类型',
      address: 'IP 地址', network: '网络地址', broadcast: '广播地址',
      firstHost: '首个可用地址', lastHost: '末个可用地址', hostRange: '可用范围',
      wildcard: '通配符掩码', prefixLen: '前缀长度', ipClass: '地址类别', classN: '{c} 类',
      hex: '十六进制', decimal: '十进制整数', reverse: '反向解析 PTR',
      mapped: 'IPv4 映射 IPv6', sixToFour: '6to4 前缀', expanded: '完整格式', compressed: '压缩格式',
      firstAddr: '起始地址', lastAddr: '结束地址', subnets64: '/64 子网数', embeddedV4: '内嵌 IPv4',
      secNetwork: '网络信息', secFormat: '掩码与格式', secBits: '二进制视图',
      netBits: '网络位', hostBits: '主机位', na: '不适用',
      p2p: '点对点链路 (RFC 3021)', singleHost: '单主机',
      splitInto: '划分为', splitCount: '共 {n} 个子网，每个含 {h} 个地址',
      subnet: '子网', colRange: '可用范围', colBroadcast: '广播地址', colLast: '结束地址', colHosts: '可用主机',
      copyAll: '复制全部', splitTooMany: '仅显示前 {n} 个子网', splitNone: '已是最小子网，无法继续划分',
      enterFirst: '请先在上方输入一个有效的 IP 地址',
      rangeResult: '{n} 个 CIDR 块 · 共 {a} 个地址', rangeErr: '请输入同一协议版本的有效起止地址', rangeOrder: '起始地址不能大于结束地址',
      cheatV4: 'IPv4 CIDR 速查表', cheatV6: 'IPv6 常用前缀', cheatTip: '点击行可将该前缀应用到当前地址',
      colPrefix: '前缀', colMask: '子网掩码', colWildcard: '通配符', colAddrs: '地址数', colUsable: '可用主机', colUsage: '典型用途', colNum64: '/64 数量',
      u32: 'RIR 向 ISP 分配', u48: '站点 / 企业', u56: '家庭宽带', u60: '小型网络', u64: '单个局域网 (SLAAC)', u127: '点对点链路', u128: '单个主机',
      copied: '已复制', linkCopied: '分享链接已复制',
      tPublic: '公网地址', tPrivate: '私有地址', tLoopback: '环回地址', tLinkLocal: '链路本地', tMulticast: '组播',
      tReserved: '保留地址', tCGNAT: '运营商级 NAT', tDoc: '文档示例', tBench: '基准测试', tThis: '本网络',
      tBroadcast: '受限广播', tUnspec: '未指定地址', tMapped: 'IPv4 映射', tNAT64: 'NAT64', tTeredo: 'Teredo',
      t6to4: '6to4', tULA: '唯一本地 ULA', tGUA: '全球单播', tDiscard: '丢弃前缀', tIETF: 'IETF 协议分配', t6to4Relay: '6to4 中继',
      clickToLoad: '点击载入'
    },
    en: {
      title: 'IP Subnet Calculator', subtitle: 'IPv4 · IPv6 · CIDR',
      switchLang: 'Switch language', switchTheme: 'Switch theme',
      themeAuto: 'Auto', themeLight: 'Light', themeDark: 'Dark',
      inputLabel: 'Enter an IP address / CIDR (IPv4, IPv6, netmask or wildcard)',
      inputPh: '192.168.1.10/24 · 10.0.0.1 255.255.0.0 · 2001:db8::1/64',
      clear: 'Clear', share: 'Copy share link',
      examples: 'Examples', history: 'Recent', clearHistory: 'Clear',
      tabCalc: 'Result', tabSplit: 'Subnetting', tabRange: 'Range → CIDR', tabCheat: 'Cheat sheet',
      rangeTitle: 'IP range to CIDR', rangeDesc: 'Enter a start and end address to get the minimal set of CIDR blocks covering exactly that range.',
      footer: '100% static · all calculations run locally in your browser, nothing is uploaded',
      kbdFocus: 'focus input', kbdPrefix: 'change prefix',
      errInvalid: 'Unrecognized address format', errPrefix: 'Prefix length out of range (0–{max})', errMask: 'Invalid subnet mask',
      cidr: 'CIDR block', usable: 'Usable hosts', totalAddr: 'Total addresses', netmask: 'Netmask', type: 'Address type',
      address: 'IP address', network: 'Network address', broadcast: 'Broadcast address',
      firstHost: 'First usable', lastHost: 'Last usable', hostRange: 'Usable range',
      wildcard: 'Wildcard mask', prefixLen: 'Prefix length', ipClass: 'Class', classN: 'Class {c}',
      hex: 'Hexadecimal', decimal: 'Decimal integer', reverse: 'Reverse DNS (PTR)',
      mapped: 'IPv4-mapped IPv6', sixToFour: '6to4 prefix', expanded: 'Expanded', compressed: 'Compressed',
      firstAddr: 'First address', lastAddr: 'Last address', subnets64: '/64 subnets', embeddedV4: 'Embedded IPv4',
      secNetwork: 'Network', secFormat: 'Mask & formats', secBits: 'Binary view',
      netBits: 'Network bits', hostBits: 'Host bits', na: 'N/A',
      p2p: 'Point-to-point (RFC 3021)', singleHost: 'Single host',
      splitInto: 'Split into', splitCount: '{n} subnets, {h} addresses each',
      subnet: 'Subnet', colRange: 'Usable range', colBroadcast: 'Broadcast', colLast: 'Last address', colHosts: 'Usable',
      copyAll: 'Copy all', splitTooMany: 'Showing the first {n} subnets only', splitNone: 'Already the smallest subnet, cannot split further',
      enterFirst: 'Enter a valid IP address above first',
      rangeResult: '{n} CIDR blocks · {a} addresses', rangeErr: 'Enter valid start and end addresses of the same IP version', rangeOrder: 'Start address must not be greater than end address',
      cheatV4: 'IPv4 CIDR cheat sheet', cheatV6: 'Common IPv6 prefixes', cheatTip: 'Click a row to apply that prefix to the current address',
      colPrefix: 'Prefix', colMask: 'Netmask', colWildcard: 'Wildcard', colAddrs: 'Addresses', colUsable: 'Usable', colUsage: 'Typical use', colNum64: '# of /64',
      u32: 'RIR → ISP allocation', u48: 'Site / enterprise', u56: 'Home broadband', u60: 'Small network', u64: 'Single LAN (SLAAC)', u127: 'Point-to-point link', u128: 'Single host',
      copied: 'Copied', linkCopied: 'Share link copied',
      tPublic: 'Public', tPrivate: 'Private', tLoopback: 'Loopback', tLinkLocal: 'Link-local', tMulticast: 'Multicast',
      tReserved: 'Reserved', tCGNAT: 'Carrier-grade NAT', tDoc: 'Documentation', tBench: 'Benchmarking', tThis: 'This network',
      tBroadcast: 'Limited broadcast', tUnspec: 'Unspecified', tMapped: 'IPv4-mapped', tNAT64: 'NAT64', tTeredo: 'Teredo',
      t6to4: '6to4', tULA: 'Unique local (ULA)', tGUA: 'Global unicast', tDiscard: 'Discard prefix', tIETF: 'IETF protocol assignment', t6to4Relay: '6to4 relay',
      clickToLoad: 'Click to load'
    }
  };

  const $ = (s) => document.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };

  let lang = store.get('ipc-lang', (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en');
  const t = (k, vars) => {
    let s = (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
    if (vars) for (const v in vars) s = s.split('{' + v + '}').join(vars[v]);
    return s;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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
    const b = BITS[v];
    if (p === 0) return 0n;
    return ((1n << BigInt(p)) - 1n) << BigInt(b - p);
  }
  function prefixOfMask(m, v) {
    const inv = ~m & MAX[v];
    if ((inv & (inv + 1n)) !== 0n) return -1;
    let c = 0, x = m;
    while (x) { c += Number(x & 1n); x >>= 1n; }
    return c;
  }

  function inNet(n, net, p, v) { const m = maskOf(p, v); return (n & m) === (net & m); }

  function parseAddr(s) {
    if (s.indexOf(':') >= 0) { const n = parseV6(s); return n == null ? null : { n, v: 6 }; }
    const n = parseV4(s); return n == null ? null : { n, v: 4 };
  }

  function parseInput(raw, fallbackPrefix) {
    const s = raw.trim().replace(/\s+/g, ' ');
    if (!s) return { empty: true };
    const m = /^([^\s/]+)(?:\s*[/ ]\s*(\S+))?$/.exec(s);
    if (!m) return { error: t('errInvalid') };
    const a = parseAddr(m[1]);
    if (!a) return { error: t('errInvalid') };
    const max = BITS[a.v];
    let p, hasPrefix = !!m[2];
    if (!m[2]) {
      p = fallbackPrefix[a.v];
    } else if (/^\d{1,3}$/.test(m[2])) {
      p = Number(m[2]);
      if (p > max) return { error: t('errPrefix', { max }) };
    } else if (a.v === 4) {
      const mk = parseV4(m[2]);
      if (mk == null) return { error: t('errMask') };
      p = prefixOfMask(mk, 4);
      if (p < 0) { p = prefixOfMask(~mk & MAX[4], 4); }
      if (p < 0) return { error: t('errMask') };
    } else {
      return { error: t('errPrefix', { max }) };
    }
    return { n: a.n, v: a.v, p, hasPrefix };
  }

  function typeOf(n, v) {
    const L = (cidr, key, cls) => ({ cidr, key, cls });
    const list4 = [
      L('255.255.255.255/32', 'tBroadcast', 'warn'), L('0.0.0.0/8', 'tThis', 'warn'), L('10.0.0.0/8', 'tPrivate', 'ok'),
      L('100.64.0.0/10', 'tCGNAT', 'warn'), L('127.0.0.0/8', 'tLoopback', 'warn'), L('169.254.0.0/16', 'tLinkLocal', 'warn'),
      L('172.16.0.0/12', 'tPrivate', 'ok'), L('192.0.0.0/24', 'tIETF', 'warn'), L('192.0.2.0/24', 'tDoc', 'warn'),
      L('192.88.99.0/24', 't6to4Relay', 'warn'), L('192.168.0.0/16', 'tPrivate', 'ok'), L('198.18.0.0/15', 'tBench', 'warn'),
      L('198.51.100.0/24', 'tDoc', 'warn'), L('203.0.113.0/24', 'tDoc', 'warn'), L('224.0.0.0/4', 'tMulticast', 'warn'),
      L('240.0.0.0/4', 'tReserved', 'warn')
    ];
    const list6 = [
      L('::/128', 'tUnspec', 'warn'), L('::1/128', 'tLoopback', 'warn'), L('::ffff:0:0/96', 'tMapped', 'warn'),
      L('64:ff9b::/96', 'tNAT64', 'warn'), L('100::/64', 'tDiscard', 'warn'), L('2001::/32', 'tTeredo', 'warn'),
      L('2001:db8::/32', 'tDoc', 'warn'), L('2002::/16', 't6to4', 'warn'), L('fc00::/7', 'tULA', 'ok'),
      L('fe80::/10', 'tLinkLocal', 'warn'), L('ff00::/8', 'tMulticast', 'warn'), L('2000::/3', 'tGUA', '')
    ];
    for (const it of v === 4 ? list4 : list6) {
      const [a, pp] = it.cidr.split('/');
      const net = v === 4 ? parseV4(a) : parseV6(a);
      if (inNet(n, net, Number(pp), v)) return it;
    }
    return { cidr: '', key: v === 4 ? 'tPublic' : 'tReserved', cls: v === 4 ? '' : 'warn' };
  }

  function rangeToCidrs(start, end, v) {
    const b = BITS[v], out = [];
    while (start <= end && out.length < 4096) {
      let p = b;
      while (p > 0) {
        const size = 1n << BigInt(b - p + 1);
        if ((start & (size - 1n)) !== 0n || start + size - 1n > end) break;
        p--;
      }
      out.push({ n: start, p });
      start += 1n << BigInt(b - p);
      if (start > MAX[v]) break;
    }
    return out;
  }

  const fmt = (n) => { try { return n.toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US'); } catch (e) { return String(n); } };
  const pow2 = (e) => `2<sup>${e}</sup>`;

  /* ---------------- State ---------------- */
  const state = {
    tab: 'calc',
    lastPrefix: { 4: 24, 6: 64 },
    cur: null,
    splitPrefix: null,
    history: store.get('ipc-history', []),
    theme: store.get('ipc-theme-mode', 'auto')
  };

  const el = {
    input: $('#ipInput'), wrap: $('#inputWrap'), msg: $('#inputMsg'), badge: $('#verBadge'),
    pfxNum: $('#pfxNum'), pfxRange: $('#pfxRange'), pfxMask: $('#pfxMask'),
    calc: $('#panel-calc'), split: $('#panel-split'), cheat: $('#panel-cheat'),
    rangeStart: $('#rangeStart'), rangeEnd: $('#rangeEnd'), rangeOut: $('#rangeOut'),
    toast: $('#toast')
  };

  const ICON_COPY = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  const ICON_EMPTY = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';

  const row = (k, v, copy) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span>${copy === false ? '<span></span>' : `<button class="copy" type="button" data-copy="${esc(copy == null ? v : copy)}" title="Copy">${ICON_COPY}</button>`}</div>`;
  const empty = (msg) => `<div class="card empty">${ICON_EMPTY}<div>${msg}</div></div>`;

  /* ---------------- Rendering ---------------- */
  function bitsView(n, p, v) {
    const b = BITS[v], groupBits = v === 4 ? 8 : 16, groups = b / groupBits;
    let html = `<div class="bits ${v === 6 ? 'v6' : ''}">`;
    for (let g = 0; g < groups; g++) {
      const val = Number((n >> BigInt((groups - 1 - g) * groupBits)) & ((1n << BigInt(groupBits)) - 1n));
      const label = v === 4 ? val : val.toString(16).padStart(4, '0');
      let bits = '';
      const str = val.toString(2).padStart(groupBits, '0');
      for (let i = 0; i < groupBits; i++) {
        const idx = g * groupBits + i;
        bits += `<span class="${idx < p ? 'n' : 'h'}">${str[i]}</span>`;
      }
      html += `<div class="octet"><span class="dec">${label}</span><span class="b">${bits}</span></div>`;
    }
    return html + '</div>';
  }

  function renderCalc() {
    const c = state.cur;
    if (!c) { el.calc.innerHTML = empty(t('enterFirst')); return; }
    const { n, v, p } = c;
    const b = BITS[v], mask = maskOf(p, v), net = n & mask, last = net | (~mask & MAX[v]);
    const total = 1n << BigInt(b - p);
    const ty = typeOf(n, v);
    const cidr = `${ipstr(net, v)}/${p}`;
    let html = '';

    if (v === 4) {
      let first, lastH, usable, bc, note = '';
      if (p === 32) { first = lastH = net; usable = 1n; bc = null; note = t('singleHost'); }
      else if (p === 31) { first = net; lastH = last; usable = 2n; bc = null; note = t('p2p'); }
      else { first = net + 1n; lastH = last - 1n; usable = total - 2n; bc = last; }
      const firstOct = Number(n >> 24n);
      const cls = firstOct < 128 ? 'A' : firstOct < 192 ? 'B' : firstOct < 224 ? 'C' : firstOct < 240 ? 'D' : 'E';
      const wildcard = ~mask & MAX[4];
      const rev = v4str(n).split('.').reverse().join('.') + '.in-addr.arpa';

      html += `<div class="summary">
        <div class="card stat"><div class="k">${t('cidr')}</div><div class="v big">${cidr}</div></div>
        <div class="card stat"><div class="k">${t('usable')}</div><div class="v">${fmt(usable)}</div></div>
        <div class="card stat"><div class="k">${t('netmask')}</div><div class="v">${v4str(mask)}</div></div>
        <div class="card stat"><div class="k">${t('type')}</div><div class="v"><span class="tag ${ty.cls}">${t(ty.key)}</span>${note ? `<span class="tag">${note}</span>` : ''}</div></div>
      </div>`;
      html += `<div class="grid2">
        <div class="card"><div class="section-title">${t('secNetwork')}</div><div class="rows">
          ${row(t('address'), v4str(n))}
          ${row(t('network'), v4str(net))}
          ${row(t('broadcast'), bc == null ? `<span class="muted">${t('na')}</span>` : v4str(bc), bc == null ? false : v4str(bc))}
          ${row(t('firstHost'), v4str(first))}
          ${row(t('lastHost'), v4str(lastH))}
          ${row(t('hostRange'), `${v4str(first)} – ${v4str(lastH)}`, `${v4str(first)}-${v4str(lastH)}`)}
          ${row(t('totalAddr'), fmt(total), String(total))}
          ${row(t('usable'), fmt(usable), String(usable))}
        </div></div>
        <div class="card"><div class="section-title">${t('secFormat')}</div><div class="rows">
          ${row(t('netmask'), v4str(mask))}
          ${row(t('wildcard'), v4str(wildcard))}
          ${row(t('prefixLen'), '/' + p)}
          ${row(t('ipClass'), t('classN', { c: cls }), false)}
          ${row(t('hex'), '0x' + n.toString(16).toUpperCase().padStart(8, '0'))}
          ${row(t('decimal'), String(n))}
          ${row(t('reverse'), rev)}
          ${row(t('mapped'), '::ffff:' + v4str(n))}
          ${row(t('sixToFour'), v6str((0x2002n << 112n) | (n << 80n)) + '/48')}
        </div></div>
      </div>`;
    } else {
      const nibbles = v6full(n).replace(/:/g, '').split('').reverse().join('.') + '.ip6.arpa';
      let emb = null;
      if (inNet(n, parseV6('::ffff:0:0'), 96, 6) || inNet(n, parseV6('64:ff9b::'), 96, 6)) emb = v4str(n & MAX[4]);
      else if (inNet(n, parseV6('2002::'), 16, 6)) emb = v4str((n >> 80n) & MAX[4]);
      else if (inNet(n, parseV6('2001::'), 32, 6)) emb = v4str(~n & MAX[4]);
      const n64 = p <= 64 ? 1n << BigInt(64 - p) : null;

      html += `<div class="summary">
        <div class="card stat"><div class="k">${t('cidr')}</div><div class="v big">${cidr}</div></div>
        <div class="card stat"><div class="k">${t('totalAddr')}</div><div class="v">${pow2(b - p)}</div></div>
        <div class="card stat"><div class="k">${t('subnets64')}</div><div class="v">${n64 == null ? `<span class="muted">${t('na')}</span>` : (n64 > 1000000n ? pow2(64 - p) : fmt(n64))}</div></div>
        <div class="card stat"><div class="k">${t('type')}</div><div class="v"><span class="tag ${ty.cls}">${t(ty.key)}</span></div></div>
      </div>`;
      html += `<div class="grid2">
        <div class="card"><div class="section-title">${t('secNetwork')}</div><div class="rows">
          ${row(t('compressed'), v6str(n))}
          ${row(t('expanded'), v6full(n))}
          ${row(t('network'), v6str(net))}
          ${row(t('firstAddr'), v6str(net))}
          ${row(t('lastAddr'), v6str(last))}
          ${row(t('prefixLen'), '/' + p)}
          ${row(t('totalAddr'), fmt(total), String(total))}
        </div></div>
        <div class="card"><div class="section-title">${t('secFormat')}</div><div class="rows">
          ${row(t('netmask'), v6str(mask))}
          ${row(t('hex'), '0x' + n.toString(16).padStart(32, '0'))}
          ${row(t('decimal'), String(n))}
          ${emb ? row(t('embeddedV4'), emb) : ''}
          ${row(t('reverse'), nibbles)}
        </div></div>
      </div>`;
    }

    html += `<div class="card bits-card"><div class="section-title">${t('secBits')}</div>
      <div class="bits-legend"><span><i style="background:var(--net)"></i>${t('netBits')} (${p})</span><span><i style="background:var(--host)"></i>${t('hostBits')} (${b - p})</span></div>
      ${bitsView(n, p, v)}</div>`;
    el.calc.innerHTML = html;
  }

  function renderSplit() {
    const c = state.cur;
    if (!c) { el.split.innerHTML = empty(t('enterFirst')); return; }
    const { v, p } = c, b = BITS[v];
    if (p >= b) { el.split.innerHTML = empty(t('splitNone')); return; }
    let np = state.splitPrefix;
    if (np == null || np <= p || np > b || state.splitVer !== v) np = Math.min(b, v === 4 ? p + 2 : Math.max(p + 1, Math.min(64, p + 8)));
    state.splitPrefix = np; state.splitVer = v;

    const maxNp = Math.min(b, p + 24);
    let opts = '';
    for (let i = p + 1; i <= maxNp; i++) {
      const cnt = 1n << BigInt(i - p);
      opts += `<option value="${i}" ${i === np ? 'selected' : ''}>/${i} · ${cnt > 1000000n ? '2^' + (i - p) : fmt(cnt)} × ${t('subnet')}</option>`;
    }
    const count = 1n << BigInt(np - p);
    const size = 1n << BigInt(b - np);
    const LIMIT = 1024;
    const shown = count > BigInt(LIMIT) ? LIMIT : Number(count);
    const base = c.n & maskOf(p, v);
    let rows = '', list = [];
    for (let i = 0; i < shown; i++) {
      const net = base + BigInt(i) * size, last = net + size - 1n;
      const cidr = `${ipstr(net, v)}/${np}`;
      list.push(cidr);
      if (v === 4) {
        let f, l, u, bc;
        if (np === 32) { f = l = net; u = 1n; bc = '—'; }
        else if (np === 31) { f = net; l = last; u = 2n; bc = '—'; }
        else { f = net + 1n; l = last - 1n; u = size - 2n; bc = v4str(last); }
        rows += `<tr><td class="idx">${i + 1}</td><td><a data-load="${cidr}" title="${t('clickToLoad')}">${cidr}</a></td><td>${v4str(f)} – ${v4str(l)}</td><td>${bc}</td><td>${fmt(u)}</td></tr>`;
      } else {
        rows += `<tr><td class="idx">${i + 1}</td><td><a data-load="${cidr}" title="${t('clickToLoad')}">${cidr}</a></td><td>${v6str(net)}</td><td>${v6str(last)}</td></tr>`;
      }
    }
    const head = v === 4
      ? `<tr><th>#</th><th>${t('subnet')}</th><th>${t('colRange')}</th><th>${t('colBroadcast')}</th><th>${t('colHosts')}</th></tr>`
      : `<tr><th>#</th><th>${t('subnet')}</th><th>${t('firstAddr')}</th><th>${t('colLast')}</th></tr>`;
    state.splitList = list;
    el.split.innerHTML = `<div class="card">
      <div class="split-ctl">
        <span class="mono" style="font-weight:600">${ipstr(base, v)}/${p}</span>
        <span class="muted">${t('splitInto')}</span>
        <select class="field mono" id="splitSel">${opts}</select>
        <span class="muted" style="font-size:13px">${t('splitCount', { n: count > 1000000n ? pow2(np - p) : fmt(count), h: size > 1000000n ? pow2(b - np) : fmt(size) })}</span>
        <span style="flex:1"></span>
        <button class="btn secondary" type="button" id="splitCopy">${t('copyAll')}</button>
      </div>
      <div class="table-wrap"><table><thead>${head}</thead><tbody>${rows}</tbody></table></div>
      ${count > BigInt(LIMIT) ? `<div class="note">${t('splitTooMany', { n: fmt(LIMIT) })}</div>` : ''}
    </div>`;
  }

  function renderRange() {
    const a = el.rangeStart.value.trim(), b = el.rangeEnd.value.trim();
    if (!a || !b) { el.rangeOut.innerHTML = ''; return; }
    const x = parseAddr(a), y = parseAddr(b);
    if (!x || !y || x.v !== y.v) { el.rangeOut.innerHTML = `<div class="input-msg">${t('rangeErr')}</div>`; return; }
    if (x.n > y.n) { el.rangeOut.innerHTML = `<div class="input-msg">${t('rangeOrder')}</div>`; return; }
    const list = rangeToCidrs(x.n, y.n, x.v).map((c) => `${ipstr(c.n, x.v)}/${c.p}`);
    state.rangeList = list;
    const totalAddr = y.n - x.n + 1n;
    el.rangeOut.innerHTML = `<div class="split-ctl" style="margin:0">
        <span class="muted" style="font-size:13px">${t('rangeResult', { n: fmt(list.length), a: totalAddr > 10n ** 15n ? '≈ 2^' + (totalAddr.toString(2).length - 1) : fmt(totalAddr) })}</span>
        <span style="flex:1"></span>
        <button class="btn secondary" type="button" id="rangeCopy">${t('copyAll')}</button>
      </div>
      <div class="cidr-list">${list.map((c) => `<button class="chip" type="button" data-load="${c}" title="${t('clickToLoad')}">${c}</button>`).join('')}</div>`;
  }

  function renderCheat() {
    const curP = state.cur && state.cur.v === 4 ? state.cur.p : -1;
    let r4 = '';
    for (let p = 32; p >= 0; p--) {
      const total = 1n << BigInt(32 - p);
      const usable = p === 32 ? 1n : p === 31 ? 2n : total - 2n;
      r4 += `<tr data-prefix="4:${p}" style="cursor:pointer" ${p === curP ? 'class="hl"' : ''}><td><b>/${p}</b></td><td>${v4str(maskOf(p, 4))}</td><td>${v4str(~maskOf(p, 4) & MAX[4])}</td><td>${fmt(total)}</td><td>${fmt(usable)}</td></tr>`;
    }
    const curP6 = state.cur && state.cur.v === 6 ? state.cur.p : -1;
    let r6 = '';
    for (const p of [32, 48, 56, 60, 64, 127, 128]) {
      const n64 = p <= 64 ? fmt(1n << BigInt(64 - p)) : '—';
      r6 += `<tr data-prefix="6:${p}" style="cursor:pointer" ${p === curP6 ? 'class="hl"' : ''}><td><b>/${p}</b></td><td>${pow2(128 - p)}</td><td>${n64}</td><td style="font-family:inherit">${t('u' + p)}</td></tr>`;
    }
    el.cheat.innerHTML = `<div class="grid2">
      <div class="card"><h3>${t('cheatV4')}</h3><p class="muted">${t('cheatTip')}</p>
        <div class="table-wrap cheat-wrap"><table><thead><tr><th>${t('colPrefix')}</th><th>${t('colMask')}</th><th>${t('colWildcard')}</th><th>${t('colAddrs')}</th><th>${t('colUsable')}</th></tr></thead><tbody>${r4}</tbody></table></div>
      </div>
      <div class="card" style="align-self:start"><h3>${t('cheatV6')}</h3><p class="muted">${t('cheatTip')}</p>
        <div class="table-wrap"><table><thead><tr><th>${t('colPrefix')}</th><th>${t('colAddrs')}</th><th>${t('colNum64')}</th><th>${t('colUsage')}</th></tr></thead><tbody>${r6}</tbody></table></div>
      </div>
    </div>`;
  }

  function renderPanels() {
    if (state.tab === 'calc') renderCalc();
    else if (state.tab === 'split') renderSplit();
    else if (state.tab === 'range') renderRange();
    else if (state.tab === 'cheat') renderCheat();
  }

  /* ---------------- Input handling ---------------- */
  function syncPrefixUI() {
    const c = state.cur;
    const v = c ? c.v : 4, p = c ? c.p : state.lastPrefix[4];
    const max = BITS[v];
    el.pfxNum.max = el.pfxRange.max = max;
    el.pfxNum.value = el.pfxRange.value = p;
    el.pfxMask.textContent = v === 4 ? v4str(maskOf(p, 4)) : v6str(maskOf(p, 6));
    el.badge.textContent = c ? 'IPv' + v : 'IP';
    el.badge.classList.toggle('v6', !!c && v === 6);
  }

  let histTimer = null;
  function update(fromUser) {
    const r = parseInput(el.input.value, state.lastPrefix);
    el.wrap.classList.toggle('invalid', !!r.error);
    el.msg.textContent = r.error || '';
    if (r.error) return;
    if (r.empty) {
      state.cur = null;
      history.replaceState(null, '', location.pathname);
    } else {
      state.cur = { n: r.n, v: r.v, p: r.p };
      state.lastPrefix[r.v] = r.p;
      const q = el.input.value.trim();
      history.replaceState(null, '', '#' + encodeURIComponent(q).replace(/%2F/g, '/').replace(/%3A/g, ':'));
      if (fromUser) { clearTimeout(histTimer); histTimer = setTimeout(() => pushHistory(q), 1500); }
    }
    syncPrefixUI();
    renderPanels();
  }

  function setPrefix(p) {
    const c = state.cur;
    const v = c ? c.v : 4;
    p = Math.max(0, Math.min(BITS[v], p | 0));
    if (!c) {
      state.lastPrefix[4] = p;
      syncPrefixUI();
      return;
    }
    const addr = el.input.value.trim().split(/[\s/]/)[0];
    el.input.value = `${addr}/${p}`;
    update(true);
  }

  function load(q) {
    el.input.value = q;
    update(false);
    pushHistory(q);
  }

  function pushHistory(q) {
    if (!q || !state.cur) return;
    state.history = [q].concat(state.history.filter((x) => x !== q)).slice(0, 8);
    store.set('ipc-history', state.history);
    renderHistory();
  }

  function renderHistory() {
    const h = state.history;
    $('#historyRow').hidden = !h.length;
    $('#history').innerHTML = h.map((q) => `<button class="chip" type="button" data-load="${esc(q)}">${esc(q)}</button>`).join('');
  }

  const EXAMPLES = ['192.168.1.10/24', '10.0.0.1 255.255.0.0', '172.16.5.4/20', '100.64.10.1/10', '2001:db8:abcd::1/48', 'fe80::1ff:fe23:4567:890a/64', '::ffff:8.8.8.8/128'];
  $('#examples').innerHTML = EXAMPLES.map((q) => `<button class="chip" type="button" data-load="${q}">${q}</button>`).join('');

  /* ---------------- Clipboard / toast ---------------- */
  let toastTimer;
  function toast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), 1600);
  }
  function copy(text, msg) {
    const done = () => toast(msg || t('copied'));
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { }
    ta.remove();
  }

  /* ---------------- Theme & language ---------------- */
  const mq = matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    const m = state.theme;
    const dark = m === 'dark' || (m === 'auto' && mq.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.mode = m;
    $('#themeLabel').textContent = t(m === 'auto' ? 'themeAuto' : m === 'light' ? 'themeLight' : 'themeDark');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#0b0d14' : '#f5f6fb';
    try { localStorage.setItem('ipc-theme', m); } catch (e) { }
  }
  (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(() => { if (state.theme === 'auto') applyTheme(); });

  function applyLang() {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = lang === 'zh' ? 'IP 子网计算器 · IPv4 / IPv6' : 'IP Subnet Calculator · IPv4 / IPv6';
    document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
    document.querySelectorAll('[data-i18n-title]').forEach((e) => { e.title = t(e.dataset.i18nTitle); e.setAttribute('aria-label', e.title); });
    document.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.placeholder = t(e.dataset.i18nPh); });
    $('#langLabel').textContent = lang === 'zh' ? 'EN' : '中文';
    applyTheme();
    if (el.msg.textContent) update(false); else renderPanels();
  }

  /* ---------------- Events ---------------- */
  el.input.addEventListener('input', () => update(true));
  el.input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (state.cur) setPrefix(state.cur.p + (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 8 : 1));
    } else if (e.key === 'Enter') {
      clearTimeout(histTimer); pushHistory(el.input.value.trim());
    } else if (e.key === 'Escape') {
      el.input.value = ''; update(false);
    }
  });
  el.pfxRange.addEventListener('input', () => setPrefix(+el.pfxRange.value));
  el.pfxNum.addEventListener('input', () => { if (el.pfxNum.value !== '') setPrefix(+el.pfxNum.value); });
  $('#pfxDown').addEventListener('click', () => setPrefix(+el.pfxNum.value - 1));
  $('#pfxUp').addEventListener('click', () => setPrefix(+el.pfxNum.value + 1));
  $('#clearBtn').addEventListener('click', () => { el.input.value = ''; update(false); el.input.focus(); });
  $('#shareBtn').addEventListener('click', () => { pushHistory(el.input.value.trim()); copy(location.href, t('linkCopied')); });
  $('#clearHistory').addEventListener('click', () => { state.history = []; store.set('ipc-history', []); renderHistory(); });

  $('#langBtn').addEventListener('click', () => { lang = lang === 'zh' ? 'en' : 'zh'; store.set('ipc-lang', lang); applyLang(); });
  $('#themeBtn').addEventListener('click', () => {
    state.theme = { auto: 'light', light: 'dark', dark: 'auto' }[state.theme] || 'auto';
    store.set('ipc-theme-mode', state.theme);
    applyTheme();
  });

  document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    state.tab = b.dataset.tab;
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b));
    document.querySelectorAll('.panel').forEach((x) => x.classList.toggle('active', x.id === 'panel-' + state.tab));
    renderPanels();
  }));

  el.rangeStart.addEventListener('input', renderRange);
  el.rangeEnd.addEventListener('input', renderRange);

  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-copy]');
    if (c) { copy(c.dataset.copy); return; }
    const l = e.target.closest('[data-load]');
    if (l) {
      load(l.dataset.load);
      if (l.closest('.panel')) document.querySelector('.tab[data-tab="calc"]').click();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const pr = e.target.closest('[data-prefix]');
    if (pr) {
      const [v, p] = pr.dataset.prefix.split(':').map(Number);
      if (state.cur && state.cur.v === v) { setPrefix(p); document.querySelector('.tab[data-tab="calc"]').click(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else load(v === 4 ? `192.168.0.0/${p}` : `2001:db8::/${p}`), document.querySelector('.tab[data-tab="calc"]').click();
      return;
    }
    if (e.target.id === 'splitCopy') copy((state.splitList || []).join('\n'));
    if (e.target.id === 'rangeCopy') copy((state.rangeList || []).join('\n'));
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'splitSel') { state.splitPrefix = +e.target.value; renderSplit(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); el.input.focus(); el.input.select();
    }
  });
  window.addEventListener('hashchange', () => {
    const q = decodeURIComponent(location.hash.slice(1));
    if (q && q !== el.input.value.trim()) { el.input.value = q; update(false); }
  });

  /* ---------------- Init ---------------- */
  const initQ = decodeURIComponent(location.hash.slice(1) || '');
  el.input.value = initQ || '192.168.1.10/24';
  renderHistory();
  applyLang();
  update(false);
})();
