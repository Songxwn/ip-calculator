(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, fmt, store, BITS, MAX, parseV4, parseV6, v4str, v6str, v6full, ipstr, maskOf, prefixOfMask, inNet, parseAddr, typeOf } = IPC;

  IPC.addI18n({
    zh: {
      calcTitle: 'IP 子网计算器', calcDesc: 'IPv4 / IPv6 子网、CIDR、掩码、范围计算，全部在浏览器本地完成',
      inputLabel: '输入 IP 地址 / CIDR（支持 IPv4、IPv6、掩码、反掩码）',
      inputPh: '192.168.1.10/24 · 10.0.0.1 255.255.0.0 · 2001:db8::1/64',
      clear: '清空', share: '复制分享链接',
      examples: '示例', history: '最近', clearHistory: '清除',
      tabCalc: '计算结果', tabSplit: '子网划分', tabRange: '范围 → CIDR', tabCheat: '速查表',
      rangeTitle: 'IP 范围转换为 CIDR', rangeDesc: '输入起始与结束地址，计算精确覆盖该范围的最少 CIDR 块。',
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
      netBits: '网络位', hostBits: '主机位',
      p2p: '点对点链路 (RFC 3021)', singleHost: '单主机',
      splitInto: '划分为', splitCount: '共 {n} 个子网，每个含 {h} 个地址',
      subnet: '子网', colRange: '可用范围', colBroadcast: '广播地址', colLast: '结束地址', colHosts: '可用主机',
      copyAll: '复制全部', splitTooMany: '仅显示前 {n} 个子网', splitNone: '已是最小子网，无法继续划分',
      enterFirst: '请先在上方输入一个有效的 IP 地址',
      rangeResult: '{n} 个 CIDR 块 · 共 {a} 个地址', rangeErr: '请输入同一协议版本的有效起止地址', rangeOrder: '起始地址不能大于结束地址',
      cheatV4: 'IPv4 CIDR 速查表', cheatV6: 'IPv6 常用前缀', cheatTip: '点击行可将该前缀应用到当前地址',
      colPrefix: '前缀', colMask: '子网掩码', colWildcard: '通配符', colAddrs: '地址数', colUsable: '可用主机', colUsage: '典型用途', colNum64: '/64 数量',
      u32: 'RIR 向 ISP 分配', u48: '站点 / 企业', u56: '家庭宽带', u60: '小型网络', u64: '单个局域网 (SLAAC)', u127: '点对点链路', u128: '单个主机',
      clickToLoad: '点击载入', lookupThis: '查询此 IP 归属'
    },
    en: {
      calcTitle: 'IP Subnet Calculator', calcDesc: 'IPv4 / IPv6 subnets, CIDR, masks and ranges, computed locally in your browser',
      inputLabel: 'Enter an IP address / CIDR (IPv4, IPv6, netmask or wildcard)',
      inputPh: '192.168.1.10/24 · 10.0.0.1 255.255.0.0 · 2001:db8::1/64',
      clear: 'Clear', share: 'Copy share link',
      examples: 'Examples', history: 'Recent', clearHistory: 'Clear',
      tabCalc: 'Result', tabSplit: 'Subnetting', tabRange: 'Range → CIDR', tabCheat: 'Cheat sheet',
      rangeTitle: 'IP range to CIDR', rangeDesc: 'Enter a start and end address to get the minimal set of CIDR blocks covering exactly that range.',
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
      netBits: 'Network bits', hostBits: 'Host bits',
      p2p: 'Point-to-point (RFC 3021)', singleHost: 'Single host',
      splitInto: 'Split into', splitCount: '{n} subnets, {h} addresses each',
      subnet: 'Subnet', colRange: 'Usable range', colBroadcast: 'Broadcast', colLast: 'Last address', colHosts: 'Usable',
      copyAll: 'Copy all', splitTooMany: 'Showing the first {n} subnets only', splitNone: 'Already the smallest subnet, cannot split further',
      enterFirst: 'Enter a valid IP address above first',
      rangeResult: '{n} CIDR blocks · {a} addresses', rangeErr: 'Enter valid start and end addresses of the same IP version', rangeOrder: 'Start address must not be greater than end address',
      cheatV4: 'IPv4 CIDR cheat sheet', cheatV6: 'Common IPv6 prefixes', cheatTip: 'Click a row to apply that prefix to the current address',
      colPrefix: 'Prefix', colMask: 'Netmask', colWildcard: 'Wildcard', colAddrs: 'Addresses', colUsable: 'Usable', colUsage: 'Typical use', colNum64: '# of /64',
      u32: 'RIR → ISP allocation', u48: 'Site / enterprise', u56: 'Home broadband', u60: 'Small network', u64: 'Single LAN (SLAAC)', u127: 'Point-to-point link', u128: 'Single host',
      clickToLoad: 'Click to load', lookupThis: 'Look up this IP'
    }
  });

  function parseInput(raw, fallbackPrefix) {
    const s = raw.trim().replace(/\s+/g, ' ');
    if (!s) return { empty: true };
    const m = /^([^\s/]+)(?:\s*[/ ]\s*(\S+))?$/.exec(s);
    if (!m) return { error: t('errInvalid') };
    const a = parseAddr(m[1]);
    if (!a) return { error: t('errInvalid') };
    const max = BITS[a.v];
    let p;
    if (!m[2]) {
      p = fallbackPrefix[a.v];
    } else if (/^\d{1,3}$/.test(m[2])) {
      p = Number(m[2]);
      if (p > max) return { error: t('errPrefix', { max }) };
    } else if (a.v === 4) {
      const mk = parseV4(m[2]);
      if (mk == null) return { error: t('errMask') };
      p = prefixOfMask(mk, 4);
      if (p < 0) p = prefixOfMask(~mk & MAX[4], 4);
      if (p < 0) return { error: t('errMask') };
    } else {
      return { error: t('errPrefix', { max }) };
    }
    return { n: a.n, v: a.v, p };
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

  const pow2 = (e) => `2<sup>${e}</sup>`;

  const state = {
    tab: 'calc',
    lastPrefix: { 4: 24, 6: 64 },
    cur: null,
    splitPrefix: null,
    history: store.get('ipc-history', [])
  };
  let el;

  const ICON_EMPTY = '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
  const row = (k, v, copy) => `<div class="row"><span class="k">${k}</span><span class="v">${v}</span>${copy === false ? '<span></span>' : `<button class="copy" type="button" data-copy="${esc(copy == null ? v : copy)}" title="Copy">${IPC.ICON_COPY}</button>`}</div>`;
  const empty = (msg) => `<div class="card empty">${ICON_EMPTY}<div>${msg}</div></div>`;

  function bitsView(n, p, v) {
    const b = BITS[v], groupBits = v === 4 ? 8 : 16, groups = b / groupBits;
    let html = `<div class="bits ${v === 6 ? 'v6' : ''}">`;
    for (let g = 0; g < groups; g++) {
      const val = Number((n >> BigInt((groups - 1 - g) * groupBits)) & ((1n << BigInt(groupBits)) - 1n));
      const label = v === 4 ? val : val.toString(16).padStart(4, '0');
      const str = val.toString(2).padStart(groupBits, '0');
      let bits = '';
      for (let i = 0; i < groupBits; i++) bits += `<span class="${g * groupBits + i < p ? 'n' : 'h'}">${str[i]}</span>`;
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
    const lookup = ty.isPublic ? `<a class="tag link" href="#/query?ip=${encodeURIComponent(ipstr(n, v))}">${t('lookupThis')} →</a>` : '';
    let html = '';

    if (v === 4) {
      let first, lastH, usable, bc, note = '';
      if (p === 32) { first = lastH = net; usable = 1n; bc = null; note = t('singleHost'); }
      else if (p === 31) { first = net; lastH = last; usable = 2n; bc = null; note = t('p2p'); }
      else { first = net + 1n; lastH = last - 1n; usable = total - 2n; bc = last; }
      const firstOct = Number(n >> 24n);
      const cls = firstOct < 128 ? 'A' : firstOct < 192 ? 'B' : firstOct < 224 ? 'C' : firstOct < 240 ? 'D' : 'E';
      const rev = v4str(n).split('.').reverse().join('.') + '.in-addr.arpa';

      html += `<div class="summary">
        <div class="card stat"><div class="k">${t('cidr')}</div><div class="v big">${cidr}</div></div>
        <div class="card stat"><div class="k">${t('usable')}</div><div class="v">${fmt(usable)}</div></div>
        <div class="card stat"><div class="k">${t('netmask')}</div><div class="v">${v4str(mask)}</div></div>
        <div class="card stat"><div class="k">${t('type')}</div><div class="v"><span class="tag ${ty.cls}">${t(ty.key)}</span>${note ? `<span class="tag">${note}</span>` : ''}${lookup}</div></div>
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
          ${row(t('wildcard'), v4str(~mask & MAX[4]))}
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
        <div class="card stat"><div class="k">${t('type')}</div><div class="v"><span class="tag ${ty.cls}">${t(ty.key)}</span>${lookup}</div></div>
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
    let rows = '';
    const list = [];
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

  function syncPrefixUI() {
    const c = state.cur;
    const v = c ? c.v : 4, p = c ? c.p : state.lastPrefix[4];
    el.pfxNum.max = el.pfxRange.max = BITS[v];
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
      if (IPC.current() === 'calc') IPC.setHash('calc');
    } else {
      state.cur = { n: r.n, v: r.v, p: r.p };
      state.lastPrefix[r.v] = r.p;
      const q = el.input.value.trim();
      if (IPC.current() === 'calc') IPC.setHash('calc', { q });
      if (fromUser) { clearTimeout(histTimer); histTimer = setTimeout(() => pushHistory(q), 1500); }
    }
    syncPrefixUI();
    renderPanels();
  }

  function setPrefix(p) {
    const c = state.cur;
    const v = c ? c.v : 4;
    p = Math.max(0, Math.min(BITS[v], p | 0));
    if (!c) { state.lastPrefix[4] = p; syncPrefixUI(); return; }
    el.input.value = `${el.input.value.trim().split(/[\s/]/)[0]}/${p}`;
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

  function selectTab(name) {
    state.tab = name;
    document.querySelectorAll('#page-calc .tab').forEach((x) => x.classList.toggle('active', x.dataset.tab === name));
    document.querySelectorAll('#page-calc .panel').forEach((x) => x.classList.toggle('active', x.id === 'panel-' + name));
    renderPanels();
  }

  const EXAMPLES = ['192.168.1.10/24', '10.0.0.1 255.255.0.0', '172.16.5.4/20', '100.64.10.1/10', '2001:db8:abcd::1/48', 'fe80::1ff:fe23:4567:890a/64', '::ffff:8.8.8.8/128'];

  function init() {
    el = {
      input: $('#ipInput'), wrap: $('#inputWrap'), msg: $('#inputMsg'), badge: $('#verBadge'),
      pfxNum: $('#pfxNum'), pfxRange: $('#pfxRange'), pfxMask: $('#pfxMask'),
      calc: $('#panel-calc'), split: $('#panel-split'), cheat: $('#panel-cheat'),
      rangeStart: $('#rangeStart'), rangeEnd: $('#rangeEnd'), rangeOut: $('#rangeOut')
    };
    $('#examples').innerHTML = EXAMPLES.map((q) => `<button class="chip" type="button" data-load="${q}">${q}</button>`).join('');
    renderHistory();

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
    $('#shareBtn').addEventListener('click', () => { pushHistory(el.input.value.trim()); IPC.copy(location.href, t('linkCopied')); });
    $('#clearHistory').addEventListener('click', () => { state.history = []; store.set('ipc-history', []); renderHistory(); });
    document.querySelectorAll('#page-calc .tab').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab)));
    el.rangeStart.addEventListener('input', renderRange);
    el.rangeEnd.addEventListener('input', renderRange);

    const page = $('#page-calc');
    page.addEventListener('click', (e) => {
      const l = e.target.closest('[data-load]');
      if (l) {
        load(l.dataset.load);
        if (l.closest('.panel')) selectTab('calc');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const pr = e.target.closest('[data-prefix]');
      if (pr) {
        const [v, p] = pr.dataset.prefix.split(':').map(Number);
        if (state.cur && state.cur.v === v) setPrefix(p);
        else load(v === 4 ? `192.168.0.0/${p}` : `2001:db8::/${p}`);
        selectTab('calc');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (e.target.id === 'splitCopy') IPC.copy((state.splitList || []).join('\n'));
      if (e.target.id === 'rangeCopy') IPC.copy((state.rangeList || []).join('\n'));
    });
    page.addEventListener('change', (e) => {
      if (e.target.id === 'splitSel') { state.splitPrefix = +e.target.value; renderSplit(); }
    });
    document.addEventListener('keydown', (e) => {
      if (IPC.current() !== 'calc') return;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); el.input.focus(); el.input.select();
      }
    });
    el.input.value = '192.168.1.10/24';
  }

  IPC.register('calc', {
    init,
    enter(params) {
      const q = params.get('q');
      if (q && q !== el.input.value.trim()) el.input.value = q;
      update(false);
    },
    lang() {
      if (el.msg.textContent) update(false); else renderPanels();
    }
  });
})();
