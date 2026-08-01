/* spears.network — /tools/ client-side utilities. No network except DoH (dns). */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------------------------------------------------------------- subnet */
  function initSubnet() {
    var input = $("sn-cidr"), go = $("sn-go"),
        out = $("sn-out"), body = $("sn-body"), err = $("sn-err"), bits = $("sn-bits");
    if (!input || !go) return;

    function fail(msg) { err.textContent = msg; show(err); hide(out); }

    function parseOctets(s) {
      var parts = s.split(".");
      if (parts.length !== 4) return null;
      var n = 0;
      for (var i = 0; i < 4; i++) {
        if (!/^\d{1,3}$/.test(parts[i])) return null;
        var v = parseInt(parts[i], 10);
        if (v > 255) return null;
        n = (n * 256) + v;
      }
      return n >>> 0;
    }
    function toIp(n) {
      return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
    }

    function calc() {
      hide(err);
      var raw = input.value.trim();
      if (!raw) return fail("Enter an address, e.g. 192.168.1.10/24");
      var ipStr = raw, prefix = 32;
      var slash = raw.indexOf("/");
      if (slash !== -1) {
        ipStr = raw.slice(0, slash);
        var p = raw.slice(slash + 1);
        if (!/^\d{1,2}$/.test(p)) return fail("Prefix must be 0–32.");
        prefix = parseInt(p, 10);
        if (prefix > 32) return fail("Prefix must be 0–32.");
      }
      var ip = parseOctets(ipStr);
      if (ip === null) return fail("That doesn't look like a valid IPv4 address.");

      var mask = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
      var network = (ip & mask) >>> 0;
      var broadcast = (network | (~mask >>> 0)) >>> 0;
      var total = Math.pow(2, 32 - prefix);
      var usable, firstHost, lastHost;
      if (prefix >= 31) {
        usable = prefix === 32 ? 1 : 2;
        firstHost = toIp(network);
        lastHost = toIp(broadcast);
      } else {
        usable = total - 2;
        firstHost = toIp((network + 1) >>> 0);
        lastHost = toIp((broadcast - 1) >>> 0);
      }

      var priv = (function () {
        var a = (ip >>> 24) & 255, b = (ip >>> 16) & 255;
        if (a === 10) return "private (RFC 1918)";
        if (a === 172 && b >= 16 && b <= 31) return "private (RFC 1918)";
        if (a === 192 && b === 168) return "private (RFC 1918)";
        if (a === 127) return "loopback";
        if (a === 169 && b === 254) return "link-local";
        if (a >= 224 && a <= 239) return "multicast";
        return "public";
      })();

      var toBin = function (n) {
        var s = "";
        for (var i = 31; i >= 0; i--) { s += (n >>> i) & 1; if (i % 8 === 0 && i) s += "."; }
        return s;
      };
      var toHex = function (n) {
        return "0x" + ("00000000" + (n >>> 0).toString(16).toUpperCase()).slice(-8);
      };
      var ipClass = (function () {
        var a = (ip >>> 24) & 255;
        if (a < 128) return "A"; if (a < 192) return "B"; if (a < 224) return "C";
        if (a < 240) return "D (multicast)"; return "E (reserved)";
      })();
      var ptr = [(ip & 255), (ip >>> 8) & 255, (ip >>> 16) & 255, (ip >>> 24) & 255].join(".") + ".in-addr.arpa";

      var rows = [
        ["Address", toIp(ip) + "/" + prefix],
        ["Netmask", toIp(mask) + "  (/" + prefix + ")"],
        ["Wildcard", toIp(~mask >>> 0)],
        ["Network", toIp(network)],
        ["Broadcast", prefix >= 31 ? "—" : toIp(broadcast)],
        ["Host range", usable > 0 ? firstHost + "  →  " + lastHost : "—"],
        ["Usable hosts", usable.toLocaleString()],
        ["Total addresses", total.toLocaleString()],
        ["Scope", priv],
        ["Class", ipClass],
        ["Binary", toBin(ip)],
        ["Hex", toHex(ip)],
        ["Integer", (ip >>> 0).toLocaleString()],
        ["Reverse DNS", ptr]
      ];
      body.innerHTML = rows.map(function (r) {
        return "<tr><th>" + esc(r[0]) + "</th><td class=\"mono\">" + esc(r[1]) + "</td></tr>";
      }).join("");

      // 32-bit visual: network bits vs host bits
      var cells = "";
      for (var b = 31; b >= 0; b--) {
        var isNet = (31 - b) < prefix;
        var bitv = (ip >>> b) & 1;
        cells += '<i class="snb ' + (isNet ? "net" : "host") + '">' + bitv + '</i>' +
          (b % 8 === 0 && b ? '<i class="snb-gap"></i>' : "");
      }
      bits.innerHTML = cells;
      show(out);
    }

    go.addEventListener("click", calc);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") calc(); });
    calc();
  }

  /* ------------------------------------------------------------------- dns */
  function initDns() {
    var name = $("dns-name"), type = $("dns-type"), res = $("dns-res"),
        go = $("dns-go"), out = $("dns-out"), body = $("dns-body"),
        summary = $("dns-summary"), err = $("dns-err");
    if (!name || !go) return;

    var RESOLVERS = {
      cloudflare: "https://cloudflare-dns.com/dns-query",
      controld: "https://freedns.controld.com/p0",
      quad9: "https://dns.quad9.net/dns-query"
    };
    var TYPES = { A: 1, NS: 2, CNAME: 5, MX: 15, TXT: 16, AAAA: 28 };
    var RCODE = ["NOERROR", "FORMERR", "SERVFAIL", "NXDOMAIN", "NOTIMP", "REFUSED"];

    function fail(msg) { err.innerHTML = msg; show(err); hide(out); }

    function b64url(bytes) {
      var s = "";
      for (var i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
      return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }

    function buildQuery(host, qtype) {
      var labels = host.replace(/\.$/, "").split(".");
      var body = [];
      for (var i = 0; i < labels.length; i++) {
        var l = labels[i];
        body.push(l.length);
        for (var j = 0; j < l.length; j++) body.push(l.charCodeAt(j) & 0xff);
      }
      body.push(0);
      var header = [0x00, 0x00, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];
      var tail = [(qtype >> 8) & 255, qtype & 255, 0x00, 0x01];
      return new Uint8Array(header.concat(body).concat(tail));
    }

    /* name decoder with compression pointers */
    function readName(buf, off) {
      var labels = [], jumped = false, end = off, safety = 0;
      while (safety++ < 128) {
        var len = buf[off];
        if (len === 0) { if (!jumped) end = off + 1; break; }
        if ((len & 0xc0) === 0xc0) {
          var ptr = ((len & 0x3f) << 8) | buf[off + 1];
          if (!jumped) end = off + 2;
          jumped = true;
          off = ptr;
          continue;
        }
        off++;
        var s = "";
        for (var i = 0; i < len; i++) s += String.fromCharCode(buf[off + i]);
        labels.push(s);
        off += len;
      }
      return { name: labels.join("."), next: end };
    }

    function parseRdata(buf, off, rdlen, t) {
      if (t === 1) { // A
        return buf[off] + "." + buf[off + 1] + "." + buf[off + 2] + "." + buf[off + 3];
      }
      if (t === 28) { // AAAA
        var parts = [];
        for (var i = 0; i < 16; i += 2) {
          parts.push(((buf[off + i] << 8) | buf[off + i + 1]).toString(16));
        }
        return parts.join(":").replace(/(^|:)0(:0)+(:|$)/, "::").replace(/:{3,}/, "::");
      }
      if (t === 5 || t === 2) return readName(buf, off).name; // CNAME / NS
      if (t === 15) { // MX
        var pref = (buf[off] << 8) | buf[off + 1];
        return pref + " " + readName(buf, off + 2).name;
      }
      if (t === 16) { // TXT
        var out = [], p = off, endp = off + rdlen;
        while (p < endp) {
          var l = buf[p++], s = "";
          for (var k = 0; k < l; k++) s += String.fromCharCode(buf[p + k]);
          out.push(s); p += l;
        }
        return out.join(" ");
      }
      return "(unsupported rdata)";
    }

    function parse(buf) {
      var rcode = buf[3] & 0x0f;
      var qd = (buf[4] << 8) | buf[5];
      var an = (buf[6] << 8) | buf[7];
      var off = 12;
      for (var q = 0; q < qd; q++) {
        off = readName(buf, off).next + 4;
      }
      var records = [];
      for (var a = 0; a < an; a++) {
        var nm = readName(buf, off); off = nm.next;
        var t = (buf[off] << 8) | buf[off + 1];
        var ttl = ((buf[off + 4] << 24) | (buf[off + 5] << 16) | (buf[off + 6] << 8) | buf[off + 7]) >>> 0;
        var rdlen = (buf[off + 8] << 8) | buf[off + 9];
        var rdoff = off + 10;
        records.push({
          name: nm.name,
          type: typeName(t),
          ttl: ttl,
          data: parseRdata(buf, rdoff, rdlen, t)
        });
        off = rdoff + rdlen;
      }
      return { rcode: rcode, records: records };
    }

    function typeName(t) {
      for (var k in TYPES) if (TYPES[k] === t) return k;
      return String(t);
    }

    function run() {
      hide(err);
      var host = name.value.trim().toLowerCase();
      if (!host || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(host)) {
        return fail("Enter a valid hostname, e.g. example.com");
      }
      var qtype = TYPES[type.value];
      var url = RESOLVERS[res.value] + "?dns=" + b64url(buildQuery(host, qtype));
      go.disabled = true; go.textContent = "…";

      fetch(url, { headers: { "accept": "application/dns-message" } })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.arrayBuffer();
        })
        .then(function (ab) {
          var parsed = parse(new Uint8Array(ab));
          summary.textContent = host + "  " + type.value + "  ·  " +
            res.options[res.selectedIndex].text + "  ·  " +
            (RCODE[parsed.rcode] || ("RCODE " + parsed.rcode));
          if (!parsed.records.length) {
            body.innerHTML = "<tr><td colspan=\"4\">No records of this type.</td></tr>";
          } else {
            body.innerHTML = parsed.records.map(function (rec) {
              return "<tr><td>" + esc(rec.name) + "</td><td>" + esc(rec.type) +
                "</td><td>" + rec.ttl + "</td><td class=\"mono\">" + esc(rec.data) + "</td></tr>";
            }).join("");
          }
          show(out);
        })
        .catch(function () {
          fail("Query failed. <strong>" + esc(res.options[res.selectedIndex].text) +
            "</strong> may not allow cross-origin DoH from the browser — try Cloudflare, " +
            "or check your connection.");
        })
        .then(function () { go.disabled = false; go.textContent = "query"; });
    }

    go.addEventListener("click", run);
    name.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  }

  /* -------------------------------------------------------------- checksum */
  function initChecksum() {
    var file = $("ck-file"), algo = $("ck-algo"), expect = $("ck-expect"),
        out = $("ck-out"), meta = $("ck-meta"), hashEl = $("ck-hash"),
        verdict = $("ck-verdict"), err = $("ck-err");
    if (!file) return;

    function fail(msg) { err.textContent = msg; show(err); hide(out); }
    function hex(buf) {
      var b = new Uint8Array(buf), s = "";
      for (var i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
      return s;
    }
    function fmtSize(n) {
      if (n < 1024) return n + " B";
      var u = ["KB", "MB", "GB"], i = -1;
      do { n /= 1024; i++; } while (n >= 1024 && i < u.length - 1);
      return n.toFixed(1) + " " + u[i];
    }

    function run() {
      hide(err); hide(verdict);
      var f = file.files && file.files[0];
      if (!f) return;
      if (!(window.crypto && window.crypto.subtle)) {
        return fail("Web Crypto isn't available in this browser context (needs HTTPS).");
      }
      meta.textContent = "hashing " + esc(f.name) + " (" + fmtSize(f.size) + ")…";
      hashEl.textContent = ""; show(out);

      f.arrayBuffer()
        .then(function (ab) { return window.crypto.subtle.digest(algo.value, ab); })
        .then(function (digest) {
          var h = hex(digest);
          meta.textContent = f.name + "  ·  " + fmtSize(f.size) + "  ·  " + algo.value;
          hashEl.textContent = h;
          var want = expect.value.trim().toLowerCase();
          if (want) {
            var ok = want === h;
            verdict.textContent = ok ? "✓ match — the file is intact"
                                     : "✗ no match — this file differs from the expected hash";
            verdict.className = "tool-verdict " + (ok ? "ok" : "bad");
            show(verdict);
          }
        })
        .catch(function () { fail("Couldn't read or hash that file."); });
    }

    file.addEventListener("change", run);
    algo.addEventListener("change", run);
    expect.addEventListener("input", function () {
      if (file.files && file.files[0] && hashEl.textContent) run();
    });
  }

  /* -------------------------------------------------------------- password */
  function randInt(max) { // uniform int in [0,max) via rejection sampling
    var buf = new Uint32Array(1), limit = Math.floor(0x100000000 / max) * max, x;
    do { crypto.getRandomValues(buf); x = buf[0]; } while (x >= limit);
    return x % max;
  }
  function pwStrength(bits) {
    if (bits < 40) return { label: "weak", color: "#ff8a8a" };
    if (bits < 60) return { label: "fair", color: "#f2c14e" };
    if (bits < 90) return { label: "strong", color: "var(--accent-2)" };
    return { label: "very strong", color: "var(--accent)" };
  }
  function pwCrackTime(bits, rate) {
    // average guesses = 2^(bits-1); rate = guesses/sec for the scenario
    var s = (bits - 1) * Math.LOG10E * Math.LN2 - Math.log10(rate); // log10 of average seconds
    if (s < 0.5) return "instantly";
    if (s < 1.78) return "a few seconds";
    if (s < 3.56) return "a few minutes";
    if (s < 4.94) return "a few hours";
    if (s < 6.42) return "a few days";
    if (s < 7.5) return "a few months";
    var y = s - 7.5; // log10 of years
    if (y < 1) return "a few years";
    if (y < 2) return "decades";
    if (y < 3) return "centuries";
    if (y < 6) return "thousands of years";
    if (y < 9) return "millions of years";
    if (y < 10.15) return "billions of years";
    return "longer than the universe has existed";
  }
  function initPassword() {
    var len = $("pw-len"), lenval = $("pw-lenval"), go = $("pw-go"),
        out = $("pw-out"), val = $("pw-value"), bar = $("pw-bar"),
        bitsEl = $("pw-bits"), rating = $("pw-rating"), poolEl = $("pw-pool"),
        err = $("pw-err"), copy = $("pw-copy"),
        cl = $("pw-lower"), cu = $("pw-upper"), cd = $("pw-digit"), cs = $("pw-sym"),
        camb = $("pw-ambig"), cbr = $("pw-brackets"), cnr = $("pw-norepeat"),
        crackFast = $("pw-crack-fast"), crackOnline = $("pw-crack-online"),
        check = $("pw-check"), checkOut = $("pw-checkout"), checkBar = $("pw-checkbar"),
        checkBits = $("pw-checkbits"), checkRating = $("pw-checkrating"), checkNote = $("pw-checknote"),
        checkCrackFast = $("pw-checkcrack-fast"), checkCrackOnline = $("pw-checkcrack-online");
    var RATE_FAST = 1e11, RATE_ONLINE = 100; // guesses/sec: offline GPU vs rate-limited login
    if (!go) return;
    var SETS = {
      lower: "abcdefghijklmnopqrstuvwxyz",
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      digit: "0123456789",
      sym: "!@#$%^&*()-_=+[]{};:,.<>?/"
    };
    var AMBIG = "0O1lI|", BRACKETS = "()[]{}<>";

    function build() {
      var pool = "";
      if (cl.checked) pool += SETS.lower;
      if (cu.checked) pool += SETS.upper;
      if (cd.checked) pool += SETS.digit;
      if (cs.checked) pool += SETS.sym;
      var strip = "";
      if (camb.checked) strip += AMBIG;
      if (cbr.checked) strip += BRACKETS;
      if (strip) pool = pool.split("").filter(function (c) { return strip.indexOf(c) === -1; }).join("");
      return pool;
    }
    function gen() {
      var pool = build();
      if (!pool) { err.textContent = "Select at least one character set."; show(err); hide(out); return; }
      var n = parseInt(len.value, 10), noRepeat = cnr.checked, note = "";
      if (noRepeat && n > pool.length) {
        n = pool.length;
        note = " (capped at " + n + " — the character pool has no more unique characters)";
      }
      hide(err);
      var pw = "";
      if (noRepeat) {
        var chars = pool.split("");
        for (var i = 0; i < n; i++) pw += chars.splice(randInt(chars.length), 1)[0];
      } else {
        for (var j = 0; j < n; j++) pw += pool[randInt(pool.length)];
      }
      val.textContent = pw;
      var bits = Math.round(n * Math.log2(pool.length));
      bitsEl.textContent = bits + " bits entropy";
      poolEl.textContent = pool.length + (note ? "" : "");
      var s = pwStrength(bits);
      rating.textContent = s.label + note;
      crackFast.textContent = pwCrackTime(bits, RATE_FAST);
      crackOnline.textContent = pwCrackTime(bits, RATE_ONLINE);
      bar.style.width = Math.min(100, Math.round(bits / 128 * 100)) + "%";
      bar.style.background = s.color;
      show(out);
    }

    function analyze() {
      var p = check.value;
      if (!p) { hide(checkOut); return; }
      var pool = 0;
      if (/[a-z]/.test(p)) pool += 26;
      if (/[A-Z]/.test(p)) pool += 26;
      if (/[0-9]/.test(p)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(p)) pool += 32;
      var uniq = (new Set(p.split(""))).size;
      var bits = Math.round(p.length * Math.log2(pool || 1));
      var s = pwStrength(bits);
      checkBits.textContent = bits + " bits";
      checkRating.textContent = s.label;
      checkNote.textContent = p.length + " chars, " + uniq + " unique";
      checkCrackFast.textContent = pwCrackTime(bits, RATE_FAST);
      checkCrackOnline.textContent = pwCrackTime(bits, RATE_ONLINE);
      checkBar.style.width = Math.min(100, Math.round(bits / 128 * 100)) + "%";
      checkBar.style.background = s.color;
      show(checkOut);
    }

    len.addEventListener("input", function () { lenval.textContent = len.value; });
    go.addEventListener("click", gen);
    [cl, cu, cd, cs, camb, cbr, cnr].forEach(function (c) { c.addEventListener("change", gen); });
    copy.addEventListener("click", function () {
      navigator.clipboard && navigator.clipboard.writeText(val.textContent).then(function () {
        copy.textContent = "copied"; setTimeout(function () { copy.textContent = "copy"; }, 1200);
      });
    });
    check.addEventListener("input", analyze);
    gen();
  }

  /* ---------------------------------------------------------------- base64 */
  function initBase64() {
    var inp = $("b64-in"), outp = $("b64-out"), enc = $("b64-enc"), dec = $("b64-dec"),
        copy = $("b64-copy"), swap = $("b64-swap"), err = $("b64-err");
    if (!inp) return;
    function fail(m) { err.textContent = m; show(err); }
    function setMode(encoding) {
      enc.classList.toggle("ghost", !encoding);
      dec.classList.toggle("ghost", encoding);
    }
    function encode() {
      hide(err); setMode(true);
      try { outp.value = btoa(unescape(encodeURIComponent(inp.value))); }
      catch (e) { fail("Couldn't encode that text."); }
    }
    function decode() {
      hide(err); setMode(false);
      try { outp.value = decodeURIComponent(escape(atob(inp.value.trim()))); }
      catch (e) { fail("That isn't valid Base64."); }
    }
    enc.addEventListener("click", encode);
    dec.addEventListener("click", decode);
    copy.addEventListener("click", function () {
      navigator.clipboard && navigator.clipboard.writeText(outp.value);
    });
    swap.addEventListener("click", function () { inp.value = outp.value; outp.value = ""; });
  }

  /* ------------------------------------------------------------------- url */
  function initUrl() {
    var inp = $("url-in"), outp = $("url-out"), enc = $("url-enc"), dec = $("url-dec"),
        comp = $("url-component"), compwrap = $("url-compwrap"),
        copy = $("url-copy"), swap = $("url-swap"), err = $("url-err");
    if (!inp) return;
    function setMode(mode) {
      var encoding = mode === "encode";
      enc.classList.toggle("ghost", !encoding);
      dec.classList.toggle("ghost", encoding);
      compwrap.hidden = !encoding;
    }
    function encode() {
      hide(err); setMode("encode");
      outp.value = comp.checked ? encodeURIComponent(inp.value) : encodeURI(inp.value);
    }
    function decode() {
      hide(err); setMode("decode");
      try { outp.value = decodeURIComponent(inp.value.trim()); }
      catch (e) { err.textContent = "That isn't valid percent-encoded text."; show(err); }
    }
    enc.addEventListener("click", encode);
    dec.addEventListener("click", decode);
    copy.addEventListener("click", function () { navigator.clipboard && navigator.clipboard.writeText(outp.value); });
    swap.addEventListener("click", function () { inp.value = outp.value; outp.value = ""; });
  }

  /* ------------------------------------------------------------- bandwidth */
  function initBandwidth() {
    var size = $("bw-size"), sizeU = $("bw-sizeunit"), speed = $("bw-speed"),
        speedU = $("bw-speedunit"), go = $("bw-go"), out = $("bw-out"), timeEl = $("bw-time");
    if (!size) return;
    var K = 1024;
    function bytesOfSize(v, unit) { return v * Math.pow(K, parseInt(unit, 10)); }
    function bitsPerSec(v, unit) {
      if (unit === "kbit") return v * 1000;
      if (unit === "mbit") return v * 1e6;
      if (unit === "gbit") return v * 1e9;
      if (unit === "kibyte") return v * 1024 * 8;
      if (unit === "mbyte") return v * 1024 * 1024 * 8;
      return v;
    }
    function fmtDur(sec) {
      if (!isFinite(sec) || sec < 0) return "—";
      if (sec < 1) return (sec * 1000).toFixed(0) + " ms";
      var u = [["d", 86400], ["h", 3600], ["m", 60], ["s", 1]], parts = [], rem = sec;
      for (var i = 0; i < u.length; i++) {
        var q = Math.floor(rem / u[i][1]);
        if (q > 0 || (parts.length && u[i][0] === "s")) { parts.push(q + u[i][0]); rem -= q * u[i][1]; }
      }
      return parts.slice(0, 3).join(" ") || "0s";
    }
    function calcTime() {
      var bytes = bytesOfSize(parseFloat(size.value) || 0, sizeU.value);
      var bps = bitsPerSec(parseFloat(speed.value) || 0, speedU.value);
      var sec = bytes * 8 / bps;
      timeEl.innerHTML = "<span class=\"ta-big\">≈ " + fmtDur(sec) + "</span>" +
        "<span class=\"ta-sub\">to transfer " +
        (bytes / (K * K)).toLocaleString(undefined, { maximumFractionDigits: 1 }) + " MB at " +
        (bps / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 }) + " Mbps</span>";
      show(out);
    }
    go.addEventListener("click", calcTime);
    [size, sizeU, speed, speedU].forEach(function (e) { e.addEventListener("input", calcTime); });
    calcTime();
  }

  /* --------------------------------------------------------------- convert */
  function initConvert() {
    var conv = $("sc-val"), convU = $("sc-unit"), out = $("sc-out"), body = $("sc-body");
    if (!conv) return;
    var FACT = {
      B: 1,
      KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15,
      KiB: 1024, MiB: Math.pow(1024, 2), GiB: Math.pow(1024, 3),
      TiB: Math.pow(1024, 4), PiB: Math.pow(1024, 5)
    };
    var rows = ["B", "KB", "KiB", "MB", "MiB", "GB", "GiB", "TB", "TiB", "PB", "PiB"];
    function convert() {
      var bytes = (parseFloat(conv.value) || 0) * FACT[convU.value];
      body.innerHTML = rows.map(function (u) {
        var v = bytes / FACT[u];
        return "<tr><th>" + u + "</th><td>" + v.toLocaleString(undefined, { maximumFractionDigits: 6 }) + "</td></tr>";
      }).join("") + "<tr><th>bits</th><td>" +
        (bytes * 8).toLocaleString(undefined, { maximumFractionDigits: 0 }) + "</td></tr>";
      show(out);
    }
    [conv, convU].forEach(function (e) { e.addEventListener("input", convert); });
    convert();
  }

  /* ------------------------------------------------------------- timestamp */
  function initTimestamp() {
    var now = $("ts-now"), nowsub = $("ts-nowsub"), copy = $("ts-copy"),
        epoch = $("ts-epoch"), unit = $("ts-unit"), out1 = $("ts-out1"), body1 = $("ts-body1"), err1 = $("ts-err1"),
        date = $("ts-date"), out2 = $("ts-out2"), body2 = $("ts-body2");
    if (!now) return;

    function rel(ms) {
      var d = Date.now() - ms, fut = d < 0; d = Math.abs(d);
      var u = [["year", 31536e6], ["day", 864e5], ["hour", 36e5], ["minute", 6e4], ["second", 1e3]];
      for (var i = 0; i < u.length; i++) {
        var q = Math.floor(d / u[i][1]);
        if (q >= 1) return (fut ? "in " : "") + q + " " + u[i][0] + (q > 1 ? "s" : "") + (fut ? "" : " ago");
      }
      return "just now";
    }
    function rows(ms) {
      var d = new Date(ms);
      return [
        ["Local", d.toLocaleString()],
        ["UTC", d.toUTCString()],
        ["ISO 8601", d.toISOString()],
        ["Relative", rel(ms)],
        ["Epoch (s)", Math.floor(ms / 1000)],
        ["Epoch (ms)", ms]
      ];
    }
    function fill(tbody, ms) {
      tbody.innerHTML = rows(ms).map(function (r) {
        return "<tr><th>" + r[0] + "</th><td class=\"mono\">" + r[1] + "</td></tr>";
      }).join("");
    }

    function tick() {
      var s = Math.floor(Date.now() / 1000);
      now.textContent = s;
      nowsub.textContent = Date.now() + " ms · " + new Date().toLocaleString();
    }
    tick(); setInterval(tick, 1000);
    copy.addEventListener("click", function () {
      navigator.clipboard && navigator.clipboard.writeText(String(Math.floor(Date.now() / 1000))).then(function () {
        copy.textContent = "copied"; setTimeout(function () { copy.textContent = "copy"; }, 1200);
      });
    });

    function fromEpoch() {
      var v = epoch.value.trim();
      if (v === "") { hide(out1); hide(err1); return; }
      var n = Number(v);
      if (!isFinite(n)) { err1.textContent = "Enter a numeric timestamp."; show(err1); hide(out1); return; }
      hide(err1);
      var ms = unit.value === "ms" ? n : n * 1000;
      fill(body1, ms); show(out1);
    }
    function fromDate() {
      if (!date.value) { hide(out2); return; }
      var ms = new Date(date.value).getTime();
      if (!isFinite(ms)) { hide(out2); return; }
      fill(body2, ms); show(out2);
    }
    [epoch, unit].forEach(function (e) { e.addEventListener("input", fromEpoch); });
    date.addEventListener("input", fromDate);

    // prefill with the current time as a live example
    epoch.value = Math.floor(Date.now() / 1000); fromEpoch();
    var d = new Date(), pad = function (x) { return (x < 10 ? "0" : "") + x; };
    date.value = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      "T" + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
    fromDate();
  }

  /* ----------------------------------------------------------------- sleep */
  function initSleep() {
    var now = $("sl-now"), nowOut = $("sl-nowout"), nowTimes = $("sl-nowtimes"),
        cycle = $("sl-cycle"), latency = $("sl-latency"),
        wake = $("sl-wake"), bedBtn = $("sl-bed"), bedOut = $("sl-bedout"), bedTimes = $("sl-bedtimes"),
        bedtime = $("sl-bedtime"), wakeBtn = $("sl-waketime"), wakeOut = $("sl-wakeout"), wakeTimes = $("sl-waketimes");
    if (!now) return;
    function fmt(mins) {
      mins = ((mins % 1440) + 1440) % 1440;
      var h = Math.floor(mins / 60), m = mins % 60, ap = h < 12 ? "AM" : "PM";
      var hh = h % 12; if (hh === 0) hh = 12;
      return hh + ":" + (m < 10 ? "0" : "") + m + " " + ap;
    }
    function parse(t) { var p = t.split(":"); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
    function cyc() { return parseInt(cycle.value, 10) || 90; }
    function lat() { return parseInt(latency.value, 10) || 0; }
    function chip(t, n) {
      return '<span class="sl-chip"><b>' + t + '</b><span>' + n + ' cycle' + (n > 1 ? 's' : '') +
        ' · ' + (n * cyc() / 60).toFixed(1) + 'h</span></span>';
    }
    function bedtimesFor(wakeMin) {
      var html = "";
      for (var n = 6; n >= 3; n--) html += chip(fmt(wakeMin - n * cyc() - lat()), n);
      bedTimes.innerHTML = html; show(bedOut);
    }
    function waketimesInto(el, outEl, startMin) {
      var start = startMin + lat(), html = "";
      for (var n = 3; n <= 6; n++) html += chip(fmt(start + n * cyc()), n);
      el.innerHTML = html; show(outEl);
    }
    now.addEventListener("click", function () { var d = new Date(); waketimesInto(nowTimes, nowOut, d.getHours() * 60 + d.getMinutes()); });
    bedBtn.addEventListener("click", function () { bedtimesFor(parse(wake.value)); });
    wakeBtn.addEventListener("click", function () { waketimesInto(wakeTimes, wakeOut, parse(bedtime.value)); });
    [cycle, latency].forEach(function (e) { e.addEventListener("input", function () {
      if (!bedOut.hidden) bedtimesFor(parse(wake.value));
      if (!wakeOut.hidden) waketimesInto(wakeTimes, wakeOut, parse(bedtime.value));
    }); });
  }

  /* ------------------------------------------------------------------- tip */
  function initTip() {
    var bill = $("tip-bill"), pct = $("tip-pct"), split = $("tip-split"),
        body = $("tip-body"), compare = $("tip-compare");
    if (!bill) return;
    function money(v) { return "$" + (isFinite(v) ? v : 0).toFixed(2); }
    function calc() {
      var b = parseFloat(bill.value) || 0, p = parseFloat(pct.value) || 0, s = Math.max(1, parseInt(split.value, 10) || 1);
      var tip = b * p / 100, total = b + tip;
      body.innerHTML =
        "<tr><th>tip (" + p + "%)</th><td>" + money(tip) + "</td></tr>" +
        "<tr><th>total</th><td>" + money(total) + "</td></tr>" +
        (s > 1 ? "<tr><th>per person (" + s + ")</th><td>" + money(total / s) + "</td></tr>" : "");
      compare.innerHTML = [10, 15, 18, 20, 25].map(function (x) {
        var t = b * x / 100, tot = b + t;
        return "<tr><td>" + x + "%</td><td>" + money(t) + "</td><td>" + money(tot) + "</td><td>" + money(tot / s) + "</td></tr>";
      }).join("");
    }
    [bill, pct, split].forEach(function (e) { e.addEventListener("input", calc); });
    calc();
  }

  /* -------------------------------------------------------------- one-rep max */
  function initOneRepMax() {
    var weight = $("orm-weight"), unit = $("orm-unit"), reps = $("orm-reps"),
        out = $("orm-out"), maxEl = $("orm-max"), formulas = $("orm-formulas"),
        body = $("orm-body"), err = $("orm-err");
    if (!weight) return;
    var PCTS = [[100, 1], [95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [65, 16], [60, 20]];
    function calc() {
      var w = parseFloat(weight.value) || 0, r = parseInt(reps.value, 10);
      if (w <= 0 || !(r >= 1 && r <= 15)) {
        err.textContent = "Enter a weight and 1–15 reps."; show(err); hide(out); return;
      }
      hide(err);
      var u = unit.value, step = u === "kg" ? 2.5 : 5;
      var rnd = function (x) { return Math.round(x / step) * step; };
      var epley = r === 1 ? w : w * (1 + r / 30);
      var brzycki = r === 1 ? w : w * 36 / (37 - r);
      var orm = (epley + brzycki) / 2;
      maxEl.textContent = "≈ " + Math.round(orm) + " " + u + " one-rep max";
      formulas.textContent = "Epley " + Math.round(epley) + " · Brzycki " + Math.round(brzycki) +
        " · from " + w + " " + u + " × " + r;
      body.innerHTML = PCTS.map(function (p) {
        return "<tr><td>" + p[0] + "%</td><td class=\"mono\">" + rnd(orm * p[0] / 100) + " " + u +
          "</td><td>" + p[1] + "</td></tr>";
      }).join("");
      show(out);
    }
    [weight, unit, reps].forEach(function (e) { e.addEventListener("input", calc); });
    calc();
  }

  /* ------------------------------------------------------ strength standards */
  function initStrength() {
    var sex = $("st-sex"), lift = $("st-lift"), bw = $("st-bw"), unit = $("st-unit"),
        wt = $("st-weight"), out = $("st-out"), levelEl = $("st-level"), ratioEl = $("st-ratio"),
        bar = $("st-bar"), body = $("st-body"), err = $("st-err");
    if (!sex) return;
    var NAMES = ["Beginner", "Novice", "Intermediate", "Advanced", "Elite"];
    var LIFTNAME = { bench: "Bench Press", squat: "Squat", deadlift: "Deadlift", ohp: "Overhead Press" };
    var STD = {
      male: {
        bench: [0.5, 0.75, 1.0, 1.5, 2.0], squat: [0.75, 1.25, 1.5, 2.25, 2.75],
        deadlift: [1.0, 1.5, 2.0, 2.5, 3.0], ohp: [0.35, 0.5, 0.7, 0.9, 1.1]
      },
      female: {
        bench: [0.35, 0.5, 0.75, 1.0, 1.5], squat: [0.5, 0.75, 1.25, 1.75, 2.25],
        deadlift: [0.5, 1.0, 1.25, 1.75, 2.5], ohp: [0.2, 0.35, 0.5, 0.75, 1.0]
      }
    };
    function calc() {
      var b = parseFloat(bw.value) || 0, w = parseFloat(wt.value) || 0;
      if (b <= 0 || w <= 0) { err.textContent = "Enter your bodyweight and lift."; show(err); hide(out); return; }
      hide(err);
      var std = STD[sex.value][lift.value], u = unit.value, step = u === "kg" ? 2.5 : 5;
      var rnd = function (x) { return Math.round(x / step) * step; };
      var ratio = w / b, tier = -1;
      for (var k = 0; k < 5; k++) if (ratio >= std[k]) tier = k;
      var level = tier < 0 ? "Untrained" : NAMES[tier];
      levelEl.textContent = level;
      ratioEl.textContent = LIFTNAME[lift.value] + " · " + ratio.toFixed(2) + "× bodyweight (" +
        w + " " + u + " @ " + b + " " + u + ")";
      bar.innerHTML = NAMES.map(function (n, i) {
        var cls = "st-seg" + (tier >= i ? " on" : "") + (tier === i ? " cur" : "");
        return '<div class="' + cls + '"><div class="st-fill"></div>' + n + '</div>';
      }).join("");
      body.innerHTML = NAMES.map(function (n, i) {
        var cur = tier === i ? ' class="cur"' : "";
        return "<tr" + cur + "><th>" + n + "</th><td class=\"mono\">" + rnd(std[i] * b) + " " + u +
          "</td><td>" + std[i].toFixed(2) + "×</td></tr>";
      }).join("");
      show(out);
    }
    [sex, lift, bw, unit, wt].forEach(function (e) { e.addEventListener("input", calc); });
    calc();
  }

  /* ------------------------------------------------------------------ dice */
  function initDice() {
    var count = $("dc-count"), faces = $("dc-faces"), go = $("dc-go"),
        out = $("dc-out"), dice = $("dc-dice"), sum = $("dc-sum"), err = $("dc-err"),
        presets = document.querySelectorAll("#dc-out ~ .dc-presets [data-faces], .dc-presets [data-faces]");
    if (!go) return;
    function roll() {
      var n = parseInt(count.value, 10), f = parseInt(faces.value, 10);
      if (!(n >= 1 && n <= 100) || !(f >= 2 && f <= 1000)) {
        err.textContent = "Use 1–100 dice with 2–1000 faces."; show(err); hide(out); return;
      }
      hide(err);
      var total = 0, html = "";
      for (var i = 0; i < n; i++) { var r = randInt(f) + 1; total += r; html += '<span class="dc-die">' + r + '</span>'; }
      dice.innerHTML = html;
      sum.textContent = n + "d" + f + "  →  total " + total + (n > 1 ? "  ·  avg " + (total / n).toFixed(1) : "");
      show(out);
    }
    go.addEventListener("click", roll);
    document.querySelectorAll(".dc-presets [data-faces]").forEach(function (btn) {
      btn.addEventListener("click", function () { faces.value = btn.getAttribute("data-faces"); roll(); });
    });
    roll();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSubnet();
    initDns();
    initChecksum();
    initPassword();
    initBase64();
    initUrl();
    initBandwidth();
    initConvert();
    initTimestamp();
    initSleep();
    initTip();
    initOneRepMax();
    initStrength();
    initDice();
  });
})();
