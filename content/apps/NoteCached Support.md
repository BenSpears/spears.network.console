---
title: "NoteCached Support"
date: 2026-07-18
---

## NoteCached Support

Have a question or ran into an issue? We're here to help.

[bspears-dev.handiwork967@passmail.com](mailto:bspears-dev.handiwork967@passmail.com)

I will typically respond within 1-2 business days.

---

## Frequently Asked Questions

### I forgot my passcode. How do I get back in?

There is no passcode recovery. NoteCached has no account and no server — there is no "forgot passcode" flow by design. If you enabled auto-destruct, 5 failed attempts will wipe the vault. If you did not enable a PIN, you can unlock with Face ID or Touch ID.

**Before resetting:** Go to Settings on your iPhone → Face ID & Passcode → and try using your device passcode, which may also unlock the app via the system authentication prompt.

---

### I got a new iPhone. How do I move my notes?

Your notes and your encryption key are tied to your old device. They do not transfer automatically.

Before switching devices, go to **Settings → Export Vault** inside NoteCached and save the encrypted bundle somewhere safe (Files, AirDrop to your Mac, etc.). On your new iPhone, install NoteCached and use **Import** to restore your vault with the password you set during export.

---

### Are my notes backed up to iCloud?

Your notes are backed up to iCloud as **encrypted data** if you have iCloud Backup turned on in iOS Settings. However, the key to read them is never included in that backup. Even Apple cannot read your notes from a backup.

Your vault key and PIN are stored in the iOS Keychain with `ThisDeviceOnly` protection, which iOS explicitly excludes from all backups.

---

### I lost my notes after resetting my device. Can they be recovered?

If you did not export your vault before resetting, the notes are permanently gone. The encryption key was erased with the device and there is no copy anywhere. This is intentional — it is what makes NoteCached secure.

Going forward, use **Settings → Export Vault** before any device reset or trade-in.

---

### Does NoteCached sync across my iPhone and iPad?

Not currently. NoteCached is local-only by design. iCloud sync is planned for a future update.

---

### The widget is not showing up. How do I add it?

Long-press your home screen until icons jiggle, tap the **+** button in the top-left corner, search for **NoteCached**, and add the widget. Tapping it will prompt Face ID before opening a new note.

---

### What happens after 5 failed unlock attempts?

If auto-destruct is enabled (it is on by default), the vault is wiped and a security screen is shown on next launch. The counter resets to zero on every successful unlock. You can disable auto-destruct or check the current count in **Settings → auto-destruct**.

---

### Does NoteCached have ads or sell my data?

No. NoteCached has no ads, no analytics, no account, and no server. Nothing you write is ever transmitted anywhere. 

---

## Still need help?

Email me: [bspears-dev.handiwork967@passmail.com](mailto:bspears-dev.handiwork967@passmail.com)

