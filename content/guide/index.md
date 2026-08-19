+++
title = "Guide"
date = "2026-08-16"
lastmod = "2026-08-16"
draft = false
description = "Everything on this site that actually stops identity theft and cuts down what companies quietly collect on you — password managers, breach checks, 2FA, credit freezes, data brokers, phone settings, and account dashboards, in the order to actually do them."
+++

<p class="lead">Everything on this site that actually moves the needle on identity
theft and quiet data collection, in the order to do it, on one page. Nothing
here is secret — most of it's mechanical and already free elsewhere on this
site. The only thing this page adds is order and completion.</p>

<div class="meta">Written by Benjamin Spears · last updated {{< lastmod >}}</div>

**What this actually stops:** account takeover, someone opening credit or a
phone plan in your name, tax refund fraud, and the ordinary trail of exposure
— reused passwords, data broker listings, ad-tracking left on its defaults.
It won't stop a targeted attacker with real time and resources, and no
checklist replaces basic judgment about what you click and who you trust.
This is the common stuff, handled properly.

Work through it top to bottom. Each section links to the full standalone post
if you want the longer version of that one topic — this page is the condensed,
sequenced route through all of them, plus a few things that never got their own
post. Figure two to three hours total, and there's no reason to do it in one
sitting.

The order isn't arbitrary, either. Password manager first, because every
later step assumes it already exists — recovery codes, PINs, and backup keys
all need somewhere to live. Email second, because it's the reset path for
everything else; compromise it and the rest of this list stops mattering.
Everything after that closes a specific, separate hole — new accounts, mail,
taxes, your phone, the accounts already watching you — roughly in the order an
actual attacker would find most useful, highest-impact first.

**Jump to a section:**
[1. Password managers](#1-password-managers) ·
[2. Known breaches](#2-check-yourself-against-known-breaches) ·
[3. Email lockdown](#3-email-lockdown) ·
[4. 2FA everywhere](#4-turn-on-2fa-everywhere-it-counts) ·
[5. Phone number](#5-lock-down-your-phone-number) ·
[6. Mail fraud](#6-watch-your-mail-for-address-change-fraud) ·
[7. Credit freeze](#7-credit-freeze) ·
[8. IRS PIN](#8-get-an-irs-identity-protection-pin) ·
[9. Data brokers](#9-data-broker-opt-outs) ·
[10. Phone privacy](#10-phone-privacy-settings) ·
[11. Encrypt your computer](#11-encrypt-your-computer) ·
[12. Account dashboards](#12-account-dashboards) ·
[Master checklist](#the-master-checklist)

## 1. Password managers

Having a password manager isn't the finish line if you never set up its
recovery path — lose the device or forget the master password and you lose
every account at once, including the one you'd need to reset the rest. Pick
one and get the recovery path in place before anything else on this page,
since later sections assume it exists.

I run **Proton Pass**, mostly because I'm already in the Proton ecosystem for
mail and VPN. If you're not, **Bitwarden** is the one I'd point you to instead
— cross-platform, open-source, audited more than once. I ran KeePassXC for
years before this; it's genuinely good, but sync is entirely on you, and that
eventually wore me down.

Whichever you pick: save the recovery kit or emergency codes it offers during
setup — most people click past that screen — and store it somewhere outside
the vault itself, since nothing is supposed to get into the vault without
that credential. Turn on 2FA for the vault, not just the accounts inside it.

Once your passwords are migrated in, run the built-in password health
report — Bitwarden calls it a security report, Proton Pass has a similar
audit — and fix what it flags. Reused passwords are the priority: one leaked
site means every other account using that same password is exposed too, not
just the one that got breached.

**Use a passkey where one's offered.** A growing list of services — Google,
Apple, Microsoft, and a rising number of banks — support passkeys instead of
passwords. They're not phishable the way a password and a text code are,
since there's no code for someone to trick you into typing on a fake login
page. Both Proton Pass and Bitwarden store and sync passkeys right alongside
your passwords, so switching is just a toggle in the account settings of
whatever service offers it.

**Keep an offline copy too.** Cloud sync is the whole appeal of a password
manager, but it's also a single dependency — an outage, a locked account, or
a company shutting down doesn't care that you needed in five minutes ago.
Export an encrypted backup periodically (both apps support this) and keep the
file somewhere offline, like a USB drive in the same safe as your
disk-encryption recovery key. Update it every few months; it doesn't need to
be current to the day, just not years stale.

*Full version: [Your Password Manager Has No Backup Plan](/posts/your-password-manager-has-no-backup-plan/)*

## 2. Check yourself against known breaches

Go to [haveibeenpwned.com](https://haveibeenpwned.com) and enter your primary
email address — and any other address you've used to sign up for things over
the years. It checks that address against a running database of known data
breaches and tells you which ones it showed up in.

A hit doesn't mean you're currently compromised. It means a password tied to
that email was exposed at some point, on some service. What to actually do
about it: if you're still using that service and haven't changed the password
since, change it now, through your password manager. Then check the password
audit from step one — if you reused that same password anywhere else, change
it there too. That's the whole point of doing these two steps back to back.

While you're on the site, turn on their free notification service for that
email address. It emails you automatically the next time it shows up in a new
breach, so you're not relying on remembering to check again.

## 3. Email lockdown

Every account you own has a "forgot password" link, and every one of those
links sends the reset to the same place. Whoever controls your inbox can reset
your bank login, your social accounts, your work tools, one after another,
without ever knowing the original password for any of them. Email is the
master key, not metaphorically.

Start with the password — long, random, unique, generated and stored in the
password manager from step one. Then turn on real two-factor authentication:
an authenticator app or a hardware key, not SMS. Text codes route through your
phone carrier, and carrier accounts get SIM-swapped often enough that it's a
known, well-worn attack path.

Then check two things most people never look at: forwarding rules and
connected apps, both usually under the account's mail settings. A forwarding
rule copies everything to somewhere else without you noticing — a common move
after an account's already been touched, since it keeps working even after
the password changes. Connected apps are every "Sign in with Google" you've ever clicked;
revoke anything you don't actively use. Check active sessions too, and sign
out anything you don't recognize.

*Full version: [Your Email Is the Master Key](/posts/your-email-is-the-master-key/)*

## 4. Turn on 2FA everywhere it counts

Email gets real 2FA first because everything else assumes it's solid. After
that, two categories matter more than the rest.

**Connector accounts** — Google, Facebook, Apple, anything you use to sign
into other services — matter because they cascade. Every site you joined with
"Sign in with Google" inherits whatever protects that Google account. One
compromised connector account can drag five or six others down with it.

**Banking and anything holding money** — your bank, your brokerage, PayPal,
anywhere that moves your actual money — deserves the same treatment even
though it's often the last place people bother, ironically because it's the
one that matters most if it goes wrong. A lot of banks still default to SMS or
don't offer anything stronger; use an authenticator app if they support one,
and don't skip it just because SMS is what's offered.

Same rule as email: an app or a hardware key beats a text message every time
it's an option.

## 5. Lock down your phone number

SIM-swapping came up twice already as the reason to skip SMS codes. This
closes that risk instead of just routing around it. Call your
carrier, or check their app or account settings, and add a port-out PIN,
"number lock," or "port validation" — the exact name varies, but all four
major US carriers offer some version of it. Without it, someone with enough of
your personal info can talk a carrier rep into moving your number to their SIM,
which then lets them receive your texts, including any SMS codes you still
have on other accounts.

It's a five-minute call or a toggle in the carrier's app, and once it's on,
your number stays put unless you personally authorize a move.

## 6. Watch your mail for address-change fraud

Someone can file a change-of-address for your mail without you knowing,
quietly redirecting new credit cards, checks, and tax documents somewhere
else. USPS sends a confirmation notice to both your old and new address every
time a change-of-address goes through — if one shows up for a move you didn't
make, that's your warning, and USPS has a process to report and reverse it.

Sign up for [USPS Informed Delivery](https://informeddelivery.usps.com), free,
and it emails you a scan of what's arriving before it does — which doubles as
an early warning if mail you're expecting suddenly stops showing up.

## 7. Credit freeze

A security freeze tells the credit bureaus not to hand your file to a new
lender. No file, no new account — the application dies before it starts. It's
free by federal law, doesn't touch your credit score, and doesn't expire.

It only stops *new* accounts. It does nothing for fraud on accounts you
already have — that's your card issuer's job — and it won't stop tax refund
fraud or medical identity theft. It's the single highest-value move on this
page for stopping someone from opening something in your name, which is why
it's here early.

Do the three bureaus separately — there's no master switch, and a freeze at
one means nothing at another:

- [Equifax](https://www.equifax.com)
- [Experian](https://www.experian.com)
- [TransUnion](https://www.transunion.com)

Type the domains in yourself rather than searching for "credit freeze" — that
results page is bought up by monitoring services trying to sell you a
subscription. Have your SSN, date of birth, and address history from the last
couple of years ready; each bureau takes five to ten minutes online.

Every major bureau also pushes a "credit lock" alongside the freeze — a paid
product governed by whatever terms they write, a different thing entirely
from the legal freeze. Use the freeze. A lock on top is your call, not a
substitute.

One more lever on the same file: [OptOutPrescreen.com](https://www.optoutprescreen.com)
stops the "pre-approved" credit card and insurance offers that show up in
your mailbox — exactly what someone doing mail-based identity theft is
hoping to find. It's run by the same four bureaus, so you're not handing
anything to a company that doesn't already have it; you're just telling them
to stop selling access to it. Opt out online for five years in about five
minutes, or mail in the signed form for good.

*Full version: [Your Credit Is Wide Open](/posts/your-credit-is-wide-open/)*

## 8. Get an IRS Identity Protection PIN

The credit freeze above stops new accounts — it does nothing for tax refund
fraud, where someone files a return under your SSN before you do and collects
the refund. The fix for that gap is a free program the IRS already runs: an
Identity Protection PIN, a six-digit code that has to be on any return filed
under your SSN going forward. No PIN, no accepted e-file — that's what stops
it.

Get one at [irs.gov](https://www.irs.gov/identity-theft-fraud-scams/get-an-identity-protection-pin).
It's opt-in, free, and you'll pull a new one each filing season through your
IRS online account. You can get one for dependents too, which matters more
than it sounds — a kid's SSN is a common target precisely because nobody's
filing a return under it to notice.

## 9. Data broker opt-outs

Your name, address, phone number, and a list of your relatives are sitting on
dozens of people-search sites, assembled from public records and sold to
whoever wants them — it's where most of the robocalls and spam texts
originate. You can opt out site by site yourself, for free, using the
[Big-Ass Data Broker Opt-Out List](https://github.com/yaelwrites/Big-Ass-Data-Broker-Opt-Out-List)
— it works, but it's tedious and the data creeps back after a few months.

I pay for [EasyOptOuts](https://easyoptouts.com/) instead, about $20 a year —
it re-runs the removal process automatically every four months. Consumer
Reports rated it the most effective of the paid services they tested, and it's
also the cheapest. Twenty dollars and ten minutes, for noticeably less spam.

*Full version: [Deleting Yourself From Data Brokers](/posts/deleting-yourself-from-data-brokers/)*

## 10. Phone privacy settings

A passcode protects the device if it's stolen. It does nothing about ad
tracking, location history, or diagnostic sharing — those run whether the
phone is locked or not.

**iPhone:** turn off ad tracking (Settings → Privacy & Security → Tracking →
"Allow Apps to Request to Track," off). Turn on Advanced Data Protection
(Settings → [your name] → iCloud) for end-to-end encrypted backups. Put
location on a short leash app by app, and turn off Significant Locations.
Turn off Apple Advertising personalization.

**Android:** turn off Ads personalization (Settings → Google → Ads) and reset
the advertising ID. Lock down Activity Controls in your Google Account — Web &
App Activity, Location History, YouTube History — and set auto-delete on
whatever you keep. Check App permissions sorted by permission type rather than
by app, which surfaces everything with location or microphone access at once.

Both platforms let permissions creep back in over time. Every few months, walk
back through location, microphone, and Bluetooth — those three cover the most
invasive access and the most common reason an app has it.

*Full version: [Your Passcode Isn't Doing Most of the Work](/posts/your-passcode-isnt-doing-most-of-the-work/)*

## 11. Encrypt your computer

If someone steals or finds your laptop, a passcode on your phone stops them
cold — a computer without disk encryption doesn't. Pull the drive, plug it
into another machine, and every file is sitting there in plain text: tax
returns, saved documents, a browser session that's still logged into your
email. Unlike your phone, no computer does this automatically just because you
bought it.

**Windows:** Pro and Enterprise editions have BitLocker (search "Manage
BitLocker" in Start). Home editions get a lighter version called Device
Encryption, which can turn itself on automatically if you're signed into a
Microsoft account on newer hardware — check Settings → Privacy & Security →
Device Encryption, since you may already have it without realizing. By
default, Device Encryption uploads its recovery key to your Microsoft
account — fine if you're comfortable with Microsoft holding it, just know
that's the default, and save your own copy too if you'd rather it not be the
only one.

**macOS:** FileVault ships with every Mac but isn't on by default — turn it on
yourself at Settings → Privacy & Security → FileVault.

**Linux:** LUKS is usually an install-time decision, offered as a checkbox
during setup by most distro installers. If you skipped it, turning it on
after the fact generally means backing up your data and reinstalling — not
the simple toggle the other two are.

**The recovery key matters more than the encryption itself.** Lose it and
forget your password, and there's no support line that gets your files back —
that's encryption working correctly, not a bug. Save it in your password
manager, same as everything else in this guide, and print a second physical
copy to keep in a gun safe or lock box at home. Two copies, kept somewhere you
actually control.

## 12. Account dashboards

Google, Apple, and Meta each keep a running activity log most people never
open, usually one menu deep under a name like "Activity" or "Data & Privacy."

- **Google:** [myactivity.google.com](https://myactivity.google.com) — turn off
  what you don't want logged under Web & App Activity, Location History, and
  YouTube History; set auto-delete on the rest. Separately, turn off ad
  personalization at [myadcenter.google.com](https://myadcenter.google.com).
- **Apple:** Settings → Privacy & Security → Analytics & Improvements, turn off
  sharing. Settings → Privacy & Security → Apple Advertising, turn off
  Personalized Ads.
- **Meta, if you still use it:** Settings → Accounts Center → Your information
  and permissions → Off-Facebook activity — clear it, even if you rarely open
  the app; the tracking doesn't require you to.

If you skipped 2FA on any of these in step four, this is a good moment to
circle back — you're already in the settings.

*Full version: [The Dashboards You've Never Opened](/posts/the-dashboards-youve-never-opened/)*

## The master checklist

Everything above, in order, for when you just want the list:

1. Pick a password manager, save the recovery kit outside the vault, turn on
   2FA for the vault itself, use passkeys where offered, and export an
   offline backup you keep somewhere outside the cloud.
2. Check haveibeenpwned.com for your email addresses; change anything flagged.
3. Turn on real 2FA (app or hardware key, not SMS) for email.
4. Turn on 2FA for connector accounts (Google, Facebook, Apple), then banking.
5. Lock your phone number with a port-out PIN through your carrier.
6. Sign up for USPS Informed Delivery and watch for change-of-address notices
   you didn't request.
7. Freeze your credit at Equifax, Experian, and TransUnion, and opt out of
   pre-approved offers at OptOutPrescreen.com.
8. Get a free IRS Identity Protection PIN.
9. Opt out of data brokers — manually or via a paid service.
10. Lock down phone privacy settings — ad tracking, location, permissions.
11. Encrypt your computer, and save the recovery key in two places: your
    password manager and a printed copy in a home safe or lock box.
12. Turn down Google, Apple, and Meta's activity dashboards.

Nothing here has a deadline. Do it in one weekend or spread it across a month
— the order matters more than the pace.
