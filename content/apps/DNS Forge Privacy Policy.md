---
title: "DNS Forge"
description: "Privacy policy for the DNS Forge iOS app."
date: 2026-06-27
---

_Last updated: June 27, 2026_

DNS Forge ("the app") is designed to be private by default. It has no user
accounts, no analytics, no advertising, and no tracking. The developer operates
no servers and receives no data from the app.

This policy explains what the app does and does not do with information. If you
have questions, contact **bspears-dev.handiwork967@passmail.com**.

## What the app stores on your device

All of your configuration stays on your device and is never sent to the
developer:

- **DNS profiles** you select, add, or import (provider name, protocol, server
  URL/hostname, optional server IP addresses, and any split-DNS domains) are
  stored locally on your device.
- **Settings** such as your per-Wi-Fi/cellular network rules, which presets you
  have hidden, and which profile is active are stored locally in standard app
  preferences.

This information is used solely to configure DNS on your device and is not
transmitted to the developer.

## Network connections the app makes

Some features make network requests directly from your device. These are
inherent to how the features work and are not logged or collected by the
developer:

- **Diagnostics (DNS Resolver Test, IP Tools):** to identify which resolver is
  answering your queries and to show details about your IP address, the app
  queries public "whoami" services (`whoami.akamai.net`, and Google's
  `o-o.myaddr.l.google.com` as a fallback) through your system resolver, and
  looks up IP address details using **ipwho.is**. These requests send your IP
  address to those third-party services, as is normal for any internet request.
- **DNS Lookup:** queries the domain names you enter, using your active system
  resolver.
- **Resolver Benchmark / Certificate Inspector:** connects directly to the DNS
  resolvers and endpoints you have selected or configured, to measure response
  time or inspect their TLS certificate.

The app does not send any of this data to the developer, and the developer has
no ability to associate it with you.

## Third-party services

When you use the diagnostic features above, requests are made to third parties.
Those providers handle requests according to their own privacy policies. The app
shares no information with them beyond what is necessary to perform the requested
lookup (for example, the IP address that any internet request necessarily
exposes):

- **ipwho.is / ipwhois.io** (IP details) — <https://ipwhois.io/privacy-policy>
- **Akamai** (`whoami.akamai.net`) — <https://www.akamai.com/legal/privacy-and-policies>
- **Google** (`o-o.myaddr.l.google.com` fallback) — <https://policies.google.com/privacy>

These services are only contacted when you actively run a diagnostic.

## Configuration profiles

DNS Forge can export and import Apple configuration profiles (`.mobileconfig`).
Exported profiles are created on your device and shared only when you choose to
share them. Imported profiles are read on your device to create a local DNS
entry; their contents are not sent anywhere.

## Data collection

DNS Forge does **not** collect, sell, share, or rent your personal data. There is
no account system, no advertising identifiers, and no information is transmitted
to the developer.

## Your choices and data deletion

Because the app stores everything locally and the developer holds no data about
you, you are always in control:

- Remove an individual DNS profile or rule from within the app at any time.
- **Delete the app** to remove all locally stored data, including saved profiles
  and settings.

The developer has no copy of this data to delete, because none is ever collected.

## Children

DNS Forge is a utility app, is rated 4+, and is not directed to children. It does
not knowingly collect any information from anyone, including children.

## Changes to this policy

If this policy changes, the updated version will be posted at this URL with a
revised "Last updated" date.

## Contact

Questions about this policy can be sent to:
**bspears-dev.handiwork967@passmail.com**
