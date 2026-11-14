---
name: snack-wallpaper
description: Apply or remove a background image on a selected Snack using Snack's approved controls.
---

Discover Snack's live capabilities and read awareness before changing anything. Ask for a target if the user's intent is ambiguous. Read `wallpaper-state` for that Snack. Upload the chosen image through `media-begin`, sequential `media-chunk` calls, and `media-finish`; never send a local filesystem path to a remote client. Apply with `wallpaper-set`, choosing `cover`, `contain` or `stretch`. PNG, JPEG, WebP, GIF and AVIF images up to 10 MB are supported. Remove with `mediaId: null`.

Verify `wallpaper-state` after applying. This Condiment does not change HTML or commit source files. The surrounding Snack harness enforces your connection permissions and this Condiment's approved controls; this skill cannot broaden them.
