# Taffy Strip

Taffy Strip is an optional Windows shortcut launcher for Snack. Install it through the official Snack Condiments catalog and approve window control and **Save and open local shortcuts selected by you**. This release uses the Snack host’s shortcut flyout, draft editor, and thumbnail capabilities.

- **Open a populated cell** to roll out its shortcut cards beside the strip. Click a card to open its target. Use **Close** or Escape to dismiss the flyout.
- **Click an empty cell**, double-click any cell, or choose **Organize** from the flyout to open a separate editor. A cell holds up to four shortcuts. Choose **Add shortcut to slot** to see the file, folder, drop, and web link controls. Use **Back** to return to the list. Each add action fills an empty slot. Edit names in place and use the arrow buttons to reorder.
- **Save cell** applies your edits. **Cancel** or Escape discards the draft. Saving a removal clears that shortcut’s cached thumbnails and leaves the original target in place.
- The orientation button switches between 12×1.5 landscape and 1.5×12 portrait. The controls run along the left edge in portrait.

Image and website previews use Snack Storage → Cache → Shortcut thumbnails. The editor’s **Clear thumbnail cache** button clears this installation’s previews while keeping the shortcuts. Unsupported or unavailable targets use their normal icon. The cache is limited to 96 files and 8 MB across installations and follows Snack’s cache retention settings.

Local agents use the discoverable `condiment-shortcuts` action. Taffy Strip has no background runtime.
