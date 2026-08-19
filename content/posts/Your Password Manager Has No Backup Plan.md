---
author: "Ben Spears"
date: 2026-05-09
title: Your Password Manager Has No Backup Plan
description: "A password manager isn't the finish line. Most people never set up the recovery path, so losing a phone or forgetting the master password can cost every account at once — what to actually check, and why I moved off KeePassXC."
---

Most of the password advice you get stops at "use a password manager." That's
good advice, as far as it goes — it just doesn't go nearly far enough. Having one
isn't the finish line. I ran mine for years with a hole in it I never noticed,
until I actually sat down and thought through what happens the day my phone ends
up in a lake.

Here's the part nobody walks you through: you save a hundred passwords, generate
long random strings for accounts you'll never memorize, delete the old
sticky-note list, and feel done. What you've actually built is a single point of
failure. Every credential you own now lives behind one master password, usually
on one device. Lose that combination and you don't lose one account — you lose
all of them at once, including the email account you'd need to reset any of the
rest.

## What actually goes wrong

It's rarely a hack. It's a phone in a lake, a laptop that dies without warning,
or a master password that quietly slips your mind after months of never typing
it because your fingerprint did the work instead. None of those are exotic. All
three have happened to someone I know.

The vault itself is usually fine — it's encrypted, it's backed up somewhere, the
company isn't going anywhere. What's actually fragile is the one piece of
information standing between you and it: the master password, and whatever
recovery method you set up — or didn't — the day you signed up and skipped past
it to get to the part where you actually save passwords.

## Picking one: Proton Pass vs. Bitwarden, and why I left KeePassXC

I ran KeePassXC for years, and it's genuinely good software — free, open-source,
fully offline. The vault is a single encrypted file that you hold yourself;
nobody else's server ever sees it. I still recommend it, with one honest caveat:
sync is entirely on you. KeePassXC doesn't sync anything by default. Getting that
one file onto every device you own, and keeping the copies from drifting apart,
is your job. I did that for years with a self-hosted sync setup, and it worked —
right up until I made a change on my phone, forgot to sync before opening the
desktop copy, and briefly overwrote weeks of saved logins with a stale version.
Nothing was unrecoverable, but it cured me of wanting to babysit my own vault.

These days I run **Proton Pass**, mostly because I'm already in the Proton
ecosystem for mail and VPN, and one login instead of five is worth something on
its own. If you're not already bought into Proton, **Bitwarden** is the one I'd
point you to instead — cross-platform, open-source, independently audited more
than once, and easy to self-host later if you ever want that option. Both sync in
the background on every platform I actually use, and neither asks me to think
about which device has the freshest copy. That's the whole appeal: the exact
problem KeePassXC left as an exercise for the user is just solved.

## The recovery path people skip

This is the part that actually matters, and almost nobody does it.

Every password manager asks you, somewhere during setup, to save an emergency kit
or a set of recovery codes. Almost everyone clicks past it to get to the good
part. That screen is the whole point. Your master password isn't stored anywhere
— that's the security model working as intended — which means if you forget it
and never saved a recovery method, there is no "forgot password" link that gets
you back in. The company can't help you. That's not a bug; it's the same design
that keeps everyone else out too.

Print the recovery sheet, or save it somewhere that isn't inside the vault it's
meant to unlock — a physical safe, a fireproof box, a trusted family member's
hands. It sounds like overkill until you remember this is the one credential
where "I'll deal with it later" isn't actually an option.

## Use a passkey where one's offered

A growing list of services — Google, Apple, Microsoft, and a rising number of
banks — support passkeys instead of passwords now. They're not phishable the
way a password and a text code are, since there's no code for someone to
trick you into typing on a fake login page. Both Proton Pass and Bitwarden
store and sync passkeys right alongside your passwords, so switching is just
a toggle in the account settings of whatever service offers it — no separate
app, no new habit to build.

## Keep an offline copy too

Cloud sync is the whole appeal of a password manager, but it's also a single
dependency. An outage, a locked account, or a company shutting down doesn't
care that you needed in five minutes ago. Export an encrypted backup
periodically — both apps support this — and keep the file somewhere offline,
like a USB drive in a safe. Update it every few months; it doesn't need to be
current to the day, just not years stale.

## Migrating without losing anything

If you're moving off browser-saved passwords or another manager, export first —
most managers, including Chrome and Firefox, will hand you a plaintext CSV.
Import it into your new manager, confirm the count matches, then actually delete
the export file. Don't let it sit in your Downloads folder; a plaintext file of
every password you own is exactly the thing you just spent an afternoon getting
rid of.

## Do it this week

1. Pick one — Proton Pass or Bitwarden — and install it everywhere you'll need it.
2. Set up the recovery method now, before you need it, and store it outside the vault.
3. Turn on 2FA for the vault itself, not just the accounts inside it.
4. Switch to a passkey anywhere one's offered.
5. Migrate your saved passwords, then delete the plaintext export.
6. Export an offline backup and keep it somewhere outside the cloud.

The whole point of a password manager is that you stop thinking about passwords.
Spend the twenty minutes now so a lost phone stays an inconvenience instead of
becoming a lost identity.

If you're working through more than just this, the [guide](/guide/) picks up
right where this leaves off.
