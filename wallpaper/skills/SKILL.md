---
name: snack-wallpaper
description: Apply or remove a background image on a selected Snack using Snack's approved controls.
---

Discover Snack's live capabilities and awareness. Read this module’s id and command schemas with `condiment-agent-guide`, and open it with `condiment-open`. Ask for a target if the user's intent is ambiguous. Upload the user’s selected image with `media-begin`, sequential `media-chunk` calls and `media-finish`. Invoke `condiment-command` with command `apply` and arguments `{snackId,mediaId,fit}`, where fit is cover, contain or stretch. Remove with command `remove` and arguments `{snackId}`. Verify `presentation-state` afterward. The module owns a generic presentation layer; Snack has no Wallpaper-specific action. Never expose host paths or credentials, and use only current approved controls.

Verify `presentation-state` after applying. This Condiment does not change HTML or commit source files. The surrounding Snack harness enforces your connection permissions and this Condiment's approved controls; this skill cannot broaden them.
