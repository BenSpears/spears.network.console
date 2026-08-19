---
author: "Ben Spears"
date: 2026-06-27
title: Your Passcode Isn't Doing Most of the Work
description: "A lock screen passcode protects your phone if it's stolen. It does nothing about the privacy settings quietly on by default underneath it. The iPhone and Android toggles actually worth changing."
---

Ask someone if their phone is locked down and they'll usually point to the
passcode. Fair enough — a passcode is real security, and you should have one.
But it's answering a narrower question than people think: it stops a stranger
who picks up your phone from getting into it. It says nothing about what the
phone is quietly sharing while it's sitting in your pocket, fully unlocked, doing
exactly what it was configured to do the day you took it out of the box.

I've [written before about why I ended up on an iPhone](/posts/why-i-left-grapheneos-for-an-iphone/)
after years on GrapheneOS — that post was about the reasoning. This one's the
part I skipped: the actual settings, on both platforms, that are worth changing
regardless of which one you carry.

## What a passcode actually protects

A passcode protects the device. It doesn't protect the data flowing off it. Ad
tracking, location history, analytics, and diagnostic sharing are all separate
systems that keep running whether the phone is locked or not — they're about what
the phone tells other people, not about who can pick it up. Treating the passcode
as the finish line is why so many people have never opened the privacy settings
at all: they feel done after step one.

## iPhone: the toggles worth changing

- **Turn off ad tracking.** Settings → Privacy & Security → Tracking, and switch
  off "Allow Apps to Request to Track." This is the single biggest lever — it
  stops apps from linking your activity across other apps and websites to build a
  profile on you.
- **Turn on Advanced Data Protection.** Settings → [your name] → iCloud →
  Advanced Data Protection. This extends end-to-end encryption to nearly
  everything in iCloud, including backups — without it, Apple holds a key to most
  of what you back up.
- **Put location on a short leash.** Settings → Privacy & Security → Location
  Services, app by app. Most don't need "Always" — "While Using" or "Never"
  covers almost everything. While you're there, turn off System Services →
  Significant Locations, which otherwise keeps a running log of everywhere you
  spend time.
- **Turn off personalized ads.** Settings → Privacy & Security → Apple
  Advertising. Smaller ledger than Google's to begin with, but no reason to leave
  it on.

## Android: the toggles worth changing

- **Turn off Ads personalization.** Settings → Google → Ads, and reset your
  advertising ID while you're in there.
- **Lock down Activity Controls.** In your Google Account settings, Web & App
  Activity, Location History, and YouTube History are usually on by default. Turn
  off what you don't need, and set auto-delete on what you keep.
- **Check App permissions the way you'd check iOS.** Settings → Privacy →
  Permission manager, sorted by permission rather than by app — it's the faster
  way to see everything with location or microphone access at once.
- **If you're running GrapheneOS or another de-Googled build**, most of this is
  moot by design — you're already not sending it. The trade-off is the
  notification friction I wrote about in the iPhone post; that's still the real
  cost of going that route, not a settings menu.

## App permissions, revisited

Both platforms let permissions creep back in over time — an app update quietly
re-asks for something you already said no to, or you grant "just this once" and
forget to revoke it. Once every few months, go back through location, microphone,
and Bluetooth permissions specifically. Those three cover the most invasive
access and the most common reason an app has it: background location for a
weather app, microphone for something that has no business listening, Bluetooth
for tracking presence in a store.

## Do it this week

1. Turn off ad tracking / ads personalization.
2. Put location permissions on a short leash, app by app.
3. iPhone: turn on Advanced Data Protection. Android: lock down Activity Controls.
4. Sort permissions by type, not by app, and revoke what you don't use.

None of this takes longer than the passcode did to set up in the first place.
It's just the part that actually matters for privacy, not the part that felt
like it did.

There's more where this came from — the [guide](/guide/) walks through the
rest of it too.
