---
title: "DNS Forge — Support"
description: "Help, FAQ, and contact for the DNS Forge iOS app."
date: 2026-06-27
lastmod: 2026-06-27
draft: false
---

DNS Forge helps you set up encrypted, private DNS (DoH / DoT), scope it to
specific networks, import and export configuration profiles, and verify it all
with built-in diagnostics.

Need help? Email **bspears-dev.handiwork967@passmail.com** — see [Contact](#contact)
below for what to include.

## Getting started

1. Open DNS Forge and tap a **preset** (Cloudflare, Quad9, AdGuard, OISD, …) or
   tap **+** to add your own resolver or import a profile.
2. iOS installs the DNS configuration, then you must **turn it on**:
   **Settings → General → VPN, DNS & Device Management → DNS**, and select your
   profile.
3. Back in DNS Forge, the status header should show **Profile Active** and
   **DNS Reachable**. Use **DNS Resolver Test** to confirm which resolver is
   answering.

## Frequently asked questions

### How do I add my NextDNS / AdGuard / ControlD account?
Tap **+ → DNS over HTTPS** (or DoT) and paste your provider URL, e.g.
`https://dns.nextdns.io/<your-id>`. **Server IP addresses are optional** for
DoH/DoT — leave them blank and the app will resolve the server name normally.
Tap **Test Endpoint** to confirm it works, then **Save**.

### Why does Standard (cleartext) DNS only seem to work on cellular?
This is an iOS restriction, not a bug. iOS typically applies plain DNS only on
cellular; on Wi-Fi it prefers the network's resolver. For consistent behavior on
every network, use **DNS over HTTPS** or **DNS over TLS**.

### What are Network Rules (Wi-Fi only / Cellular only / per-SSID)?
They scope your resolver to specific networks: apply it everywhere, only on
Wi-Fi, only on cellular, only on certain Wi-Fi networks, or everywhere **except**
certain Wi-Fi networks. Per-SSID rules require iOS to read the current Wi-Fi
name, which is why the app includes the **Access Wi-Fi Information** capability.
Rules only take effect while the DNS profile is enabled in Settings.

### How do I import a configuration profile?
Tap **+ → Import Profile…** and pick a `.mobileconfig` file. Both unsigned and
**signed** profiles (from providers like AdGuard, Cloudflare, NextDNS) are
supported. Any per-network rules in the profile can be merged with or replace
your existing rules.

### How do I export or share my setup?
Long-press any resolver and choose **Export Profile (.mobileconfig)** to share it
(AirDrop, Files, Mail) or **Preview Profile** to inspect the exact XML first.

### I selected a provider but nothing changed.
Make sure you **enabled** the profile under
**Settings → General → VPN, DNS & Device Management → DNS**. Installing a profile
in the app does not turn it on automatically.

### How do I remove or restore presets?
Swipe left on a preset to hide it. A **Restore hidden presets** option appears at
the bottom of the list once you've hidden any.

### What is "Split DNS"?
An experimental option (when adding a custom resolver) that scopes a resolver to
specific domain suffixes, so only those domains use it. It may not work reliably
on every network.

### Where does the IP location/organization info come from?
The diagnostics enrich IP addresses using **ipwho.is**, and detect your resolver
using public "whoami" services. These are only contacted when you actively run a
diagnostic. See the [Privacy Policy]({{< ref "privacy.md" >}}).

## Troubleshooting

- **No internet after enabling a profile:** open DNS Forge and tap
  **Disable DNS Configuration**, or remove the profile under
  **Settings → General → VPN, DNS & Device Management → DNS**.
- **Endpoint test fails:** double-check the URL/hostname; for DoH it must be a
  valid `https://` URL. Try the provider's documented endpoint.
- **Per-Wi-Fi rule not applying:** confirm the profile is enabled in Settings,
  and that the SSID matches exactly (names are case-sensitive). Rules are only
  evaluated on a real device, not the Simulator.
- **A signed profile won't import:** make sure the file is a `.mobileconfig`. If
  it still fails, email it (or a description) to support.

## Privacy

DNS Forge has no accounts, no analytics, and no tracking; your configuration
stays on your device. Full details are in the
**[Privacy Policy]({{< ref "privacy.md" >}})**.

## Contact

Email **bspears-dev.handiwork967@passmail.com**. To help us respond quickly,
please include:

- Your **iOS version** and **device model**
- The **protocol** you're using (DoH / DoT / Standard) and, if relevant, the
  resolver
- A short description of what you expected and what happened

We aim to reply within a few business days.
