/* Runs in <head> before paint. Enables JS-only styling and applies the saved
   window state (full width / hidden terminal) so there's no flash. */
(function () {
  var d = document.documentElement;
  d.classList.remove("no-js");
  d.classList.add("js");
  // mac vs. everything else, for the ⌘K / Ctrl K shortcut label (no flash)
  var p = navigator.userAgentData && navigator.userAgentData.platform || navigator.platform || "";
  if (/mac|iphone|ipad/i.test(p)) d.classList.add("mac");
  try {
    if (localStorage.getItem("sn_full") === "1") d.classList.add("full");
    if (localStorage.getItem("sn_termhidden") === "1") d.classList.add("term-hidden");
    if (localStorage.getItem("sn_mode") === "light") d.classList.add("light");
  } catch (e) {}
})();
