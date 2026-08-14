/* =========================================================================
   spears.network — terminal engine (hybrid: type commands OR click)
   Consumes window.SITE (generated) and window.__PATH__ (per page).
   ========================================================================= */
(function () {
  "use strict";

  // data comes from a CSP-safe <script type="application/json"> block
  var D = {};
  try {
    var _dataEl = document.getElementById("sn-data");
    if (_dataEl) D = JSON.parse(_dataEl.getAttribute("data-sn"));
  } catch (e) { D = {}; }

  var SITE = { posts: D.posts || [], apps: D.apps || [], appdocs: D.appdocs || [], tools: D.tools || [] };
  var CUR = D.path || "/";
  var BUILD = D.build || {};

  // ---- helpers -----------------------------------------------------------
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
  function go(url) { window.location.href = url; }
  function shortPath(p) {
    if (p === "/" || p === "") return "~";
    return "~" + p.replace(/\/$/, "");
  }

  var input = el("cmd"), consoleEl = el("console"), caret = el("caret");

  function scrollConsole() {
    if (consoleEl) consoleEl.scrollTop = consoleEl.scrollHeight;
  }

  // ---- command echo / output --------------------------------------------
  function echoCmd(raw) {
    var line = document.createElement("div");
    line.className = "line cmd";
    line.innerHTML = '<span class="p">guest@spears.network</span>:<span class="path">' +
      esc(shortPath(CUR)) + "</span>$ " + esc(raw);
    consoleEl.appendChild(line);
  }
  function print(html) {
    var out = document.createElement("div");
    out.className = "line out";
    out.innerHTML = html;
    consoleEl.appendChild(out);
    scrollConsole();               // scroll the panel, never the page
  }
  function err(msg) { print('<span class="err">' + esc(msg) + "</span>"); }

  // ---- navigation targets ------------------------------------------------
  var SECTIONS = {
    "": "/", "~": "/", "/": "/", "home": "/",
    "about": "/about/", "about/": "/about/",
    "posts": "/posts/", "posts/": "/posts/", "blog": "/posts/",
    "apps": "/apps/", "apps/": "/apps/",
    "tools": "/tools/", "tools/": "/tools/",
    "links": "/links/", "links/": "/links/"
  };
  function parentPath(p) {
    p = (p || "/").replace(/\/+$/, "");           // strip trailing slash
    if (p === "" || p === "/") return "/";
    var i = p.lastIndexOf("/");
    var up = p.slice(0, i);
    return up === "" ? "/" : up + "/";
  }
  function resolveTarget(name) {
    if (name == null) return null;
    var t0 = name.trim();
    if (t0 === ".") return CUR;                    // stay
    if (t0 === ".." || t0 === "../") return parentPath(CUR);  // up one level
    var n = t0.toLowerCase().replace(/^\.?\//, "").replace(/\/+$/, "");
    if (SECTIONS.hasOwnProperty(name)) return SECTIONS[name];
    if (SECTIONS.hasOwnProperty(n)) return SECTIONS[n];
    var byNum = parseInt(n, 10);
    if (!isNaN(byNum) && CUR.indexOf("/posts") === 0 && SITE.posts[byNum - 1])
      return SITE.posts[byNum - 1].url;
    var hit = SITE.posts.concat(SITE.apps, SITE.appdocs, SITE.tools).filter(function (i) {
      return i.slug === n || i.slug.indexOf(n) === 0;
    })[0];
    return hit ? hit.url : null;
  }

  // ---- command table -----------------------------------------------------
  var COMMANDS = {
    help: function () {
      print(
        '<span class="k">available commands</span>\n' +
        "  help              this menu\n" +
        "  ls [dir]          list sections or entries\n" +
        "  cd &lt;dir&gt;          change section  (about · posts · apps · tools · links · ~)\n" +
        "  cat &lt;post&gt;        open a post by name or number\n" +
        "  open &lt;app&gt;        open an app privacy/support page\n" +
        "  &lt;tool&gt;            type a tool name to open it  (e.g. subnet)\n" +
        "  grep &lt;term&gt;       search posts &amp; pages  ( / )\n" +
        "  about             who is Benjamin Spears\n" +
        "  whoami            current session identity\n" +
        "  neofetch          system + profile card\n" +
        "  privacy           what any site can detect about you\n" +
        "  resume            professional summary\n" +
        "  status            build &amp; systems status\n" +
        "  contact           ways to reach me\n" +
        "  theme             cycle accent colour\n" +
        "  light | dark      switch colour mode\n" +
        "  clear             clear the console\n" +
        "  banner            print the logo\n" +
        "  reboot            reload from root\n" +
        "  shutdown          power off the terminal\n" +
        '  <span class="k">tip:</span> <b>⌘/Ctrl+K</b> command palette · <b>Tab</b> autocompletes · <b>↑/↓</b> history'
      );
    },
    ls: function (a) {
      var dir = a[0] ? a[0].toLowerCase().replace(/\/$/, "") : curSection();
      if (dir === "" || dir === "~" || dir === "/" || dir === "home") {
        print(
          '<a href="/about/">about/</a>   <a href="/posts/">posts/</a>   ' +
          '<a href="/apps/">apps/</a>   <a href="/tools/">tools/</a>   <a href="/links/">links/</a>'
        );
      } else if (dir === "tools") {
        print(SITE.tools.map(function (t) {
          return "  <a href='" + t.url + "'>" + esc(t.slug) + "</a>" +
            '  <span class="muted">' + esc(t.title) + "</span>";
        }).join("\n") + "\n  <span class=\"k\">type a tool name</span> (e.g. <b>subnet</b>) to open it");
      } else if (dir === "posts" || dir === "blog") {
        print(SITE.posts.map(function (p, i) {
          return "  " + String(i + 1).padStart(2, "0") + "  " +
            '<span class="k">' + p.date + "</span>  " +
            '<a href="' + p.url + '">' + esc(p.title) + "</a>";
        }).join("\n"));
      } else if (dir === "apps") {
        print(SITE.apps.map(function (p) {
          return "  <a href='" + p.url + "'>" + esc(p.title) + "</a>";
        }).join("\n") + "\n  <span class=\"k\">open &lt;app&gt;</span> for details — each has privacy &amp; support");
      } else if (dir === "about") { print('<a href="/about/">about/index</a>'); }
      else if (dir === "links") { print('<a href="/links/">links/index</a>'); }
      else { err("ls: " + dir + ": no such directory"); }
    },
    cd: function (a) {
      var t = resolveTarget(a[0] || "");
      if (t) go(t); else err("cd: " + (a[0] || "") + ": no such section");
    },
    cat: function (a) {
      if (!a[0]) return err("cat: missing operand");
      var t = resolveTarget(a[0]);
      if (t) go(t); else err("cat: " + a[0] + ": not found");
    },
    open: function (a) { return COMMANDS.cat(a); },
    grep: function (a) {
      var q = a.join(" ").trim();
      if (!q) return err("grep: usage — grep &lt;term&gt;");
      print('searching for <span class="k">' + esc(q) + "</span>…");
      loadSearch(function (idx, error) {
        if (error || !idx) return err("grep: search index unavailable");
        var ql = q.toLowerCase();
        var hits = idx.filter(function (it) {
          return ((it.title || "") + " " + (it.text || "")).toLowerCase().indexOf(ql) > -1;
        });
        if (!hits.length) return print('grep: no matches for <span class="k">' + esc(q) + "</span>");
        print('<span class="k">' + hits.length + " match" + (hits.length > 1 ? "es" : "") +
          '</span> for "' + esc(q) + '"\n' +
          hits.slice(0, 12).map(function (it) {
            return '  <a href="' + it.url + '">' + esc(it.title) + "</a> " +
              '<span class="muted">' + esc(it.section || "") + (it.date ? " · " + esc(it.date) : "") + "</span>\n" +
              '    <span class="muted">' + snippet(it.text || "", ql) + "</span>";
          }).join("\n"));
      });
    },
    about: function () { go("/about/"); },
    posts: function () { go("/posts/"); },
    apps: function () { go("/apps/"); },
    links: function () { go("/links/"); },
    home: function () { go("/"); },
    whoami: function () {
      print('guest@spears.network — read access. type <span class="k">contact</span> to reach the owner.');
    },
    contact: function () {
      print(
        "  email      <a href='mailto:benbox.arrive873@passmail.com'>benbox.arrive873@passmail.com</a>\n" +
        "  linkedin   <a href='https://www.linkedin.com/in/benjamin-spears-967927152' target='_blank' rel='noopener'>benjamin-spears</a>"
      );
    },
    neofetch: function () { print(NEOFETCH_HTML()); },
    privacy: function () { renderPrivacy(); },
    resume: function () { print(RESUME_HTML()); },
    status: function () { print(STATUS_HTML()); },
    palette: function () { openPalette(); },
    banner: function () {
      print('<pre style="color:var(--accent);margin:0">' + esc(LOGO) + "</pre>");
    },
    echo: function (a) { print(esc(a.join(" "))); },
    date: function () { print(new Date().toString()); },
    pwd: function () { print(CUR); },
    history: function () {
      print(HIST.map(function (h, i) { return "  " + (i + 1) + "  " + esc(h); }).join("\n") || "  (empty)");
    },
    clear: function () { consoleEl.innerHTML = ""; },
    reboot: function () {
      print('<span class="k">rebooting spears.network…</span>');
      setTimeout(function () { window.location.href = "/"; }, 450);
    },
    shutdown: function () {
      print('<span class="k">shutting down…</span> terminal halted — reload to power back on.');
      setTimeout(function () { document.documentElement.classList.add("term-off"); }, 650);
    },
    theme: function () { cycleTheme(); print('accent → <span class="k">' + THEMES[themeIdx] + "</span>"); },
    light: function () { setMode("light"); print('mode → <span class="k">light</span>'); },
    dark: function () { setMode("dark"); print('mode → <span class="k">dark</span>'); },
    mode: function () {
      var toDark = document.documentElement.classList.contains("light");
      setMode(toDark ? "dark" : "light");
      print('mode → <span class="k">' + (toDark ? "dark" : "light") + "</span>");
    },
    sudo: function () { err("guest is not in the sudoers file. This incident will be reported. 😉"); },
    exit: function () { print("there is no escape from the terminal. try <span class='k'>cd ~</span>"); }
  };
  var ALIASES = { ll: "ls", dir: "ls", man: "help", "?": "help", quit: "exit", email: "contact",
    fingerprint: "privacy", whatyouknow: "privacy", cv: "resume", restart: "reboot",
    poweroff: "shutdown", halt: "shutdown", search: "grep", find: "grep" };

  // ---- client-side search (index generated at /index.json) ----------------
  var SEARCH_IDX = null, SEARCH_LOADING = false, SEARCH_CBS = [];
  function loadSearch(cb) {
    if (SEARCH_IDX) return cb(SEARCH_IDX);
    SEARCH_CBS.push(cb);
    if (SEARCH_LOADING) return;
    SEARCH_LOADING = true;
    fetch("/index.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) { SEARCH_IDX = d; SEARCH_CBS.forEach(function (f) { f(d); }); SEARCH_CBS = []; })
      .catch(function () { SEARCH_LOADING = false; SEARCH_CBS.forEach(function (f) { f(null, true); }); SEARCH_CBS = []; });
  }
  function snippet(text, ql) {
    text = (text || "").replace(/\s+/g, " ");
    var i = text.toLowerCase().indexOf(ql);
    if (i < 0) return esc(text.slice(0, 120));
    var start = Math.max(0, i - 45);
    var seg = text.slice(start, i + ql.length + 65);
    var m = seg.toLowerCase().indexOf(ql);
    return (start > 0 ? "…" : "") + esc(seg.slice(0, m)) +
      '<span class="k">' + esc(seg.slice(m, m + ql.length)) + "</span>" +
      esc(seg.slice(m + ql.length)) + "…";
  }

  // ---- privacy readout: everything a site passively sees, computed locally ----
  var pvSeq = 0;
  function renderPrivacy() {
    var nav = navigator, ua = nav.userAgent || "";
    function grab(re) { var x = ua.match(re); return x ? x[1] : null; }

    var browser = "unknown";
    if (/Edg\//.test(ua)) browser = "Edge " + (grab(/Edg\/([\d.]+)/) || "");
    else if (/OPR\//.test(ua)) browser = "Opera " + (grab(/OPR\/([\d.]+)/) || "");
    else if (/Firefox\//.test(ua)) browser = "Firefox " + (grab(/Firefox\/([\d.]+)/) || "");
    else if (/Chrome\//.test(ua)) browser = "Chrome " + (grab(/Chrome\/([\d.]+)/) || "");
    else if (/Version\/[\d.]+.*Safari/.test(ua)) browser = "Safari " + (grab(/Version\/([\d.]+)/) || "");
    else if (/Safari\//.test(ua)) browser = "Safari";

    var os = "unknown";
    if (/Windows NT 10/.test(ua)) os = "Windows 10 / 11";
    else if (/Windows/.test(ua)) os = "Windows";
    else if (/Mac OS X ([\d_]+)/.test(ua)) os = "macOS " + (grab(/Mac OS X ([\d_]+)/) || "").replace(/_/g, ".");
    else if (/Android ([\d.]+)/.test(ua)) os = "Android " + (grab(/Android ([\d.]+)/) || "");
    else if (/(iPhone|iPad)/.test(ua)) os = "iOS " + (grab(/OS ([\d_]+)/) || "").replace(/_/g, ".");
    else if (/CrOS/.test(ua)) os = "ChromeOS";
    else if (/Linux/.test(ua)) os = "Linux";
    if (nav.userAgentData && nav.userAgentData.platform) os = nav.userAgentData.platform + " · " + os;

    function gpu() {
      try {
        var c = document.createElement("canvas");
        var gl = c.getContext("webgl") || c.getContext("experimental-webgl");
        if (!gl) return null;
        var ext = gl.getExtension("WEBGL_debug_renderer_info");
        return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : (gl.getParameter(gl.RENDERER) || null);
      } catch (e) { return null; }
    }

    var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    var connStr = conn ? (conn.effectiveType || "?") +
      (conn.downlink ? " · ~" + conn.downlink + " Mbps" : "") +
      (conn.rtt != null ? " · " + conn.rtt + "ms rtt" : "") : "not exposed";

    var tz = "?"; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}
    var offMin = -new Date().getTimezoneOffset();
    function p2(n) { n = Math.abs(n); return (n < 10 ? "0" : "") + n; }
    var offStr = "UTC" + (offMin >= 0 ? "+" : "-") + p2(Math.floor(Math.abs(offMin) / 60)) + ":" + p2(offMin % 60);
    var region = tz.indexOf("/") > -1 ? tz.split("/")[0].replace(/_/g, " ") : tz;

    var dntRaw = nav.doNotTrack || window.doNotTrack || nav.msDoNotTrack;
    var dnt = (dntRaw === "1" || dntRaw === "yes") ? "on" : (dntRaw === "0" ? "off" : "not set");
    var gpc = (nav.globalPrivacyControl === true) ? "on" : (nav.globalPrivacyControl === false ? "off" : "not set");

    var dpr = window.devicePixelRatio || 1;
    var mem = nav.deviceMemory ? "≥ " + nav.deviceMemory + " GB" : "not exposed";
    var cores = nav.hardwareConcurrency || "not exposed";
    var touch = (nav.maxTouchPoints || 0) + " points";
    var langs = (nav.languages && nav.languages.join(", ")) || nav.language || "?";
    var scheme = (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    var g = gpu();

    function row(k, v, cls) {
      return '<div class="pv-row"><span class="pk">' + k + "</span><span" +
        (cls ? ' class="' + cls + '"' : "") + ">" + v + "</span></div>";
    }
    var id = "pv-ip-" + (++pvSeq);
    var html = '<div class="pv"><span class="pv-head">what this page can see about you — computed on your device, sent nowhere</span>';
    html += row("public IP", '<span id="' + id + '">resolving…</span>');
    html += row("region (from tz)", esc(region) + "  ·  " + esc(tz) + "  ·  " + offStr, "muted");
    html += row("browser", esc(browser));
    html += row("operating system", esc(os));
    html += row("languages", esc(langs));
    html += row("screen", screen.width + "×" + screen.height + " @" + dpr + "x · " + (screen.colorDepth || "?") + "-bit");
    html += row("viewport", window.innerWidth + "×" + window.innerHeight);
    html += row("cpu cores", esc(String(cores)));
    html += row("device memory", esc(mem));
    html += row("touch", esc(touch));
    html += row("gpu (WebGL)", g ? esc(g) : '<span class="muted">masked / unavailable</span>');
    html += row("connection", esc(connStr));
    html += row("color scheme", scheme);
    html += row("cookies enabled", nav.cookieEnabled ? "yes" : "no");
    html += row("Do Not Track", dnt === "on" ? "on" : '<span class="warn">' + dnt + "</span>", "");
    html += row("Global Privacy Control", gpc === "on" ? "on" : '<span class="warn">' + gpc + "</span>", "");
    html += '<span class="pv-foot">None of this was uploaded or stored — your browser volunteers all of it to every site you visit. ' +
      'The IP is read from your connection by this site’s own function, not a third party, and isn’t logged. ' +
      'Reduce your footprint with a hardened browser, a VPN, and private DNS — more in <a href="/posts/">posts</a>.</span></div>';
    print(html);

    // first-party IP (Netlify function) — no third-party API, no geo lookup
    fetch("/.netlify/functions/ip", { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) { var e = document.getElementById(id); if (e) e.textContent = (d && d.ip) || "unknown"; })
      .catch(function () {
        var e = document.getElementById(id);
        if (e) e.innerHTML = '<span class="muted">unavailable in local preview — resolves once deployed on Netlify</span>';
      });
  }

  function curSection() {
    if (CUR.indexOf("/posts") === 0) return "posts";
    if (CUR.indexOf("/apps") === 0) return "apps";
    if (CUR.indexOf("/about") === 0) return "about";
    if (CUR.indexOf("/links") === 0) return "links";
    return "";
  }

  // ---- run ---------------------------------------------------------------
  function run(raw) {
    var parts = raw.trim().split(/\s+/);
    var cmd = (parts.shift() || "").toLowerCase();
    if (!cmd) return;
    echoCmd(raw);
    pushHist(raw);
    if (ALIASES[cmd]) cmd = ALIASES[cmd];
    if (COMMANDS[cmd]) COMMANDS[cmd](parts);
    else {
      // a bare page/tool name navigates — require an EXACT match so "s" doesn't jump anywhere
      var t = SECTIONS[cmd];
      if (!t) {
        var hit = SITE.posts.concat(SITE.apps, SITE.appdocs, SITE.tools).filter(function (i) { return i.slug === cmd; })[0];
        t = hit ? hit.url : null;
      }
      if (t) go(t); else err(cmd + ": command not found — type 'help'");
    }
    scrollConsole();
  }

  // ---- history -----------------------------------------------------------
  var HIST = load("hist", []); var hi = HIST.length;
  function pushHist(x) { if (HIST[HIST.length - 1] !== x) HIST.push(x); hi = HIST.length; save("hist", HIST.slice(-50)); }

  // ---- completion --------------------------------------------------------
  function complete(val) {
    var parts = val.split(/\s+/);
    var pool;
    if (parts.length <= 1) {
      pool = Object.keys(COMMANDS).concat(Object.keys(ALIASES));
      var m = pool.filter(function (c) { return c.indexOf(parts[0]) === 0; });
      return m.length === 1 ? m[0] + " " : common(m, parts[0]);
    }
    var last = parts[parts.length - 1].toLowerCase();
    pool = ["about", "posts", "apps", "tools", "links", "~", "home"]
      .concat(SITE.posts.map(function (p) { return p.slug; }))
      .concat(SITE.apps.map(function (p) { return p.slug; }))
      .concat(SITE.appdocs.map(function (p) { return p.slug; }))
      .concat(SITE.tools.map(function (p) { return p.slug; }));
    var mm = pool.filter(function (c) { return c.indexOf(last) === 0; });
    if (!mm.length) return val;
    parts[parts.length - 1] = mm.length === 1 ? mm[0] : lcp(mm) || last;
    return parts.join(" ") + (mm.length === 1 ? " " : "");
  }
  function common(m, cur) { return m.length ? (lcp(m) || cur) : cur; }
  function lcp(arr) {
    if (!arr.length) return "";
    var a = arr.slice().sort(), first = a[0], last = a[a.length - 1], i = 0;
    while (i < first.length && first[i] === last[i]) i++;
    return first.slice(0, i);
  }

  // ---- theme -------------------------------------------------------------
  var THEMES = ["mint", "cyan", "violet", "amber"];
  var THEME_VAL = { mint: "#5ef2a0", cyan: "#56d4dd", violet: "#b98cff", amber: "#ffcf6b" };
  // darker, readable variants for light mode so theme cycling works in both modes
  var THEME_VAL_LIGHT = { mint: "#0f8f5b", cyan: "#0a7ea4", violet: "#6b4fbb", amber: "#b7791f" };
  var themeIdx = load("theme", 0);
  function updateFavicon() {
    try {
      var cs = getComputedStyle(document.documentElement);
      var c = cs.getPropertyValue("--accent").trim() || "#5ef2a0";
      var bg = cs.getPropertyValue("--bg").trim() || "#0a0e12";
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<rect width="100" height="100" rx="22" fill="' + bg + '"/>' +
        '<path d="M28 30 L52 50 L28 70" fill="none" stroke="' + c + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<rect x="56" y="61" width="20" height="10" rx="3" fill="' + c + '"/></svg>';
      var link = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
      if (link) link.href = "data:image/svg+xml," + encodeURIComponent(svg);
    } catch (e) {}
  }
  function applyTheme() {
    var d = document.documentElement;
    var table = d.classList.contains("light") ? THEME_VAL_LIGHT : THEME_VAL;
    d.style.setProperty("--accent", table[THEMES[themeIdx]]);
    updateFavicon();
  }
  function cycleTheme() { themeIdx = (themeIdx + 1) % THEMES.length; save("theme", themeIdx); applyTheme(); }
  function setMode(m) {
    var light = (m === "light");
    document.documentElement.classList.toggle("light", light);
    try { localStorage.setItem("sn_mode", light ? "light" : "dark"); } catch (e) {}
    applyTheme();
  }
  applyTheme();

  // ---- storage -----------------------------------------------------------
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem("sn_" + k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem("sn_" + k, JSON.stringify(v)); } catch (e) {} }

  // ---- input wiring ------------------------------------------------------
  function focusInput() { if (input) { try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); } } }
  function syncCaret() {
    if (!caret || !input) return;
    var span = document.createElement("span");
    span.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font:inherit";
    span.textContent = input.value;
    input.parentNode.appendChild(span);
    caret.style.left = Math.min(span.offsetWidth, input.offsetWidth) + "px";
    span.remove();
  }
  if (input) {
    input.addEventListener("input", syncCaret);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { var v = input.value; input.value = ""; syncCaret(); if (v.trim()) run(v); }
      else if (e.key === "Tab") { e.preventDefault(); input.value = complete(input.value); syncCaret(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (hi > 0) { hi--; input.value = HIST[hi] || ""; syncCaret(); } }
      else if (e.key === "ArrowDown") { e.preventDefault(); if (hi < HIST.length) { hi++; input.value = HIST[hi] || ""; syncCaret(); } }
      else if (e.ctrlKey && e.key.toLowerCase() === "l") { e.preventDefault(); consoleEl.innerHTML = ""; }
    });
    // click inside the terminal panel refocuses input (ignore links / selection)
    var termPanel = document.querySelector(".terminal");
    if (termPanel) termPanel.addEventListener("click", function (e) {
      if (e.target.closest("a, input, button")) return;
      if (window.getSelection().toString()) return;
      focusInput();
    });
    syncCaret();
    window.addEventListener("resize", syncCaret);
    // autofocus, but preventScroll so the page stays at the top on load
    window.addEventListener("load", focusInput);
    focusInput();
  }

  // ---- neofetch (printed inline, no navigation) --------------------------
  function NEOFETCH_HTML() {
    var p = D.profile || {};
    function row(k, v) {
      return '<div><span class="nf-k">' + k + "</span>" + esc(v) + "</div>";
    }
    return '<div class="nf">' +
      '<pre class="nf-logo">' + esc(LOGO) + "</pre>" +
      '<div class="nf-info">' +
        '<div class="nf-title">guest@<span class="k">spears.network</span></div>' +
        '<div class="nf-rule">─────────────────────────</div>' +
        (p.focus ? row("focus", p.focus) : "") +
        (p.hobbies ? row("hobbies", p.hobbies) : "") +
        row("shell", "/bin/spears") +
        (p.uptime ? row("uptime", p.uptime) : "") +
      "</div></div>";
  }

  // ---- resume (CV) --------------------------------------------------------
  function RESUME_HTML() {
    return '<div class="cv">' +
      '<div class="cv-head"><span class="cv-name">Benjamin Spears</span>' +
        '<span class="cv-title">IT Manager — Systems &amp; Infrastructure</span></div>' +
      '<div class="cv-contact">' +
        '<a href="https://www.linkedin.com/in/benjamin-spears-967927152" target="_blank" rel="noopener">LinkedIn</a> · ' +
        '<a href="mailto:ben@spears.network">ben@spears.network</a> · ' +
        '<a href="/">spears.network</a></div>' +
      '<div class="cv-sec"><span class="cv-h">summary</span>' +
        '<p>IT Manager with 10+ years across public-sector, manufacturing, and healthcare ' +
        'environments. Leads infrastructure, systems administration, and IT operations — Palo Alto ' +
        'firewalls, Nutanix virtualization, UniFi networking, Windows &amp; Linux — and builds reliable ' +
        'systems and teams that support business-critical operations.</p></div>' +
      '<div class="cv-sec"><span class="cv-h">experience</span>' +
        '<div class="cv-role"><b>Dickson Medical Associates</b> ' +
          '<span class="cv-when">Dickson, TN · On-site</span>' +
          '<div class="cv-titleline"><span class="t">Information Technology Manager</span><span class="d">Aug 2025 – Present</span></div>' +
          '<div class="cv-titleline"><span class="t">IT Team Lead / Systems Administrator</span><span class="d">Jan 2025 – Aug 2025</span></div>' +
          '<div class="muted" style="margin-top:6px">Leads a small in-house IT team maintaining and improving the core ' +
          'infrastructure behind business-critical operations in healthcare — high-level systems administration plus ' +
          'projects that drive growth. Backend: Palo Alto firewalls, Nutanix infrastructure, and UniFi networking.</div></div>' +
        '<div class="cv-role"><b>IT Systems Administrator</b> — Tennsco Corp. ' +
          '<span class="cv-when">Jun 2019 – Mar 2025 · Dickson, TN</span>' +
          '<div class="muted">Administered the infrastructure for the largest industrial manufacturing chain in ' +
          'Dickson County, supporting nine locations via a ticketing system — networking, security, phone ' +
          'systems, print servers, software, and data management, on-site and remote. Ran Windows and Linux ' +
          'servers and the company’s Nutanix AHV virtualization platform.</div></div>' +
        '<div class="cv-role"><b>Service Desk Specialist</b> — Tennessee Department of Transportation ' +
          '<span class="cv-when">Jan 2015 – Jun 2019 · Nashville, TN</span>' +
          '<div class="muted">Remote Tier 1 &amp; 2 technical support, print server administration, and training ' +
          'new team members. Upgraded and deployed thousands of hardware devices across TDOT campuses statewide.</div></div>' +
        '<div class="cv-role"><b>Computer Sales Associate</b> — Best Buy ' +
          '<span class="cv-when">Sep 2014 – Feb 2015 · Nashville, TN</span></div>' +
      '</div>' +
      '<div class="cv-sec"><span class="cv-h">education</span>' +
        '<div class="cv-role"><b>Associate of Arts &amp; Sciences (AAS), Computer Technology</b> — ' +
          'Nashville State Community College <span class="cv-when">2014 – 2016 · GPA 3.9</span></div></div>' +
      '<div class="cv-sec"><span class="cv-h">core skills</span>' +
        '<div class="cv-skills">Systems administration (Windows &amp; Linux) · Nutanix AHV virtualization · ' +
        'Palo Alto firewalls · UniFi networking · Active Directory / Group Policy · DNS · IT operations · ' +
        'Networking &amp; security · Multi-site support · Print &amp; phone systems · Data management</div></div>' +
      '</div>';
  }

  // ---- status -------------------------------------------------------------
  function STATUS_HTML() {
    var b = BUILD || {};
    var commit = b.commit ? String(b.commit).slice(0, 7) : "local dev";
    function ok(k, v) {
      return '<div class="st-row"><span class="st-dot"></span><span class="st-k">' + k +
        '</span><span class="st-v">' + v + "</span></div>";
    }
    return '<div class="stpanel"><span class="pv-head">systems status</span>' +
      ok("site", "online") +
      ok("TLS", "valid · HSTS") +
      ok("DNS", "resolving") +
      ok("functions", "ready") +
      ok("privacy", "no trackers · no cookies") +
      '<div class="st-meta">build ' + esc(b.time || "—") + " · hugo " + esc(b.hugo || "—") +
      " · " + esc(commit) + "</div></div>";
  }

  // ---- command palette (⌘/Ctrl+K) ----------------------------------------
  var palEl, palInput, palList, palItems = [], palIdx = 0, palFiltered = [];
  function buildPaletteItems() {
    var items = [
      { label: "Home", sub: "~", url: "/" },
      { label: "About", sub: "~/about", url: "/about/" },
      { label: "Posts", sub: "~/posts", url: "/posts/" },
      { label: "Apps", sub: "~/apps", url: "/apps/" },
      { label: "Tools", sub: "~/tools", url: "/tools/" },
      { label: "Links", sub: "~/links", url: "/links/" }
    ];
    SITE.posts.forEach(function (p) { items.push({ label: p.title, sub: "post · " + p.date, url: p.url }); });
    SITE.apps.forEach(function (a) { items.push({ label: a.title, sub: "app", url: a.url }); });
    SITE.tools.forEach(function (t) { items.push({ label: t.title, sub: "tool · " + (t.group || ""), url: t.url }); });
    [["help", "list commands"], ["privacy", "what sites see about you"], ["resume", "professional summary"],
     ["status", "build & systems status"], ["neofetch", "profile card"], ["contact", "reach me"],
     ["theme", "cycle accent"], ["banner", "print logo"], ["reboot", "reload from root"], ["shutdown", "power off · reload to restore"], ["clear", "clear console"]]
      .forEach(function (c) { items.push({ label: c[0], sub: c[1], cmd: c[0] }); });
    return items;
  }
  function fuzzy(q, s) {
    q = q.toLowerCase(); s = s.toLowerCase();
    if (!q) return 0;
    var qi = 0, score = 0, last = -2;
    for (var i = 0; i < s.length && qi < q.length; i++) {
      if (s[i] === q[qi]) { score += (last === i - 1 ? 3 : 1) + (i === 0 ? 2 : 0); last = i; qi++; }
    }
    return qi === q.length ? score + (s.indexOf(q) > -1 ? 5 : 0) : -1;
  }
  function ensurePalette() {
    if (palEl) return;
    palEl = document.createElement("div");
    palEl.className = "palette"; palEl.hidden = true;
    palEl.innerHTML =
      '<div class="palette-box" role="dialog" aria-label="command palette">' +
      '<input id="palette-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Search commands and pages…" aria-label="search">' +
      '<ul id="palette-list"></ul>' +
      '<div class="palette-foot"><span>↑↓ navigate</span><span>↵ open</span><span>esc close</span></div></div>';
    document.body.appendChild(palEl);
    palInput = palEl.querySelector("#palette-input");
    palList = palEl.querySelector("#palette-list");
    palItems = buildPaletteItems();
    palInput.addEventListener("input", renderPalette);
    palInput.addEventListener("keydown", palKey);
    palEl.addEventListener("mousedown", function (e) { if (e.target === palEl) closePalette(); });
  }
  function openPalette() {
    ensurePalette();
    palEl.hidden = false;
    document.documentElement.classList.add("pal-open");
    palInput.value = ""; palIdx = 0; renderPalette();
    setTimeout(function () { palInput.focus(); }, 0);
  }
  function closePalette() {
    if (palEl) { palEl.hidden = true; document.documentElement.classList.remove("pal-open"); }
  }
  function renderPalette() {
    var q = palInput.value.trim();
    palFiltered = palItems.map(function (it) { return { it: it, s: q ? fuzzy(q, it.label + " " + it.sub) : 0 }; })
      .filter(function (x) { return x.s >= 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .map(function (x) { return x.it; });
    if (palIdx >= palFiltered.length) palIdx = 0;
    palList.innerHTML = palFiltered.map(function (it, i) {
      var badge = it.cmd ? '<span class="pal-badge cmd">cmd</span>' : '<span class="pal-badge">go</span>';
      return '<li class="pal-item' + (i === palIdx ? " active" : "") + '" data-i="' + i + '">' +
        badge + '<span class="pal-label">' + esc(it.label) + "</span>" +
        '<span class="pal-sub">' + esc(it.sub) + "</span></li>";
    }).join("") || '<li class="pal-empty">no matches</li>';
    Array.prototype.forEach.call(palList.querySelectorAll(".pal-item"), function (li) {
      li.addEventListener("mouseenter", function () { palIdx = +li.getAttribute("data-i"); highlightPal(); });
      li.addEventListener("click", function () { palIdx = +li.getAttribute("data-i"); choosePalette(); });
    });
  }
  function highlightPal() {
    Array.prototype.forEach.call(palList.children, function (li, i) { li.classList.toggle("active", i === palIdx); });
  }
  function palKey(e) {
    if (e.key === "Escape") { e.preventDefault(); closePalette(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (palIdx < palFiltered.length - 1) { palIdx++; highlightPal(); scrollActivePal(); } }
    else if (e.key === "ArrowUp") { e.preventDefault(); if (palIdx > 0) { palIdx--; highlightPal(); scrollActivePal(); } }
    else if (e.key === "Enter") { e.preventDefault(); choosePalette(); }
  }
  function scrollActivePal() { var a = palList.querySelector(".pal-item.active"); if (a) a.scrollIntoView({ block: "nearest" }); }
  function choosePalette() {
    var it = palFiltered[palIdx]; if (!it) return;
    closePalette();
    if (it.url) { go(it.url); }
    else if (it.cmd) {
      if (document.documentElement.classList.contains("term-hidden")) {
        document.documentElement.classList.remove("term-hidden");
        try { localStorage.setItem("sn_termhidden", "0"); } catch (e) {}
      }
      run(it.cmd);
    }
  }
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (palEl && !palEl.hidden) closePalette(); else openPalette();
    } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = ((e.target && e.target.tagName) || "").toLowerCase();
      if (tag === "input" || tag === "textarea") return;   // let "/" type normally
      if (!input) return;
      e.preventDefault();
      if (docEl.classList.contains("term-hidden")) {
        docEl.classList.remove("term-hidden");
        try { localStorage.setItem("sn_termhidden", "0"); } catch (x) {}
      }
      if (!input.value) input.value = "grep ";
      focusInput(); syncCaret();
    }
  });

  // ---- window controls: green = full width, yellow = hide terminal -------
  var docEl = document.documentElement;
  function toggleState(cls, key) {
    var on = docEl.classList.toggle(cls);
    try { localStorage.setItem(key, on ? "1" : "0"); } catch (e) {}
    syncCaret();
  }
  var btnMax = el("btn-max"), btnMin = el("btn-min");
  if (btnMax) btnMax.addEventListener("click", function () { toggleState("full", "sn_full"); });
  if (btnMin) btnMin.addEventListener("click", function () {
    toggleState("term-hidden", "sn_termhidden");
    if (!docEl.classList.contains("term-hidden")) focusInput();
  });

  // discoverability controls in the console header + reopen chip
  var btnHide = el("btn-hide"), btnReopen = el("btn-reopen"), btnPalette = el("btn-palette");
  if (btnHide) btnHide.addEventListener("click", function () { toggleState("term-hidden", "sn_termhidden"); });
  if (btnReopen) btnReopen.addEventListener("click", function () {
    if (docEl.classList.contains("term-hidden")) { toggleState("term-hidden", "sn_termhidden"); focusInput(); }
  });
  if (btnPalette) btnPalette.addEventListener("click", function () { openPalette(); });

  var btnMode = el("btn-mode");
  if (btnMode) btnMode.addEventListener("click", function () {
    setMode(docEl.classList.contains("light") ? "dark" : "light");
  });

  // ---- copy-to-clipboard buttons on code blocks --------------------------
  (function () {
    var blocks = document.querySelectorAll(".prose pre");
    if (!blocks.length || !navigator.clipboard) return;
    Array.prototype.forEach.call(blocks, function (pre) {
      pre.classList.add("has-copy");
      var btn = document.createElement("button");
      btn.className = "copy-btn"; btn.type = "button"; btn.textContent = "copy";
      btn.setAttribute("aria-label", "copy code");
      btn.addEventListener("click", function () {
        var code = pre.querySelector("code") || pre;
        navigator.clipboard.writeText(code.innerText.replace(/\s+$/, "")).then(function () {
          btn.textContent = "copied"; setTimeout(function () { btn.textContent = "copy"; }, 1400);
        }).catch(function () { btn.textContent = "error"; });
      });
      pre.appendChild(btn);
    });
  })();

  var LOGO = D.logo || "spears.network";
})();
