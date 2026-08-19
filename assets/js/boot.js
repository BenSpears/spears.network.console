/* Home-page boot sequence. External so script-src can stay 'self'. If JS is
   disabled the overlay is hidden by CSS (html.no-js #boot), so nothing traps. */
(function () {
  var b = document.getElementById("boot");
  if (!b) return;
  function clear() { b.classList.add("done"); }
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { clear(); return; }
  try {
    if (sessionStorage.getItem("sn-booted")) { clear(); return; }
    sessionStorage.setItem("sn-booted", "1");
  } catch (e) { /* storage unavailable — fall through and play it */ }
  var lines = [
    "[  ok  ] mounting spears.network filesystem",
    "[  ok  ] starting privacy daemon",
    "[  ok  ] loading profile: Benjamin Spears",
    "[  ok  ] initializing interactive shell",
    "welcome — type help to begin"
  ];
  var i = 0;
  (function step() {
    if (i >= lines.length) { setTimeout(clear, 380); return; }
    b.textContent += lines[i++] + "\n";
    setTimeout(step, 230);
  })();
  setTimeout(clear, 1700); // guaranteed dismissal
})();
