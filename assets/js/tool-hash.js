/* spears.network — text hash generator (MD5 + SHA-1/256/384/512), all local. */
(function () {
  "use strict";

  function md5(bytes) {
    function rl(x, c) { return (x << c) | (x >>> (32 - c)); }
    function add(a, b) { return (a + b) | 0; }
    var s = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
             5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
             4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
             6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
    var K = [];
    for (var i = 0; i < 64; i++) K[i] = (Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296)) | 0;
    var a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
    var ml = bytes.length * 8;
    var padLen = (((bytes.length + 1 + 8 + 63) >> 6) << 6);
    var msg = new Uint8Array(padLen);
    msg.set(bytes); msg[bytes.length] = 0x80;
    for (i = 0; i < 8; i++) msg[padLen - 8 + i] = (Math.floor(ml / Math.pow(2, 8 * i))) & 0xff;
    for (var off = 0; off < padLen; off += 64) {
      var M = [];
      for (var j = 0; j < 16; j++)
        M[j] = msg[off + j * 4] | (msg[off + j * 4 + 1] << 8) | (msg[off + j * 4 + 2] << 16) | (msg[off + j * 4 + 3] << 24);
      var A = a0, B = b0, C = c0, D = d0;
      for (i = 0; i < 64; i++) {
        var F, g;
        if (i < 16) { F = (B & C) | ((~B) & D); g = i; }
        else if (i < 32) { F = (D & B) | ((~D) & C); g = (5 * i + 1) % 16; }
        else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
        else { F = C ^ (B | (~D)); g = (7 * i) % 16; }
        F = add(add(add(F, A), K[i]), M[g]);
        A = D; D = C; C = B; B = add(B, rl(F, s[i]));
      }
      a0 = add(a0, A); b0 = add(b0, B); c0 = add(c0, C); d0 = add(d0, D);
    }
    function hx(n) { var o = ""; for (var i = 0; i < 4; i++) o += ("0" + ((n >>> (i * 8)) & 0xff).toString(16)).slice(-2); return o; }
    return hx(a0) + hx(b0) + hx(c0) + hx(d0);
  }

  function toHex(buf) {
    var b = new Uint8Array(buf), s = "";
    for (var i = 0; i < b.length; i++) s += ("0" + b[i].toString(16)).slice(-2);
    return s;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var inp = document.getElementById("th-in"), body = document.getElementById("th-body");
    if (!inp) return;
    var enc = new TextEncoder();
    var token = 0;

    function render() {
      var my = ++token;
      var bytes = enc.encode(inp.value);
      var rows = [["MD5", md5(bytes)]];
      var subtle = window.crypto && window.crypto.subtle;
      var names = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
      Promise.all(names.map(function (n) {
        return subtle ? subtle.digest(n, bytes).then(toHex) : Promise.resolve("(needs HTTPS)");
      })).then(function (shas) {
        if (my !== token) return; // a newer keystroke won
        names.forEach(function (n, i) { rows.push([n, shas[i]]); });
        body.innerHTML = rows.map(function (r) {
          return "<tr><th>" + r[0] + "</th><td class=\"mono th-hash\" title=\"click to copy\">" + r[1] + "</td></tr>";
        }).join("");
      });
    }
    // (click-to-copy on the hash cells is handled globally by tools.js)
    inp.addEventListener("input", render);
    render();
  });
})();
