---
author: "Ben Spears"
date: 2026-07-25
title: Your DNS Is Showing
description: "Even with HTTPS, your DNS lookups reveal every site you visit. What leaks, how encrypted DNS (DoH/DoT) fixes it, the trade-offs, and how to turn it on."
---

I've worked in IT for about {{< yearsinit >}} years, and I was pulling networks apart for
fun long before anyone paid me to. The thing that still surprises people isn't
some exotic attack — it's how much their own network can see while they assume
they're browsing privately.

We've locked the web down pretty well. Almost everything is HTTPS, and most
people read that little padlock as "nobody can see what I'm doing" — well, nobody
except you and whoever's running the website you're connected to. Fair enough;
that's most of the story. But one old, unglamorous protocol has been narrating
your browsing the whole time, and by default it isn't encrypted at all: DNS.

## What DNS actually does

Every time you open a site, your device has to look up its address first. It asks
a resolver — normally your ISP's, or whatever the Wi-Fi you joined decided to
hand you — "what's the IP for this domain?" By default that happens over plain,
unencrypted port 53. It's fast, it's ancient, it works great. It's also
completely readable to anyone sitting in the middle.

## Here's what leaks

HTTPS scrambles the *contents* of the page. It does nothing to hide the
*question*. So even with that padlock sitting there, the domain name itself goes
out in the open.

Your ISP logs every domain you resolve, and plenty of them sell it. The coffee
shop, the hotel, the airport Wi-Fi — they see it too, along with anyone else on
the network. And you don't need the actual page contents to build a
scary-accurate picture of someone; the running list of domains they hit all day
does the job by itself. I've watched it happen on the job — a firewall dashboard
full of DNS queries — and nobody had to open a single page to see where everyone
on that network had been.

There's a second leak called SNI that's finally getting papered over by something
called Encrypted Client Hello, but DNS is the older, bigger, more universal one —
so that's where you get the most for your effort.

## The fix: encrypted DNS

Two flavors, and you'll see both names thrown around:

- **DoH** (DNS over HTTPS) tucks your lookups into normal web traffic on port
  443, so they blend right in and are a pain to block.
- **DoT** (DNS over TLS) uses its own port (853), which is cleaner and easier for
  a network to recognize as DNS.

Either way, the network can't read or tamper with your lookups anymore. Pick
based on whether you want DNS hidden in the crowd (DoH) or kept honest as its own
thing (DoT). For most people it genuinely doesn't matter which.

## The part nobody tells you

Encrypted DNS is absolutely worth turning on. But I'll be straight with you about
what it *isn't*, because the internet loves to oversell this stuff.

It's not a VPN. The site you visit still gets your IP and still knows you showed
up. You've hidden the lookup, not yourself.

And you're not deleting trust — you're moving it. The second you point at an
encrypted resolver, *that* company sees all your domains instead of your ISP.
Sometimes that's a real win (a resolver with an actual no-logging policy beats an
ISP that treats your history as inventory). Sometimes you're just handing
everything to one giant provider instead. Use one you'd actually trust with that
list, or run your own. I run mine — I'd rather hold that list myself than hand it
to anyone, ISP or otherwise.

## From the other chair

Quick reality check, since fighting this is part of the day job: encrypted DNS
cuts both ways. The exact thing that keeps your ISP out of your business also
lets some random device dodge the DNS filtering that businesses lean on — malware
blocking, content rules, internal name resolution. That's why a lot of shops
deliberately block DoH and force everything onto their own resolver. Same
feature, opposite chair. Both sides are right.

## Actually turning it on

Most bang for your buck, top to bottom:

- **On your router.** Set it once and every device is covered — even the dumb
  ones you can't configure individually. This is where I'd start.
- **On the device.** Windows 11, macOS, Android ("Private DNS"), and iOS all do
  encrypted DNS natively now.
- **In the browser.** Firefox and Chrome support DoH, but it only covers that
  browser — nothing else on the machine.

On the networks I manage I run Quad9 (9.9.9.9) — a Swiss-based non-profit that
blocks known-malicious domains and keeps no logs of your IP. I use it mostly on
principle. On my phone I reach for AdGuard instead: with zero configuration it
blocks most ads and trackers out of the box, which is the whole appeal. And if
you just want raw speed, Cloudflare (1.1.1.1) is hard to beat.

iOS is the odd one out here. It won't let you flip on encrypted DNS from Settings
at all — your only options are hand-wrangling a configuration profile (fiddly,
and honestly you shouldn't be in the habit of installing random `.mobileconfig`
files) or using an app that registers itself as the system DNS provider. That gap
is the whole reason DNS Forge exists. I got tired of the profile dance, so I
built [DNS Forge](/apps/dns-forge/) — encrypted DNS with per-Wi-Fi rules and a
built-in test to confirm it's actually on.

## Bottom line

This is one of those rare five-minute changes that punches way above its weight.
It won't make you invisible, and it's no replacement for a decent browser and
decent habits. But that padlock was only ever guarding half the sentence.
Encrypted DNS covers the other half — the part where your device stands up and
announces, to the whole room, exactly where it's headed.
