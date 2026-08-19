/* spears.network — live filter for the /tools/ tile grid. */
(function () {
  "use strict";
  var inp = document.getElementById("tools-filter");
  if (!inp) return;
  var grids = [].slice.call(document.querySelectorAll(".appgrid"));
  var empty = document.getElementById("tools-empty"), emptyQ = document.getElementById("tools-empty-q");
  function run() {
    var q = inp.value.trim().toLowerCase(), total = 0;
    grids.forEach(function (grid) {
      var label = grid.previousElementSibling, any = false;
      [].slice.call(grid.querySelectorAll(".appcard")).forEach(function (card) {
        var show = !q || (card.textContent || "").toLowerCase().indexOf(q) > -1;
        card.style.display = show ? "" : "none";
        if (show) { any = true; total++; }
      });
      grid.style.display = any ? "" : "none";
      if (label && label.classList.contains("group-label")) label.style.display = any ? "" : "none";
    });
    if (empty) {
      var none = q && total === 0;
      empty.hidden = !none;
      if (none && emptyQ) emptyQ.textContent = inp.value.trim();
    }
  }
  inp.addEventListener("input", run);
})();
