// First-party IP echo. Reads the client's IP from the connection Netlify already
// terminates — no third-party API, no geolocation lookup, and nothing is logged
// or stored. Used by the terminal's `privacy` command.
export default async (req, context) => {
  const ip =
    (context && context.ip) ||
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "";
  return new Response(JSON.stringify({ ip }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
};
