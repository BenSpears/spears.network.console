/* Register the service worker (skips localhost to avoid dev caching headaches). */
(function () {
  if (!("serviceWorker" in navigator)) return;
  var h = location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h === "") return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () { /* no-op */ });
  });
})();
