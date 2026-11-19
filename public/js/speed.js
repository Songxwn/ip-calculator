(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, net } = IPC;
  const { latClass, errText } = net;

  IPC.addI18n({
    zh: {
      nav_speed: '测速', speedTitle: '网络测速',
      speedDesc: '手动选择国内高校镜像站或国外开放测速节点，测试到该节点的延迟、抖动、下载与上传速度。测速会消耗流量，移动网络请注意',
      spCn: '国内高校', spIntl: '国外开放测速点', spPingAll: '测全部延迟', spStart: '开始测速', spStop: '停止',
      spPing: '延迟', spJitter: '抖动', spDown: '下载', spUp: '上传', spThreads: '线程', spDur: '时长',
      spIdle: '选择一个节点后点击「开始测速」', spPhasePing: '正在测延迟…', spPhaseDown: '正在测下载…', spPhaseUp: '正在测上传…', spDone: '测速完成',
      spNoUp: '该节点不支持上传测试', spExact: '精确', spEst: '估算', spExactTip: '节点允许跨域读取，逐字节实时统计',
      spEstTip: '镜像站不允许跨域读取，按固定大小文件的完整下载耗时估算，无实时曲线',
      spBadResp: '节点拒绝了请求（可能被防盗链或限流）', spHist: '测速记录', spClear: '清除',
      colNode: '节点', colTime: '时间', spNote: '国内高校节点为各校开源镜像站，部分学校会对校外流量限速；国外节点来自 LibreSpeed 公共服务器列表与 Cloudflare。结果受代理、浏览器与设备性能影响，仅供参考。'
    },
    en: {
      nav_speed: 'Speed Test', speedTitle: 'Speed Test',
      speedDesc: 'Pick a Chinese university mirror or an open speed test server abroad, then measure latency, jitter, download and upload. Tests use data, so watch out on mobile plans',
      spCn: 'China universities', spIntl: 'Open servers abroad', spPingAll: 'Ping all', spStart: 'Start', spStop: 'Stop',
      spPing: 'Latency', spJitter: 'Jitter', spDown: 'Download', spUp: 'Upload', spThreads: 'Threads', spDur: 'Duration',
      spIdle: 'Choose a server, then press Start', spPhasePing: 'Measuring latency…', spPhaseDown: 'Testing download…', spPhaseUp: 'Testing upload…', spDone: 'Done',
      spNoUp: 'This server does not support upload tests', spExact: 'Exact', spEst: 'Estimate', spExactTip: 'Server allows cross-origin reads, so bytes are counted live',
      spEstTip: 'Mirror does not allow cross-origin reads; speed is estimated from the time to fully download fixed-size files, with no live curve',
      spBadResp: 'The server rejected the request (hotlink protection or rate limit)', spHist: 'History', spClear: 'Clear',
      colNode: 'Server', colTime: 'Time', spNote: 'China nodes are university open-source mirrors, and some throttle off-campus traffic. Servers abroad come from the LibreSpeed public list and Cloudflare. Results depend on proxies, browser and device, so treat them as a guide.'
    }
  });

  const F_SMALL = { path: '/ubuntu/dists/noble/main/binary-amd64/Packages.gz', size: 1808488 };
  const F_BIG = { path: '/ubuntu/dists/noble/universe/binary-amd64/Packages.gz', size: 19315644 };
  const F_PING = '/ubuntu/dists/noble/Release.gpg';

  const m = (id, host, zh, en, city, cityEn, cors) => ({ id, group: 'cn', kind: cors ? 'mirror-cors' : 'mirror', host, name: [zh, en], loc: [city, cityEn], cc: 'CN' });
  const ls = (id, base, name, city, cityEn, cc) => ({ id, group: 'intl', kind: 'ls', base, name: [name, name], loc: [city, cityEn], cc });
  const SERVERS = [
    m('sdu', 'mirrors.sdu.edu.cn', '山东大学', 'Shandong Univ.', '济南', 'Jinan', true),
    m('ustc', 'mirrors.ustc.edu.cn', '中国科学技术大学', 'USTC', '合肥', 'Hefei'),
    m('hust', 'mirrors.hust.edu.cn', '华中科技大学', 'HUST', '武汉', 'Wuhan'),
    m('xjtu', 'mirrors.xjtu.edu.cn', '西安交通大学', "Xi'an Jiaotong Univ.", '西安', "Xi'an"),
    m('hit', 'mirrors.hit.edu.cn', '哈尔滨工业大学', 'Harbin Inst. of Tech.', '哈尔滨', 'Harbin'),
    m('shtech', 'mirrors.shanghaitech.edu.cn', '上海科技大学', 'ShanghaiTech', '上海', 'Shanghai'),
    m('sjtu', 'ftp.sjtu.edu.cn', '上海交通大学', 'SJTU', '上海', 'Shanghai'),
    m('qlu', 'mirrors.qlu.edu.cn', '齐鲁工业大学', 'Qilu Univ. of Tech.', '济南', 'Jinan'),
    m('iscas', 'mirror.iscas.ac.cn', '中科院软件所', 'ISCAS', '北京', 'Beijing'),
    { id: 'cf', group: 'intl', kind: 'cf', name: ['Cloudflare', 'Cloudflare'], loc: ['最近节点 (Anycast)', 'Nearest (Anycast)'], cc: '' },
    ls('a573', 'https://librespeed.a573.net/backend/', 'A573', '东京', 'Tokyo', 'JP'),
    ls('la-cv', 'https://la.speedtest.clouvider.net/backend/', 'Clouvider', '洛杉矶', 'Los Angeles', 'US'),
    ls('la-st', 'https://laxspeed.sharktech.net/backend/', 'Sharktech', '洛杉矶', 'Los Angeles', 'US'),
    ls('las-st', 'https://lasspeed.sharktech.net/backend/', 'Sharktech', '拉斯维加斯', 'Las Vegas', 'US'),
    ls('den-st', 'https://denspeed.sharktech.net/backend/', 'Sharktech', '丹佛', 'Denver', 'US'),
    ls('chi-st', 'https://chispeed.sharktech.net/backend/', 'Sharktech', '芝加哥', 'Chicago', 'US'),
    ls('nyc-cv', 'https://nyc.speedtest.clouvider.net/backend/', 'Clouvider', '纽约', 'New York', 'US'),
    ls('atl-cv', 'https://atl.speedtest.clouvider.net/backend/', 'Clouvider', '亚特兰大', 'Atlanta', 'US'),
    ls('lon-cv', 'https://lon.speedtest.clouvider.net/backend/', 'Clouvider', '伦敦', 'London', 'GB'),
    ls('ams-cv', 'https://ams.speedtest.clouvider.net/backend/', 'Clouvider', '阿姆斯特丹', 'Amsterdam', 'NL'),
    ls('ams-st', 'https://amsspeed.sharktech.net/backend/', 'Sharktech', '阿姆斯特丹', 'Amsterdam', 'NL'),
    ls('fra-cv', 'https://fra.speedtest.clouvider.net/backend/', 'Clouvider', '法兰克福', 'Frankfurt', 'DE'),
    ls('fra-fs', 'https://speed.fs-it.systems/backend/', 'FS IT-Systeme', '法兰克福', 'Frankfurt', 'DE'),
    ls('prg', 'https://librespeed.turris.cz/backend/', 'Turris', '布拉格', 'Prague', 'CZ'),
    ls('rom', 'https://st-be-rm2.infra.garr.it/', 'GARR', '罗马', 'Rome', 'IT'),
    ls('poz', 'https://speedtest.kamilszczepanski.com/', 'INEA', '波兹南', 'Poznań', 'PL'),
    ls('beg', 'https://speedtest1.sox.rs/librespeed/backend/', 'SOX', '贝尔格莱德', 'Belgrade', 'RS')
  ];
  const exact = (s) => s.kind !== 'mirror';
  const canUp = (s) => s.kind === 'cf' || s.kind === 'ls';
  const L = (a) => a[IPC.lang === 'zh' ? 0 : 1];

  const bust = () => '_=' + net.rand(8);
  function pingUrl(s) {
    if (s.kind === 'cf') return 'https://speed.cloudflare.com/__down?bytes=0&' + bust();
    if (s.kind === 'ls') return s.base + 'empty.php?cors=true&' + bust();
    return 'https://' + s.host + F_PING + '?' + bust();
  }
  function dlUrl(s) {
    if (s.kind === 'cf') return 'https://speed.cloudflare.com/__down?bytes=100000000&' + bust();
    if (s.kind === 'ls') return s.base + 'garbage.php?cors=true&ckSize=100&' + bust();
    return 'https://' + s.host + F_BIG.path + '?' + bust();
  }
  const upUrl = (s) => s.kind === 'cf' ? 'https://speed.cloudflare.com/__up?' + bust() : s.base + 'empty.php?cors=true&' + bust();

  async function pingOnce(s, signal) {
    const t0 = performance.now();
    const r = await fetch(pingUrl(s), { cache: 'no-store', mode: s.kind === 'mirror' ? 'no-cors' : 'cors', credentials: 'omit', signal: signal || AbortSignal.timeout(5000) });
    if (r.type !== 'opaque') await r.arrayBuffer();
    return performance.now() - t0;
  }
  async function latency(s, n, signal, onStep) {
    await pingOnce(s, signal);
    const xs = [];
    for (let i = 0; i < n; i++) {
      if (signal && signal.aborted) break;
      try { xs.push(await pingOnce(s, signal)); } catch (e) { if (signal && signal.aborted) break; }
      if (onStep) onStep(xs);
    }
    if (!xs.length) throw new Error('timeout');
    const sorted = xs.slice().sort((a, b) => a - b);
    let jit = 0;
    for (let i = 1; i < xs.length; i++) jit += Math.abs(xs[i] - xs[i - 1]);
    return { min: Math.round(sorted[0]), med: Math.round(sorted[Math.floor(sorted.length / 2)]), jitter: xs.length > 1 ? Math.round(jit / (xs.length - 1)) : 0 };
  }

  const mbps = (bytes, ms) => ms > 0 ? bytes * 8 / ms / 1000 : 0;

  async function dlStream(s, threads, dur, signal, onRate) {
    let bytes = 0, base = null;
    const t0 = performance.now(), warm = Math.min(1500, dur * 0.2);
    const end = t0 + dur;
    const ctl = new AbortController();
    const stop = () => ctl.abort();
    signal.addEventListener('abort', stop);
    const tick = setInterval(() => {
      const now = performance.now();
      if (!base && now - t0 >= warm) base = { b: bytes, t: now };
      onRate(base ? mbps(bytes - base.b, now - base.t) : mbps(bytes, now - t0), (now - t0) / dur);
      if (now >= end) stop();
    }, 200);
    const worker = async () => {
      while (!ctl.signal.aborted && performance.now() < end) {
        const r = await fetch(dlUrl(s), { cache: 'no-store', credentials: 'omit', signal: ctl.signal });
        if (!r.ok) throw new Error(t('spBadResp'));
        const rd = r.body.getReader();
        for (;;) { const x = await rd.read(); if (x.done) break; bytes += x.value.length; }
      }
    };
    const res = await Promise.allSettled(Array.from({ length: threads }, worker));
    clearInterval(tick); signal.removeEventListener('abort', stop);
    const now = performance.now();
    if (!bytes) { const e = res.find((x) => x.status === 'rejected'); throw e && e.reason && e.reason.name !== 'AbortError' ? e.reason : new Error(t('spBadResp')); }
    return base && now - base.t > 300 ? mbps(bytes - base.b, now - base.t) : mbps(bytes, now - t0);
  }

  let cacheP = null;
  const cache = () => cacheP || (cacheP = caches.open('ipc-speed'));
  async function fetchOpaque(s, file, signal) {
    const url = 'https://' + s.host + file.path + '?' + bust();
    const c = await cache();
    const t0 = performance.now();
    const r = await fetch(url, { mode: 'no-cors', cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer', signal });
    await c.put(url, r);
    const ms = performance.now() - t0;
    c.delete(url);
    if (ms < 15 + file.size / 1.25e6) throw new Error(t('spBadResp'));
    return ms;
  }
  async function dlOpaque(s, threads, dur, signal, onRate) {
    if (!window.caches) throw new Error('Cache API unavailable');
    const first = await fetchOpaque(s, F_SMALL, signal);
    let est = mbps(F_SMALL.size, first);
    onRate(est, 0.1);
    const file = est > 40 ? F_BIG : F_SMALL;
    let bytes = 0, last = 0;
    const t0 = performance.now(), end = t0 + dur;
    const worker = async () => {
      while (!signal.aborted && performance.now() < end) {
        await fetchOpaque(s, file, signal);
        bytes += file.size; last = performance.now();
        onRate(mbps(bytes, last - t0), Math.min(1, (last - t0) / dur));
      }
    };
    const res = await Promise.allSettled(Array.from({ length: threads }, worker));
    if (!bytes) { const e = res.find((x) => x.status === 'rejected'); throw e ? e.reason : new Error(t('spBadResp')); }
    return mbps(bytes, last - t0);
  }

  async function upload(s, threads, dur, signal, onRate) {
    let done = 0, base = null;
    const t0 = performance.now(), warm = Math.min(1500, dur * 0.2), end = t0 + dur;
    const live = new Set();
    const blob = new Blob([new Uint8Array(8 * 1024 * 1024)]);
    const total = () => { let n = done; live.forEach((x) => { n += x.loaded; }); return n; };
    const killAll = () => live.forEach((x) => x.xhr.abort());
    signal.addEventListener('abort', killAll);
    const tick = setInterval(() => {
      const now = performance.now(), b = total();
      if (!base && now - t0 >= warm) base = { b, t: now };
      onRate(base ? mbps(b - base.b, now - base.t) : mbps(b, now - t0), (now - t0) / dur);
      if (now >= end) killAll();
    }, 200);
    const once = () => new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const slot = { xhr, loaded: 0 };
      live.add(slot);
      const fin = (ok) => { live.delete(slot); if (ok) done += blob.size; else done += slot.loaded; };
      xhr.upload.onprogress = (e) => { slot.loaded = e.loaded; };
      xhr.onload = () => { fin(xhr.status < 400); xhr.status < 400 ? resolve() : reject(new Error('HTTP ' + xhr.status)); };
      xhr.onerror = () => { fin(false); reject(new Error('Failed to fetch')); };
      xhr.onabort = () => { fin(false); resolve(); };
      xhr.open('POST', upUrl(s));
      xhr.send(blob);
    });
    const worker = async () => { while (!signal.aborted && performance.now() < end) await once(); };
    const res = await Promise.allSettled(Array.from({ length: threads }, worker));
    clearInterval(tick); signal.removeEventListener('abort', killAll);
    const now = performance.now(), b = total();
    if (!b) { const e = res.find((x) => x.status === 'rejected'); throw e ? e.reason : new Error('upload failed'); }
    return base && now - base.t > 300 ? mbps(b - base.b, now - base.t) : mbps(b, now - t0);
  }

  /* ---------------- UI ---------------- */
  let el, ctl = null;
  const pings = {};
  const st = { sel: IPC.store.get('ipc-speed-sel', 'sdu'), threads: IPC.store.get('ipc-speed-threads', 4), dur: IPC.store.get('ipc-speed-dur', 10), phase: 'idle', cur: 0, prog: 0, ping: null, down: null, up: null, err: '' };
  let hist = IPC.store.get('ipc-speed-hist', []);
  if (!Array.isArray(hist)) hist = [];

  const fmtSpeed = (v) => v == null ? '—' : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2);
  const server = () => SERVERS.find((s) => s.id === st.sel) || SERVERS[0];

  function renderList() {
    const card = (s) => {
      const p = pings[s.id];
      const lat = p === undefined ? '' : p === null ? '<span class="lat fail">—</span>' : p === 'wait' ? '<span class="skel" style="min-width:2rem"></span>' : `<span class="lat ${latClass(p)}">${p} ms</span>`;
      return `<button type="button" class="sp-node ${s.id === st.sel ? 'on' : ''}" data-id="${s.id}" ${ctl ? 'disabled' : ''}>
        <span class="sp-node-name">${s.cc ? net.ccBadge(s.cc) : ''}${esc(L(s.name))}</span>
        <span class="sp-node-loc muted">${esc(L(s.loc))}</span>
        <span class="sp-node-foot"><span class="tag ${exact(s) ? 'ok' : ''}" title="${t(exact(s) ? 'spExactTip' : 'spEstTip')}">${t(exact(s) ? 'spExact' : 'spEst')}</span>${lat}</span></button>`;
    };
    el.cn.innerHTML = SERVERS.filter((s) => s.group === 'cn').map(card).join('');
    el.intl.innerHTML = SERVERS.filter((s) => s.group === 'intl').map(card).join('');
  }

  const GAUGE_LEN = 251.3;
  function renderGauge() {
    const s = server();
    const v = st.phase === 'down' || st.phase === 'up' ? st.cur : st.phase === 'done' ? st.down : null;
    const frac = v ? Math.min(1, Math.log10(1 + v) / Math.log10(1001)) : 0;
    el.arc.style.strokeDashoffset = GAUGE_LEN * (1 - frac);
    el.arc.setAttribute('class', 'g-val ' + (st.phase === 'up' ? 'up' : ''));
    el.val.textContent = v == null ? '—' : fmtSpeed(v);
    el.phase.textContent = st.err ? st.err : t({ idle: 'spIdle', ping: 'spPhasePing', down: 'spPhaseDown', up: 'spPhaseUp', done: 'spDone' }[st.phase]);
    el.phase.className = 'sp-phase ' + (st.err ? 'err' : '');
    el.node.innerHTML = `${s.cc ? net.ccBadge(s.cc) : ''}${esc(L(s.name))} · ${esc(L(s.loc))}`;
    el.bar.style.width = (st.phase === 'idle' || st.phase === 'done' ? 0 : Math.round(st.prog * 100)) + '%';
    el.mPing.innerHTML = st.ping ? `${st.ping.med}<small> ms</small>` : '—';
    el.mJit.innerHTML = st.ping ? `${st.ping.jitter}<small> ms</small>` : '—';
    el.mDown.innerHTML = st.down != null ? `${fmtSpeed(st.down)}<small> Mbps</small>` : st.phase === 'down' ? `${fmtSpeed(st.cur)}<small> Mbps</small>` : '—';
    el.mUp.innerHTML = st.up != null ? `${fmtSpeed(st.up)}<small> Mbps</small>` : st.phase === 'up' ? `${fmtSpeed(st.cur)}<small> Mbps</small>` : !canUp(s) ? `<small class="muted">${t('spNoUp')}</small>` : '—';
    el.start.textContent = t(ctl ? 'spStop' : 'spStart');
    el.start.classList.toggle('secondary', !!ctl);
  }

  function renderHist() {
    el.histWrap.hidden = !hist.length;
    el.hist.innerHTML = hist.map((h) => {
      const s = SERVERS.find((x) => x.id === h.id);
      const d = new Date(h.ts);
      const time = d.toLocaleString(IPC.lang === 'zh' ? 'zh-CN' : 'en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      return `<tr><td class="loc">${s ? esc(L(s.name)) + ' <small class="muted">' + esc(L(s.loc)) + '</small>' : esc(h.id)}</td><td>${h.ping != null ? h.ping + ' ms' : '—'}</td><td>${h.jitter != null ? h.jitter + ' ms' : '—'}</td><td><b>${fmtSpeed(h.down)}</b></td><td><b>${h.up != null ? fmtSpeed(h.up) : '—'}</b></td><td class="muted">${esc(time)}</td></tr>`;
    }).join('');
  }
  const renderAll = () => { renderList(); renderGauge(); renderHist(); };

  async function pingAll() {
    const list = SERVERS.slice();
    list.forEach((s) => { pings[s.id] = 'wait'; });
    renderList();
    let i = 0;
    const worker = async () => {
      while (i < list.length) {
        const s = list[i++];
        try { pings[s.id] = (await latency(s, 3)).min; } catch (e) { pings[s.id] = null; }
        renderList();
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
  }

  async function start() {
    if (ctl) { ctl.abort(); return; }
    const s = server();
    ctl = new AbortController();
    const signal = ctl.signal;
    Object.assign(st, { phase: 'ping', cur: 0, prog: 0, ping: null, down: null, up: null, err: '' });
    renderAll();
    const dur = st.dur * 1000;
    const rate = (v, p) => { st.cur = v; st.prog = Math.max(0, Math.min(1, p)); renderGauge(); };
    try {
      st.ping = await latency(s, 10, signal, (xs) => { st.prog = xs.length / 10; renderGauge(); });
      pings[s.id] = st.ping.min;
      renderList();
      if (signal.aborted) throw new DOMException('', 'AbortError');
      st.phase = 'down'; st.cur = 0; st.prog = 0; renderGauge();
      st.down = await (exact(s) ? dlStream : dlOpaque)(s, st.threads, dur, signal, rate);
      if (signal.aborted) throw new DOMException('', 'AbortError');
      if (canUp(s)) {
        st.phase = 'up'; st.cur = 0; st.prog = 0; renderGauge();
        try { st.up = await upload(s, Math.min(st.threads, 4), dur, signal, rate); } catch (e) { if (signal.aborted) throw e; st.up = null; }
      }
      st.phase = 'done';
      hist.unshift({ id: s.id, ts: Date.now(), ping: st.ping.med, jitter: st.ping.jitter, down: st.down, up: st.up });
      hist = hist.slice(0, 12);
      IPC.store.set('ipc-speed-hist', hist);
    } catch (e) {
      st.phase = 'done';
      if (!signal.aborted) st.err = errText(e);
    } finally {
      ctl = null;
      renderAll();
    }
  }

  IPC.register('speed', {
    init() {
      el = {
        cn: $('#spCn'), intl: $('#spIntl'), arc: $('#spArc'), val: $('#spVal'), phase: $('#spPhase'), node: $('#spNode'), bar: $('#spBar'),
        mPing: $('#spMPing'), mJit: $('#spMJit'), mDown: $('#spMDown'), mUp: $('#spMUp'), start: $('#spStart'),
        hist: $('#spHist'), histWrap: $('#spHistWrap'), threads: $('#spThreads'), dur: $('#spDur')
      };
      el.threads.value = String(st.threads); el.dur.value = String(st.dur);
      el.threads.addEventListener('change', () => { st.threads = Number(el.threads.value); IPC.store.set('ipc-speed-threads', st.threads); });
      el.dur.addEventListener('change', () => { st.dur = Number(el.dur.value); IPC.store.set('ipc-speed-dur', st.dur); });
      const pickNode = (e) => {
        const b = e.target.closest('.sp-node');
        if (!b || ctl) return;
        st.sel = b.dataset.id; IPC.store.set('ipc-speed-sel', st.sel);
        Object.assign(st, { phase: 'idle', ping: null, down: null, up: null, err: '', cur: 0 });
        renderList(); renderGauge();
      };
      el.cn.addEventListener('click', pickNode);
      el.intl.addEventListener('click', pickNode);
      el.start.addEventListener('click', start);
      $('#spPingAll').addEventListener('click', pingAll);
      $('#spClearHist').addEventListener('click', () => { hist = []; IPC.store.set('ipc-speed-hist', hist); renderHist(); });
      renderAll();
      pingAll();
    },
    lang: renderAll
  });
})();
