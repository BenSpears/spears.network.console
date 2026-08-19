---
author: "Ben Spears"
date: 2026-06-13
title: Stop Paying for Antivirus
description: "Built-in antivirus on Windows, macOS, and Linux has gotten good enough that a paid subscription mostly buys you protection you already have. What's actually built in, and how to use a free scanner as a second opinion instead of a monthly bill."
---

Antivirus used to be non-negotiable — you bought a license, renewed it every
year, and didn't think too hard about why. That reflex has outlived its
reason. The built-in stuff is good now, and for most people, a monthly
third-party subscription is just paying for protection they already have.

One scope note before any of this: I'm talking about a personal laptop or
home desktop, not a managed fleet. A business running centralized detection,
unified policy, and a team watching every endpoint is solving a completely
different problem than "should I renew this forty-dollar subscription" —
enterprise EDR/XDR tooling isn't the consumer antivirus this post means, and
nothing here is an argument against having it.

## Windows: Defender already does the job

Microsoft Defender has quietly gotten good — independent labs like AV-Test
and AV-Comparatives routinely score it alongside, and sometimes above, the
paid suites. It's already running and keeps itself updated, no renewal email
guilting you into anything.

Turn on Controlled Folder Access too, under Windows Security → Virus &
threat protection → Ransomware protection. It stops unrecognized programs
from touching files in folders you've protected — the exact thing ransomware
needs to do to encrypt your documents.

## A second opinion, not a subscription

If you still want a second scanner for peace of mind, install Malwarebytes'
free version, but toggle off reporting to Windows Defender during setup.
Leave it on and the two just echo each other's findings. Turn it off and
Malwarebytes becomes its own thing — something you open when a file feels
off, rather than a second service quietly duplicating Defender's job in the
background. The free tier doesn't even do real-time scanning, so this is the
actual use case: an occasional second look, nothing more.

## macOS: same story, different vendor

macOS has its own version of this baked in — XProtect catches known malware
signatures, and Gatekeeper won't run anything that isn't signed and
notarized by a developer Apple has vetted, unless you go out of your way to
override it. Most Mac "infections" are someone clicking past that warning on
purpose. Want a second opinion here too? Malwarebytes has a free Mac
scanner — same deal, check it occasionally, don't pay for it.

## Linux: ClamTK, and honestly, not much to worry about

Linux sees a lot less malware in the wild — the package-repo model beats
downloading random installers, and permissions aren't handed out as freely
as they are on Windows. It's also just a smaller target. ClamTK, a GUI
wrapped around the open-source ClamAV engine, handles the occasional check,
and it's genuinely handy if you're scanning a file before passing it to a
Windows user. It isn't watching your system in real time — on Linux, that's
rarely what you actually need it for.

## Before you run anything you're not sure about

Nothing above replaces judgment about what you're installing. If a download
didn't come from the developer's own site or an official app store, run the
installer through [VirusTotal](https://www.virustotal.com/) first — it
checks the file against dozens of antivirus engines at once, in seconds.

Uploading a file there makes it visible to other researchers and vendors in
VirusTotal's own database — fine for a random installer, but skip it for
anything with your own data in it.

## Bottom line

None of this is exotic. The built-in tools on every major OS are good enough
for what almost everyone actually runs into, and they're free — no upsell,
no renewal, nothing to remember to cancel. Keep a free on-demand scanner
around for when something feels off, get in the habit of checking anything
you're unsure of before you run it, and put the subscription money toward
something that isn't already sitting on your machine for free.
