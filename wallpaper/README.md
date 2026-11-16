# Wallpaper

Give any Snack a background image. Fill, fit or stretch it without changing its source.

This folder is a complete, independent Condiment. It includes:

- `snack-condiments.json` — this Condiment’s catalog and requested controls
- `icon.svg` — its own icon
- `index.html` — its interface
- `styles.css` — all of its styles
- `script.js` — all of its interface logic
- `skills/SKILL.md` — its optional agent skill

No shared file outside this folder is required. Connect this GitHub folder, or choose a local copy of this folder under Serving Tray → Mods → Mod connections. Install, review the requested controls, and enable it.

The root repository catalog can also discover both Condiments together.

[Full guide](https://github.com/anticontainmentsystem/Snack-mods#readme)


The loaded image and fit are saved in this Condiment’s private storage until replaced or cleared. **Clear image** resets the editor without removing applied wallpapers. **Remove** removes wallpaper from the selected Snack while retaining the loaded image. Fit changes update an already wallpapered target immediately; Apply remains available for any selected non-M Snack. The preview uses the selected Snack’s actual width and height, including orientation changes. Tile repeats the image at its original size. The bundle uses generic `media-read` (own uploads only), `condiment-storage-get/set`, and presentation actions; no Wallpaper-specific host implementation is required.


Panel and message backgrounds are translucent in both themes so applied wallpaper stays visible without fading text or attachments. Wallpaper has a bundled default Snack background; select Wallpaper itself in its target list to replace it with your own image using the same fit controls.

The Wallpaper window uses 8 × 6 Snack grid units. Its compact controls and shape-aware preview sit side by side.
