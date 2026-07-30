/* spears.network — self-contained QR code generator (URL / text).
   QR encoder: byte mode, versions 1–10, ECC level M. No dependencies, no network.
   QR Code is a registered trademark of Denso Wave. */
(function () {
  "use strict";

  /* ---- Galois field GF(256), primitive poly 0x11d ---- */
  var EXP = new Array(512), LOG = new Array(256);
  (function () {
    var x = 1;
    for (var i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
    for (i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();
  function gmul(a, b) { return (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]]; }

  function genPoly(n) {
    var g = [1];
    for (var i = 0; i < n; i++) {
      g.push(0);
      for (var j = g.length - 1; j > 0; j--) g[j] = g[j - 1] ^ gmul(g[j], EXP[i]);
      g[0] = gmul(g[0], EXP[i]);
    }
    return g;
  }
  function eccOf(data, n) {
    var gen = genPoly(n).reverse(); // leading coefficient (x^n) first for division

    var buf = data.concat(new Array(n).fill(0));
    for (var i = 0; i < data.length; i++) {
      var c = buf[i];
      if (c !== 0) for (var j = 0; j <= n; j++) buf[i + j] ^= gmul(gen[j], c);
    }
    return buf.slice(data.length);
  }

  /* ---- ECC level M block structure: [ecPerBlock, [[count,dataPerBlock],...]] ---- */
  var BLOCKS = {
    1: [10, [[1, 16]]], 2: [16, [[1, 28]]], 3: [26, [[1, 44]]],
    4: [18, [[2, 32]]], 5: [24, [[2, 43]]], 6: [16, [[4, 27]]],
    7: [18, [[4, 31]]], 8: [22, [[2, 38], [2, 39]]],
    9: [22, [[3, 36], [2, 37]]], 10: [26, [[4, 43], [1, 44]]]
  };
  var CAP_M = [0, 16, 28, 44, 64, 86, 108, 124, 154, 182, 216]; // data codewords / version
  var ALIGN = {
    1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
    7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50]
  };

  function utf8(str) {
    if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(str));
    return Array.from(unescape(encodeURIComponent(str))).map(function (c) { return c.charCodeAt(0); });
  }

  function chooseVersion(len) {
    for (var v = 1; v <= 10; v++) {
      var count = v <= 9 ? 8 : 16;
      var need = 4 + count + 8 * len;
      if (need <= CAP_M[v] * 8) return v;
    }
    return 0;
  }

  function bitstream(bytes, version) {
    var count = version <= 9 ? 8 : 16;
    var bits = [];
    function push(val, n) { for (var i = n - 1; i >= 0; i--) bits.push((val >> i) & 1); }
    push(0x4, 4);               // byte mode
    push(bytes.length, count);  // char count
    for (var i = 0; i < bytes.length; i++) push(bytes[i], 8);
    var cap = CAP_M[version] * 8;
    for (i = 0; i < 4 && bits.length < cap; i++) bits.push(0); // terminator
    while (bits.length % 8 !== 0) bits.push(0);
    var pads = [0xec, 0x11], p = 0;
    while (bits.length < cap) { push(pads[p % 2], 8); p++; }
    var cw = [];
    for (i = 0; i < bits.length; i += 8) {
      var b = 0; for (var k = 0; k < 8; k++) b = (b << 1) | bits[i + k];
      cw.push(b);
    }
    return cw;
  }

  function interleave(codewords, version) {
    var spec = BLOCKS[version], ecLen = spec[0], groups = spec[1];
    var blocks = [], idx = 0;
    groups.forEach(function (g) {
      for (var b = 0; b < g[0]; b++) {
        var data = codewords.slice(idx, idx + g[1]); idx += g[1];
        blocks.push({ data: data, ecc: eccOf(data, ecLen) });
      }
    });
    var out = [], maxData = 0;
    blocks.forEach(function (bl) { if (bl.data.length > maxData) maxData = bl.data.length; });
    for (var i = 0; i < maxData; i++)
      blocks.forEach(function (bl) { if (i < bl.data.length) out.push(bl.data[i]); });
    for (i = 0; i < ecLen; i++)
      blocks.forEach(function (bl) { out.push(bl.ecc[i]); });
    return out;
  }

  /* ---- matrix construction ---- */
  function newMatrix(size) {
    var m = [], r = [];
    for (var i = 0; i < size; i++) { m.push(new Array(size).fill(0)); r.push(new Array(size).fill(false)); }
    return { m: m, r: r, size: size };
  }
  function setF(g, row, col, val) { g.m[row][col] = val; g.r[row][col] = true; }

  function drawFinder(g, row, col) {
    for (var dr = -1; dr <= 7; dr++) for (var dc = -1; dc <= 7; dc++) {
      var rr = row + dr, cc = col + dc;
      if (rr < 0 || cc < 0 || rr >= g.size || cc >= g.size) continue;
      var on = (dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6) &&
        (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
      setF(g, rr, cc, on ? 1 : 0);
    }
  }
  function drawAlign(g, cx, cy) {
    for (var dr = -2; dr <= 2; dr++) for (var dc = -2; dc <= 2; dc++)
      setF(g, cy + dr, cx + dc, (Math.max(Math.abs(dr), Math.abs(dc)) !== 1) ? 1 : 0);
  }

  function buildFunctions(g, version) {
    var size = g.size;
    drawFinder(g, 0, 0);
    drawFinder(g, 0, size - 7);
    drawFinder(g, size - 7, 0);
    // timing
    for (var i = 0; i < size; i++) {
      if (!g.r[6][i]) setF(g, 6, i, (i % 2 === 0) ? 1 : 0);
      if (!g.r[i][6]) setF(g, i, 6, (i % 2 === 0) ? 1 : 0);
    }
    // alignment
    var pos = ALIGN[version];
    for (var a = 0; a < pos.length; a++) for (var b = 0; b < pos.length; b++) {
      var cy = pos[a], cx = pos[b];
      if ((cy <= 7 && cx <= 7) || (cy <= 7 && cx >= size - 8) || (cy >= size - 8 && cx <= 7)) continue;
      drawAlign(g, cx, cy);
    }
    // dark module
    setF(g, size - 8, 8, 1);
    // reserve format areas
    for (i = 0; i <= 8; i++) { if (!g.r[8][i]) g.r[8][i] = true; if (!g.r[i][8]) g.r[i][8] = true; }
    for (i = 0; i < 8; i++) { g.r[8][size - 1 - i] = true; g.r[size - 1 - i][8] = true; }
    // reserve version info
    if (version >= 7) for (i = 0; i < 6; i++) for (var j = 0; j < 3; j++) {
      g.r[i][size - 11 + j] = true; g.r[size - 11 + j][i] = true;
    }
  }

  function placeData(g, bits) {
    var size = g.size, idx = 0, up = true;
    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--;
      for (var i = 0; i < size; i++) {
        var row = up ? size - 1 - i : i;
        for (var c = 0; c < 2; c++) {
          var cc = col - c;
          if (!g.r[row][cc]) { g.m[row][cc] = idx < bits.length ? bits[idx] : 0; idx++; }
        }
      }
      up = !up;
    }
  }

  function maskFn(k) {
    return [
      function (i, j) { return (i + j) % 2 === 0; },
      function (i) { return i % 2 === 0; },
      function (i, j) { return j % 3 === 0; },
      function (i, j) { return (i + j) % 3 === 0; },
      function (i, j) { return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0; },
      function (i, j) { return (i * j) % 2 + (i * j) % 3 === 0; },
      function (i, j) { return ((i * j) % 2 + (i * j) % 3) % 2 === 0; },
      function (i, j) { return ((i + j) % 2 + (i * j) % 3) % 2 === 0; }
    ][k];
  }

  function penalty(m) {
    var n = m.length, p = 0, i, j, k;
    // rule 1: runs
    for (i = 0; i < n; i++) for (var dir = 0; dir < 2; dir++) {
      var run = 1, prev = -1;
      for (j = 0; j < n; j++) {
        var v = dir === 0 ? m[i][j] : m[j][i];
        if (v === prev) { run++; if (run === 5) p += 3; else if (run > 5) p += 1; }
        else { run = 1; prev = v; }
      }
    }
    // rule 2: 2x2 blocks
    for (i = 0; i < n - 1; i++) for (j = 0; j < n - 1; j++) {
      var a = m[i][j];
      if (a === m[i][j + 1] && a === m[i + 1][j] && a === m[i + 1][j + 1]) p += 3;
    }
    // rule 3: finder-like patterns
    var pat1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0], pat2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    function match(get) {
      for (i = 0; i < n; i++) for (j = 0; j <= n - 11; j++) {
        var ok1 = true, ok2 = true;
        for (k = 0; k < 11; k++) { var v = get(i, j + k); if (v !== pat1[k]) ok1 = false; if (v !== pat2[k]) ok2 = false; }
        if (ok1) p += 40; if (ok2) p += 40;
      }
    }
    match(function (a, b) { return m[a][b]; });
    match(function (a, b) { return m[b][a]; });
    // rule 4: dark balance
    var dark = 0;
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) dark += m[i][j];
    var pct = dark * 100 / (n * n);
    p += Math.floor(Math.abs(pct - 50) / 5) * 10;
    return p;
  }

  function formatBits(mask) {
    var data = (0 << 3) | mask; // ECC level M = 0
    var rem = data;
    for (var i = 0; i < 10; i++) rem = (rem << 1) ^ (((rem >> 9) & 1) * 0x537);
    return ((data << 10) | rem) ^ 0x5412;
  }
  function versionBits(version) {
    var rem = version;
    for (var i = 0; i < 12; i++) rem = (rem << 1) ^ (((rem >> 11) & 1) * 0x1f25);
    return (version << 12) | rem;
  }

  function applyFormat(g, mask) {
    var size = g.size, bits = formatBits(mask), i, v;
    function bit(k) { return (bits >> k) & 1; }
    // vertical arm (column 8)
    for (i = 0; i < 15; i++) {
      v = bit(i);
      if (i < 6) g.m[i][8] = v;
      else if (i < 8) g.m[i + 1][8] = v;
      else g.m[size - 15 + i][8] = v;
    }
    // horizontal arm (row 8)
    for (i = 0; i < 15; i++) {
      v = bit(i);
      if (i < 8) g.m[8][size - i - 1] = v;
      else if (i < 9) g.m[8][7] = v;
      else g.m[8][15 - i - 1] = v;
    }
    g.m[size - 8][8] = 1; // dark module
  }
  function applyVersion(g, version) {
    if (version < 7) return;
    var size = g.size, bits = versionBits(version);
    for (var i = 0; i < 18; i++) {
      var b = (bits >> i) & 1, a = size - 11 + i % 3, c = Math.floor(i / 3);
      g.m[a][c] = b; g.m[c][a] = b;
    }
  }

  function encode(text) {
    var bytes = utf8(text);
    var version = chooseVersion(bytes.length);
    if (!version) throw new Error("too-long");
    var codewords = bitstream(bytes, version);
    var inter = interleave(codewords, version);
    var bits = [];
    inter.forEach(function (cw) { for (var i = 7; i >= 0; i--) bits.push((cw >> i) & 1); });

    var g = newMatrix(17 + 4 * version);
    buildFunctions(g, version);
    placeData(g, bits);

    // choose best mask
    var best = null, bestScore = Infinity, size = g.size;
    for (var k = 0; k < 8; k++) {
      var trial = [];
      for (var i = 0; i < size; i++) trial.push(g.m[i].slice());
      var fn = maskFn(k);
      for (i = 0; i < size; i++) for (var j = 0; j < size; j++)
        if (!g.r[i][j] && fn(i, j)) trial[i][j] ^= 1;
      // temp format for scoring
      var tg = { m: trial, size: size };
      applyFormat(tg, k); applyVersion(tg, version);
      var s = penalty(trial);
      if (s < bestScore) { bestScore = s; best = { grid: trial, mask: k }; }
    }
    return { size: size, matrix: best.grid };
  }

  /* ---- browser UI ---- */
  function $id(id) { return document.getElementById(id); }
  document.addEventListener("DOMContentLoaded", function () {
    var inp = $id("qr-in"), go = $id("qr-go"), out = $id("qr-out"),
        holder = $id("qr-img"), err = $id("qr-err"),
        pngBtn = $id("qr-png"), svgBtn = $id("qr-svg");
    if (!go) return;
    var current = null;

    function fail(m) { err.textContent = m; err.hidden = false; out.hidden = true; }

    function svgFor(matrix, size, quiet, scale) {
      var dim = (size + quiet * 2) * scale;
      var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + dim + '" height="' + dim +
        '" viewBox="0 0 ' + dim + ' ' + dim + '" shape-rendering="crispEdges">';
      s += '<rect width="' + dim + '" height="' + dim + '" fill="#ffffff"/>';
      var path = "";
      for (var i = 0; i < size; i++) for (var j = 0; j < size; j++) if (matrix[i][j]) {
        var x = (j + quiet) * scale, y = (i + quiet) * scale;
        path += "M" + x + " " + y + "h" + scale + "v" + scale + "h" + (-scale) + "z";
      }
      s += '<path d="' + path + '" fill="#000000"/></svg>';
      return s;
    }
    function render() {
      err.hidden = true;
      var text = inp.value;
      if (!text) return fail("Enter a URL or some text to encode.");
      var res;
      try { res = encode(text); }
      catch (e) {
        return fail(e.message === "too-long"
          ? "That's too long to encode at this size. Shorten it and try again."
          : "Couldn't generate the code.");
      }
      current = res;
      holder.innerHTML = svgFor(res.matrix, res.size, 4, 8);
      out.hidden = false;
    }
    function download(href, name) {
      var a = document.createElement("a");
      a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    }
    function downloadSvg() {
      if (!current) return;
      download("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgFor(current.matrix, current.size, 4, 10)), "qr.svg");
    }
    function downloadPng() {
      if (!current) return;
      var scale = 12, quiet = 4, dim = (current.size + quiet * 2) * scale;
      var cv = document.createElement("canvas"); cv.width = dim; cv.height = dim;
      var ctx = cv.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, dim, dim); ctx.fillStyle = "#000";
      for (var i = 0; i < current.size; i++) for (var j = 0; j < current.size; j++)
        if (current.matrix[i][j]) ctx.fillRect((j + quiet) * scale, (i + quiet) * scale, scale, scale);
      download(cv.toDataURL("image/png"), "qr.png");
    }
    go.addEventListener("click", render);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) render(); });
    pngBtn.addEventListener("click", downloadPng);
    svgBtn.addEventListener("click", downloadSvg);
  });
})();
