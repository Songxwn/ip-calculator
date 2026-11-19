(() => {
  'use strict';
  const IPC = window.IPC;

  IPC.addI18n({
    zh: { qrTitle: '手机扫码访问', qrDesc: '用手机相机或微信扫一扫，在移动设备上打开当前页面' },
    en: { qrTitle: 'Scan to open on mobile', qrDesc: 'Scan with your phone camera to open this page on a mobile device' }
  });

  // Minimal QR encoder: byte mode, ECC level M, versions 1-20
  const ECC = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26];
  const BLK = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16];

  const EXP = new Array(512), LOG = new Array(256);
  for (let i = 0, x = 1; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; }
  for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

  function rsDivisor(deg) {
    let r = [1];
    for (let i = 0; i < deg; i++) {
      const n = new Array(r.length + 1).fill(0);
      for (let j = 0; j < r.length; j++) { n[j] ^= r[j]; n[j + 1] ^= mul(r[j], EXP[i]); }
      r = n;
    }
    return r.slice(1);
  }
  function rsRem(data, div) {
    const r = new Array(div.length).fill(0);
    for (const b of data) {
      const f = b ^ r.shift();
      r.push(0);
      for (let i = 0; i < div.length; i++) r[i] ^= mul(div[i], f);
    }
    return r;
  }

  const rawModules = (v) => {
    let r = (16 * v + 128) * v + 64;
    if (v >= 2) { const n = Math.floor(v / 7) + 2; r -= (25 * n - 10) * n - 55; if (v >= 7) r -= 36; }
    return r;
  };
  const dataCw = (v) => Math.floor(rawModules(v) / 8) - ECC[v - 1] * BLK[v - 1];
  function alignPos(v) {
    if (v === 1) return [];
    const n = Math.floor(v / 7) + 2;
    const step = Math.ceil((v * 4 + 4) / (n * 2 - 2)) * 2;
    const r = [6];
    for (let i = 0, p = v * 4 + 10; i < n - 1; i++, p -= step) r.splice(1, 0, p);
    return r;
  }

  function encode(text) {
    const bytes = Array.from(new TextEncoder().encode(text));
    let v = 1;
    for (; v <= 20; v++) if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= dataCw(v) * 8) break;
    if (v > 20) return null;
    const cap = dataCw(v) * 8, bits = [];
    const put = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
    put(4, 4); put(bytes.length, v < 10 ? 8 : 16);
    bytes.forEach((b) => put(b, 8));
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (let p = 0xec; bits.length < cap; p ^= 0xec ^ 0x11) put(p, 8);
    const data = [];
    for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));

    const nb = BLK[v - 1], ec = ECC[v - 1], raw = Math.floor(rawModules(v) / 8);
    const nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
    const div = rsDivisor(ec), blocks = [];
    for (let i = 0, k = 0; i < nb; i++) {
      const len = shortLen - ec + (i < nShort ? 0 : 1);
      const d = data.slice(k, k + len); k += len;
      blocks.push({ d, e: rsRem(d, div) });
    }
    const cw = [];
    for (let i = 0; i <= shortLen - ec; i++) blocks.forEach((b) => { if (i < b.d.length) cw.push(b.d[i]); });
    for (let i = 0; i < ec; i++) blocks.forEach((b) => cw.push(b.e[i]));

    const size = v * 4 + 17;
    const M = [], F = [];
    for (let y = 0; y < size; y++) { M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
    const set = (x, y, d) => { M[y][x] = !!d; F[y][x] = true; };

    for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
    const finder = (cx, cy) => {
      for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, d !== 2 && d !== 4);
      }
    };
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    const ap = alignPos(v), na = ap.length;
    for (let i = 0; i < na; i++) for (let j = 0; j < na; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(ap[i] + dx, ap[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    const drawFormat = (mask) => {
      const d = mask; // ECC level M = 0b00
      let r = d;
      for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
      const b = ((d << 10) | r) ^ 0x5412;
      const bit = (i) => (b >>> i) & 1;
      for (let i = 0; i <= 5; i++) set(8, i, bit(i));
      set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
      for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
      for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
      for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
      set(8, size - 8, 1);
    };
    drawFormat(0);
    if (v >= 7) {
      let r = v;
      for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
      const b = (v << 12) | r;
      for (let i = 0; i < 18; i++) {
        const d = (b >>> i) & 1, a = size - 11 + i % 3, c = Math.floor(i / 3);
        set(a, c, d); set(c, a, d);
      }
    }

    for (let right = size - 1, i = 0; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
        const x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
        if (!F[y][x] && i < cw.length * 8) { M[y][x] = ((cw[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
      }
    }

    const MASKS = [
      (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
      (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
      (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0
    ];
    const applyMask = (k) => {
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!F[y][x] && MASKS[k](x, y)) M[y][x] = !M[y][x];
    };
    const penalty = () => {
      let p = 0, dark = 0;
      for (let a = 0; a < size; a++) {
        let rx = 1, ry = 1;
        for (let b = 1; b < size; b++) {
          if (M[a][b] === M[a][b - 1]) { if (++rx === 5) p += 3; else if (rx > 5) p++; } else rx = 1;
          if (M[b][a] === M[b - 1][a]) { if (++ry === 5) p += 3; else if (ry > 5) p++; } else ry = 1;
        }
      }
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        if (M[y][x]) dark++;
        if (x < size - 1 && y < size - 1 && M[y][x] === M[y][x + 1] && M[y][x] === M[y + 1][x] && M[y][x] === M[y + 1][x + 1]) p += 3;
      }
      return p + Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    };
    let best = 0, min = Infinity;
    for (let k = 0; k < 8; k++) {
      applyMask(k); drawFormat(k);
      const p = penalty();
      if (p < min) { min = p; best = k; }
      applyMask(k);
    }
    applyMask(best); drawFormat(best);
    return M;
  }

  function svg(text) {
    const M = encode(text);
    if (!M) return '';
    const n = M.length, q = 2, s = n + q * 2;
    let d = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (M[y][x]) d += `M${x + q} ${y + q}h1v1h-1z`;
    return `<svg viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#0f172a"/></svg>`;
  }
  IPC.qrSvg = svg;

  const url = () => location.origin + location.pathname + location.hash;
  let last = '';
  function update() {
    const box = document.getElementById('qrBox'), cap = document.getElementById('qrUrl');
    if (!box) return;
    const u = url();
    if (u === last) return;
    last = u;
    box.innerHTML = svg(u);
    if (cap) cap.textContent = u.replace(/^https?:\/\//, '');
  }
  document.addEventListener('DOMContentLoaded', update);
  window.addEventListener('hashchange', update);
  const setHash = IPC.setHash;
  IPC.setHash = function () { const r = setHash.apply(this, arguments); update(); return r; };
})();
