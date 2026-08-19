---
author: "Ben Spears"
date: 2026-05-23
title: Your Email Is the Master Key
description: "Email isn't just mail — it's the recovery path for every other account you own. Locking it down properly: real 2FA, recovery options that aren't a weak point themselves, and checking who else still has access."
---

Ask most people to rank their accounts by how much they'd protect them, and email
lands somewhere in the middle — behind banking, behind whatever social account
they actually post on. That ranking is backwards, and it's the single biggest gap
in how people think about their own security.

## Why email isn't "just email"

Every account you own has a "forgot password" link, and every one of those links
sends a reset to the same place: your inbox. That makes email the master key —
not metaphorically, literally. Whoever controls your inbox can reset your bank
login, your social accounts, your work tools, one after another, without ever
knowing your original password for any of them. You don't compromise ten accounts
by attacking ten accounts. You compromise one.

That's also why email is the account attackers actually want. Nobody's trying to
guess your Instagram password directly anymore. They're trying to get into your
inbox, because from there, everything else falls in sequence.

## Locking the account itself

Start with the password — long, random, unique, generated and stored in a
password manager, not reused from anywhere else. [I've written separately about
the recovery side of that setup](/posts/your-password-manager-has-no-backup-plan/);
if you don't have one yet, that's the actual first step here.

Then turn on real two-factor authentication — an authenticator app or a hardware
key, not SMS. Text-message codes are better than nothing, but they route through
your phone carrier, and carrier accounts get socially engineered and SIM-swapped
often enough that it's a known, well-worn attack path. An authenticator app or a
hardware key like a YubiKey doesn't have that weak point; there's no customer
service rep on the other end who can be talked into anything.

## Recovery options are attack surface too

Here's the part that gets skipped: your recovery options are just as sensitive as
the account they're meant to protect. A recovery phone number is another
SIM-swap target. A recovery email that's old, forgotten, or itself unsecured is a
second front door nobody's watching. Security questions are usually worse than a
password — "mother's maiden name" and "first pet" are public record or a few
searches away for most people.

Go into your account settings and actually look at what's listed. Update
anything stale, remove anything you don't recognize, and if the service still
supports security questions instead of real 2FA, answer them with nonsense you
store in your password manager rather than the truth.

## Who else still has access

This is the one people forget to check. Go into your mail settings and look for
two things: forwarding rules and connected apps. A forwarding rule quietly BCCs a
copy of everything to somewhere else — a common move after an account's already
been touched, since it keeps working even after you change the password.
Connected apps and OAuth grants are the other blind spot: every "Sign in with
Google" you've ever clicked left a standing connection behind, most of which you
forgot about the day after you used them. Revoke anything you don't actively use.

While you're in there, check active sessions too. Most providers list every
device currently logged in. If you don't recognize one, sign it out.

## Do it this week

1. Confirm the password is long, random, and unique — stored in a password manager, not memorized.
2. Turn on app-based or hardware-key 2FA. Drop SMS as the primary method if you can.
3. Review and clean up recovery phone, recovery email, and security questions.
4. Check forwarding rules, connected apps, and active sessions — revoke anything you don't recognize.

Everything else on this list only matters if the account underneath it is solid.
This is the one that's actually first.

Curious what "everything else" actually means? The [guide](/guide/) spells out
the rest, in the order it actually matters.
