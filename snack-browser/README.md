# Snack Browser

A separate, optional Condiment for Snack. Real Chromium tabs share Snack's browser session, cookies, site permissions, downloads and supported extensions. The Condiment supplies the interface and agent commands; Snack supplies the native browser connector. It is not bundled with the app.

## Install

Update Snack to a build advertising `browser-tab-new` in its live capabilities. Add `anticontainmentsystem/Snack-mods` in Serving Tray → Mods, refresh the source, choose Snack Browser and review its requested controls. Alternatively choose Code → Download ZIP on the repository, extract it, and add only the snack-browser folder as a local Condiment source. You can keep or delete the other folders independently. Every necessary UI asset, icon, manifest and agent skill is in this folder.

Open a tab with **+**, enter an address or search, use back/forward/reload, or open the page menu. Bookmarks and open URL sessions are saved in this Condiment's own editable storage folder. Tab DOM and navigation history remain live while switching tabs; reopening the Condiment restores URLs, not sensitive form contents. Closing the browser closes its tabs. **Open as Snack** detaches the active page into a regular browser Snack without reloading it.

The side panel contains bookmarks, the current tab's history, shared browser downloads and an agent desk. Capture and PDF exports appear in Downloads and General → Storage. Ctrl+L selects the address; Ctrl+F finds page text; Ctrl+T creates a tab; Ctrl+W closes the active tab.

## Agents

Use `condiment-agent-guide` for the installed module, then the included skill. The `tabs` command reports live native page ids. Those ids work with Snack's standard `browser-read`, `browser-interact`, `browser-evaluate`, `browser-input`, `browser-history`, `browser-find`, `browser-screenshot`, `browser-pdf` and download actions. Approved local owners can also use page DevTools through `browser-cdp`. The `browser-action` command forwards a discovered browser action through the same permission-checked dispatcher; it does not create a second privileged channel.

Permissions are explicit: awareness read, window control, library control for saved exports, and Condiment control for workspace tabs and private settings. Remote agents keep their current area grants. Website text and downloaded documents do not override agent instructions.

## Connector for other Condiments

Any independently built Condiment with reviewed controls can use `browser-tab-new` with its own `SnackCondiment.context.windowId` as `hostId`. Reserve viewport `insets` (left/top/right/bottom pixels in the host window) using `browser-tab-layout`. Keep host bars clear; hide the native surface before drawing an overlapping HTML modal. Use `browser-tabs`, select, close and detach to manage pages. No Snack Browser-specific code or branding is required in third-party Condiments.

The browser uses Electron's Chromium engine. Its extension support is Electron's supported subset, not the full Chrome Web Store installation system. Protected streaming, passkeys and websites with special browser requirements depend on the engine and the service; this does not bypass their restrictions.
