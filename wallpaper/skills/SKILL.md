---
name: snack-wallpaper
description: Apply or remove a background image on a selected Snack using Snack's approved controls.
---

Discover Snack's live capabilities and awareness. Read this module’s id and command schemas with `condiment-agent-guide`, and open it with `condiment-open`. Ask for a target if the user's intent is ambiguous. Upload the user’s selected image with `media-begin`, sequential `media-chunk` calls and `media-finish`. Invoke `condiment-command` with command `apply` and arguments `{snackId,mediaId,fit}`, where fit is cover, contain, stretch or tile. Remove with command `remove` and arguments `{snackId}`. Verify `presentation-state` afterward. The module owns a generic presentation layer; Snack has no Wallpaper-specific action. Never expose host paths or credentials, and use only current approved controls.

Verify `presentation-state` after applying. This Condiment does not change HTML or commit source files. The surrounding Snack harness enforces your connection permissions and this Condiment's approved controls; this skill cannot broaden them.


The loaded image and fit are saved in this Condiment’s private storage until replaced or cleared. **Clear image** resets the editor without removing applied wallpapers. **Remove** removes wallpaper from the selected Snack while retaining the loaded image. Fit changes update an already wallpapered target immediately; Apply remains available for any selected non-M Snack. The preview uses the selected Snack’s actual width and height, including orientation changes. Tile repeats the image at its original size. The bundle uses generic `media-read` (own uploads only), `condiment-storage-get/set`, and presentation actions; no Wallpaper-specific host implementation is required.


Refresh live capabilities for the current tool set. Prefer compact `studio-workspace` / `studio-read` / revision-checked `studio-patch` for Pasta editing. Read `condiment-development-guide` for authoring, packaging, publishing and browser automation workflows. Snack names and nativeTitle match across window states; use them to identify the requested target. Module UI grants and authenticated agent grants remain independently enforced.
