/* spears.network — HTTP status code reference (searchable, offline). */
(function () {
  "use strict";
  // [code, name, meaning]
  var H = [
    [100, "Continue", "Keep sending the request body."],
    [101, "Switching Protocols", "Server is switching protocols as requested (e.g. to WebSocket)."],
    [102, "Processing", "Server received the request but has no response yet (WebDAV)."],
    [103, "Early Hints", "Preload hints sent before the final response."],
    [200, "OK", "Request succeeded."],
    [201, "Created", "Request succeeded and a new resource was created."],
    [202, "Accepted", "Accepted for processing, but not yet completed."],
    [203, "Non-Authoritative Information", "Returned metadata from a copy, not the origin."],
    [204, "No Content", "Success, but there is no body to return."],
    [205, "Reset Content", "Success; the client should reset the form/view."],
    [206, "Partial Content", "Partial data returned for a range request."],
    [207, "Multi-Status", "Multiple status codes for a WebDAV request."],
    [208, "Already Reported", "Members already enumerated (WebDAV)."],
    [226, "IM Used", "Response is the result of instance manipulations."],
    [300, "Multiple Choices", "Several responses are available; pick one."],
    [301, "Moved Permanently", "Resource moved permanently to a new URL."],
    [302, "Found", "Resource temporarily at a different URL."],
    [303, "See Other", "Get the resource from another URL with GET."],
    [304, "Not Modified", "Cached copy is still valid; use it."],
    [307, "Temporary Redirect", "Temporary redirect; keep the same method."],
    [308, "Permanent Redirect", "Permanent redirect; keep the same method."],
    [400, "Bad Request", "The server could not understand the request."],
    [401, "Unauthorized", "Authentication is required or failed."],
    [402, "Payment Required", "Reserved for future / paid use."],
    [403, "Forbidden", "Authenticated but not allowed to access this."],
    [404, "Not Found", "The resource does not exist."],
    [405, "Method Not Allowed", "The HTTP method isn't allowed for this resource."],
    [406, "Not Acceptable", "Can't produce a response matching Accept headers."],
    [407, "Proxy Authentication Required", "Must authenticate with the proxy first."],
    [408, "Request Timeout", "The client took too long to send the request."],
    [409, "Conflict", "Request conflicts with the current state."],
    [410, "Gone", "The resource is permanently gone."],
    [411, "Length Required", "A Content-Length header is required."],
    [412, "Precondition Failed", "A precondition header check failed."],
    [413, "Payload Too Large", "The request body is too large."],
    [414, "URI Too Long", "The request URL is too long."],
    [415, "Unsupported Media Type", "The body's media type isn't supported."],
    [416, "Range Not Satisfiable", "The requested range can't be served."],
    [417, "Expectation Failed", "The Expect header couldn't be met."],
    [418, "I'm a teapot", "An April Fools' joke code (RFC 2324)."],
    [421, "Misdirected Request", "Request sent to a server that can't respond to it."],
    [422, "Unprocessable Content", "Well-formed but semantically invalid (validation)."],
    [423, "Locked", "The resource is locked (WebDAV)."],
    [424, "Failed Dependency", "A dependent request failed (WebDAV)."],
    [425, "Too Early", "Server won't risk replaying this request."],
    [426, "Upgrade Required", "Client must switch to a different protocol."],
    [428, "Precondition Required", "The request must be conditional."],
    [429, "Too Many Requests", "Rate limit exceeded; slow down."],
    [431, "Request Header Fields Too Large", "Headers are too large to process."],
    [451, "Unavailable For Legal Reasons", "Blocked for legal reasons."],
    [500, "Internal Server Error", "A generic server-side error."],
    [501, "Not Implemented", "The server doesn't support this functionality."],
    [502, "Bad Gateway", "An upstream server returned an invalid response."],
    [503, "Service Unavailable", "Server is overloaded or down for maintenance."],
    [504, "Gateway Timeout", "An upstream server didn't respond in time."],
    [505, "HTTP Version Not Supported", "The HTTP version isn't supported."],
    [506, "Variant Also Negotiates", "Content negotiation configuration error."],
    [507, "Insufficient Storage", "Not enough storage to complete (WebDAV)."],
    [508, "Loop Detected", "An infinite loop was detected (WebDAV)."],
    [510, "Not Extended", "Further extensions are required."],
    [511, "Network Authentication Required", "Must authenticate to gain network access (captive portal)."]
  ];
  function cls(code) { return "c" + Math.floor(code / 100); }

  document.addEventListener("DOMContentLoaded", function () {
    var q = document.getElementById("http-q"), body = document.getElementById("http-body"),
        count = document.getElementById("http-count");
    if (!body) return;
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    function render() {
      var f = q.value.trim().toLowerCase();
      var rows = H.filter(function (r) {
        return !f || String(r[0]).indexOf(f) >= 0 || r[1].toLowerCase().indexOf(f) >= 0 || r[2].toLowerCase().indexOf(f) >= 0;
      });
      count.textContent = rows.length + " of " + H.length + " codes.";
      body.innerHTML = rows.map(function (r) {
        return "<tr><th class=\"http-code " + cls(r[0]) + "\">" + r[0] + "</th><td>" + esc(r[1]) +
          "</td><td class=\"http-desc\">" + esc(r[2]) + "</td></tr>";
      }).join("");
    }
    q.addEventListener("input", render);
    render();
  });
})();
