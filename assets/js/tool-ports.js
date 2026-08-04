/* spears.network — common TCP/UDP ports reference (searchable, offline). */
(function () {
  "use strict";
  // [port, protocol, service]
  var P = [
    [20, "TCP", "FTP — data transfer"],
    [21, "TCP", "FTP — control"],
    [22, "TCP", "SSH / SCP / SFTP"],
    [23, "TCP", "Telnet"],
    [25, "TCP", "SMTP — mail transfer"],
    [37, "TCP/UDP", "Time protocol"],
    [43, "TCP", "WHOIS"],
    [49, "TCP/UDP", "TACACS+"],
    [53, "TCP/UDP", "DNS"],
    [67, "UDP", "DHCP / BOOTP — server"],
    [68, "UDP", "DHCP / BOOTP — client"],
    [69, "UDP", "TFTP"],
    [79, "TCP", "Finger"],
    [80, "TCP", "HTTP"],
    [88, "TCP/UDP", "Kerberos"],
    [110, "TCP", "POP3"],
    [111, "TCP/UDP", "RPC portmapper (rpcbind)"],
    [119, "TCP", "NNTP — Usenet"],
    [123, "UDP", "NTP — time sync"],
    [135, "TCP", "Microsoft RPC endpoint mapper"],
    [137, "UDP", "NetBIOS name service"],
    [138, "UDP", "NetBIOS datagram service"],
    [139, "TCP", "NetBIOS session service"],
    [143, "TCP", "IMAP"],
    [161, "UDP", "SNMP"],
    [162, "UDP", "SNMP trap"],
    [179, "TCP", "BGP — routing"],
    [389, "TCP/UDP", "LDAP"],
    [443, "TCP", "HTTPS"],
    [445, "TCP", "SMB / CIFS — Windows file sharing"],
    [464, "TCP/UDP", "Kerberos password change"],
    [465, "TCP", "SMTPS — mail submission (implicit TLS)"],
    [500, "UDP", "IKE / IPsec VPN"],
    [514, "UDP", "Syslog"],
    [515, "TCP", "LPD / LPR — printing"],
    [520, "UDP", "RIP — routing"],
    [546, "UDP", "DHCPv6 client"],
    [547, "UDP", "DHCPv6 server"],
    [548, "TCP", "AFP — Apple Filing Protocol"],
    [554, "TCP/UDP", "RTSP — streaming"],
    [587, "TCP", "SMTP — mail submission (STARTTLS)"],
    [593, "TCP", "Microsoft RPC over HTTP"],
    [623, "UDP", "IPMI / BMC"],
    [631, "TCP/UDP", "IPP — Internet Printing Protocol"],
    [636, "TCP", "LDAPS — LDAP over TLS"],
    [873, "TCP", "rsync"],
    [989, "TCP", "FTPS — data (implicit TLS)"],
    [990, "TCP", "FTPS — control (implicit TLS)"],
    [993, "TCP", "IMAPS — IMAP over TLS"],
    [995, "TCP", "POP3S — POP3 over TLS"],
    [1080, "TCP", "SOCKS proxy"],
    [1194, "UDP", "OpenVPN"],
    [1433, "TCP", "Microsoft SQL Server"],
    [1434, "UDP", "Microsoft SQL Server monitor"],
    [1521, "TCP", "Oracle database"],
    [1701, "UDP", "L2TP VPN"],
    [1723, "TCP", "PPTP VPN"],
    [1812, "UDP", "RADIUS — authentication"],
    [1813, "UDP", "RADIUS — accounting"],
    [1883, "TCP", "MQTT"],
    [1900, "UDP", "SSDP / UPnP discovery"],
    [2049, "TCP/UDP", "NFS — network file system"],
    [2082, "TCP", "cPanel"],
    [2083, "TCP", "cPanel (TLS)"],
    [2181, "TCP", "Apache ZooKeeper"],
    [2222, "TCP", "SSH (alternate) / DirectAdmin"],
    [2375, "TCP", "Docker API (unencrypted)"],
    [2376, "TCP", "Docker API (TLS)"],
    [3000, "TCP", "Dev servers (Node, Grafana, Rails)"],
    [3128, "TCP", "Squid proxy"],
    [3268, "TCP", "LDAP global catalog"],
    [3269, "TCP", "LDAP global catalog (TLS)"],
    [3306, "TCP", "MySQL / MariaDB"],
    [3389, "TCP", "RDP — Remote Desktop"],
    [3690, "TCP", "Subversion (SVN)"],
    [4444, "TCP", "Metasploit / common malware"],
    [4789, "UDP", "VXLAN"],
    [5000, "TCP", "Dev servers (Flask) / UPnP"],
    [5060, "TCP/UDP", "SIP — VoIP signaling"],
    [5061, "TCP", "SIP over TLS"],
    [5222, "TCP", "XMPP — client"],
    [5353, "UDP", "mDNS — Bonjour / Avahi"],
    [5432, "TCP", "PostgreSQL"],
    [5601, "TCP", "Kibana"],
    [5672, "TCP", "AMQP — RabbitMQ"],
    [5900, "TCP", "VNC"],
    [5984, "TCP", "CouchDB"],
    [6379, "TCP", "Redis"],
    [6443, "TCP", "Kubernetes API server"],
    [8006, "TCP", "Proxmox VE web UI"],
    [8080, "TCP", "HTTP alternate / proxies"],
    [8443, "TCP", "HTTPS alternate"],
    [8883, "TCP", "MQTT over TLS"],
    [9000, "TCP", "PHP-FPM / Portainer / misc"],
    [9090, "TCP", "Prometheus / Cockpit"],
    [9092, "TCP", "Apache Kafka"],
    [9200, "TCP", "Elasticsearch"],
    [9418, "TCP", "Git protocol"],
    [10000, "TCP", "Webmin"],
    [11211, "TCP/UDP", "Memcached"],
    [15672, "TCP", "RabbitMQ management UI"],
    [25565, "TCP", "Minecraft server"],
    [27017, "TCP", "MongoDB"],
    [51820, "UDP", "WireGuard VPN"]
  ];

  document.addEventListener("DOMContentLoaded", function () {
    var q = document.getElementById("ports-q"), body = document.getElementById("ports-body"),
        count = document.getElementById("ports-count");
    if (!body) return;
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    function render() {
      var f = q.value.trim().toLowerCase();
      var rows = P.filter(function (r) {
        return !f || String(r[0]).indexOf(f) >= 0 || r[2].toLowerCase().indexOf(f) >= 0 || r[1].toLowerCase().indexOf(f) >= 0;
      });
      count.textContent = rows.length + " of " + P.length + " ports.";
      body.innerHTML = rows.map(function (r) {
        return "<tr><th>" + r[0] + "</th><td class=\"mono\">" + r[1] + "</td><td>" + esc(r[2]) + "</td></tr>";
      }).join("");
    }
    q.addEventListener("input", render);
    render();
  });
})();
