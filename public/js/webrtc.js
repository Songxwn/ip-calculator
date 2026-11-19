(() => {
  'use strict';
  const IPC = window.IPC;
  const { t, $, esc, net, parseAddr } = IPC;
  const { geo, locText, ispText, ccBadge, latClass } = net;

  IPC.addI18n({
    zh: {
      rtcTitle: 'WebRTC UDP 检测', rtcDesc: '通过 STUN 服务器获取 UDP 出口地址。若代理不支持 UDP 或 WebRTC 绕过了代理，这里显示的 IP 可能与网页出口不同',
      rtcUnsupported: '当前浏览器不支持或禁用了 WebRTC', colStun: 'STUN 服务器', colUdp: 'UDP 出口', colNat: '映射端口',
      rtcLocal: '本地候选地址', rtcLocalNote: '现代浏览器默认使用 mDNS（*.local）隐藏局域网 IP',
      rtcNone: '无响应（UDP 可能被阻断）', rtcLeak: 'WebRTC 出口 {ip} 与网页出口 {web} 不同，可能存在 WebRTC 泄露',
      rtcSame: 'WebRTC 出口与网页出口一致', rtcNoLocal: '未获取到本地候选地址'
    },
    en: {
      rtcTitle: 'WebRTC UDP Test', rtcDesc: 'Discovers your UDP egress via STUN servers. If your proxy lacks UDP support or WebRTC bypasses it, the IP here may differ from your web egress',
      rtcUnsupported: 'WebRTC is unsupported or disabled in this browser', colStun: 'STUN server', colUdp: 'UDP egress', colNat: 'Mapped port',
      rtcLocal: 'Local candidates', rtcLocalNote: 'Modern browsers hide LAN IPs behind mDNS (*.local) names by default',
      rtcNone: 'No response (UDP may be blocked)', rtcLeak: 'WebRTC egress {ip} differs from web egress {web}: possible WebRTC leak',
      rtcSame: 'WebRTC egress matches your web egress', rtcNoLocal: 'No local candidates gathered'
    }
  });

  const SERVERS = [
    'stun:stun.cloudflare.com:3478',
    'stun:stun.l.google.com:19302',
    'stun:global.stun.twilio.com:3478',
    'stun:stun.nextcloud.com:443',
    'stun:stun.miwifi.com:3478',
    'stun:stun.qq.com:3478',
    'stun:stun.chat.bilibili.com:3478'
  ];

  let el, runId = 0;
  const res = {}, geos = {}, local = new Set();
  let web = null;

  function probe(url, ms = 6000) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const out = { srflx: [], ms: null };
      let pc;
      try { pc = new RTCPeerConnection({ iceServers: [{ urls: url }] }); } catch (e) { resolve(out); return; }
      const finish = () => { clearTimeout(tm); try { pc.close(); } catch (e) { } resolve(out); };
      const tm = setTimeout(finish, ms);
      pc.onicecandidate = (e) => {
        if (!e.candidate) { finish(); return; }
        const c = e.candidate.candidate.split(' ');
        const ip = c[4], port = c[5], typ = c[7];
        if (typ === 'srflx') {
          if (out.ms == null) out.ms = Math.round(performance.now() - t0);
          if (!out.srflx.some((x) => x.ip === ip)) out.srflx.push({ ip, port });
        } else if (typ === 'host' && ip) local.add(ip);
      };
      pc.createDataChannel('ipc');
      pc.createOffer().then((o) => pc.setLocalDescription(o)).catch(finish);
    });
  }

  function render() {
    if (!window.RTCPeerConnection) { el.list.innerHTML = `<tr><td colspan="4" class="err">${t('rtcUnsupported')}</td></tr>`; return; }
    el.list.innerHTML = SERVERS.map((s) => {
      const r = res[s];
      let ip, port = '', lat = '';
      if (!r) ip = '<span class="skel" style="width:9rem"></span>';
      else if (!r.srflx.length) ip = `<span class="muted">${t('rtcNone')}</span>`;
      else {
        ip = r.srflx.map((x) => {
          const g = geos[x.ip];
          return `<div><a class="ipv mono" href="#/query?ip=${encodeURIComponent(x.ip)}">${esc(x.ip)}</a> <small class="muted">${g ? ccBadge(g.cc) + esc([locText(g), ispText(g)].filter(Boolean).join(' · ')) : ''}</small></div>`;
        }).join('');
        port = r.srflx.map((x) => `<div class="mono">${esc(x.port)}</div>`).join('');
        lat = `<span class="lat ${latClass(r.ms)}">${r.ms} ms</span>`;
      }
      return `<tr><td class="mono">${esc(s.replace(/^stun:/, ''))}</td><td>${ip}</td><td>${port}</td><td>${lat}</td></tr>`;
    }).join('');

    const ips = [];
    SERVERS.forEach((s) => (res[s] ? res[s].srflx : []).forEach((x) => { if (ips.indexOf(x.ip) < 0) ips.push(x.ip); }));
    const v4 = ips.filter((ip) => { const a = parseAddr(ip); return a && a.v === 4; });
    if (web && v4.length) {
      const diff = v4.filter((ip) => ip !== web);
      el.verdict.hidden = false;
      el.verdict.className = 'verdict ' + (diff.length ? 'warn' : 'good');
      el.verdict.innerHTML = `<b>${diff.length ? t('rtcLeak', { ip: esc(diff.join(', ')), web: esc(web) }) : t('rtcSame')}</b>`;
    } else el.verdict.hidden = true;

    el.local.innerHTML = local.size
      ? Array.from(local).map((ip) => `<span class="chip static">${esc(ip)}</span>`).join('')
      : `<span class="muted">${Object.keys(res).length < SERVERS.length ? t('loading') : t('rtcNoLocal')}</span>`;
  }

  function run() {
    const id = ++runId;
    SERVERS.forEach((s) => { delete res[s]; });
    local.clear();
    render();
    if (!window.RTCPeerConnection) return;
    net.req('https://api4.ipify.org?format=json', { ms: 6000 }).then((r) => { web = r.data.ip; render(); }, () => { });
    SERVERS.forEach((s) => probe(s).then((r) => {
      if (id !== runId) return;
      res[s] = r;
      r.srflx.forEach((x) => { if (!geos[x.ip]) geo(x.ip).then((g) => { if (g) { geos[x.ip] = g; render(); } }); });
      render();
    }));
  }

  IPC.register('webrtc', {
    init() {
      el = { list: $('#rtcList'), local: $('#rtcLocal'), verdict: $('#rtcVerdict') };
      $('#rtcRefresh').addEventListener('click', run);
      run();
    },
    lang: render
  });
})();
