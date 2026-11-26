# Taffy Strip

Taffy Strip is an optional Windows shortcut launcher for Snack. Install it through the official Snack Condiments catalog and approve window control and **Save and open local shortcuts selected by you**. This release uses the Snack host’s shortcut flyout, draft editor, and thumbnail capabilities.

- **Open a populated cell** to roll out its shortcut cards beside the strip. Click a card to open its target. Use **Close** or Escape to dismiss the flyout.
- **Click an empty cell**, double-click any cell, or choose **Organize** from the flyout to open a separate editor. Each cell has four fixed spots. **Add** appears on an empty spot and **Replace** on an occupied one. Choose either to see the source controls for that spot. Use the back arrow to return to the grid. Edit names in place and use the arrow buttons to move a shortcut or swap two spots.
- **Save cell** applies your edits. **Cancel** or Escape discards the draft. Saving a removal or replacement clears the previous shortcut’s generated cache and leaves its target in place.
- The orientation button switches between 12×1.5 landscape and 1.5×12 portrait. The controls run along the left edge in portrait.

Image and website previews use Snack Storage → Cache → Shortcut thumbnails. The editor’s **Clear thumbnail cache** button clears this installation’s previews while keeping the shortcuts. Unsupported or unavailable targets use their normal icon. The cache is limited to 96 files and 8 MB across installations and follows Snack’s cache retention settings.

Local agents use the discoverable `condiment-shortcuts` action. Taffy Strip has no background runtime.
