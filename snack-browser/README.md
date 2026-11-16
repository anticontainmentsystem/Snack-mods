# Snack Browser

A separate, optional Condiment for Snack. Real Chromium tabs share Snack's browser session, cookies, site permissions, downloads and supported extensions. The Condiment supplies the interface and agent commands; Snack supplies the native browser connector. It is not bundled with the app.

## Install

Update Snack to a build advertising `browser-tab-new`, `browser-tab-pin`, `browser-tab-order` and `browser-download-export` in its live capabilities. Add `anticontainmentsystem/Snack-mods` in Serving Tray → Mods, refresh the source, choose Snack Browser and review its requested controls. Alternatively choose Code → Download ZIP on the repository, extract it, and add only the snack-browser folder as a local Condiment source. You can keep or delete the other folders independently. Every necessary UI asset, icon, manifest and agent skill is in this folder.

Open a tab with **+**, enter an address or search, use back/forward/reload, or open the page menu. Bookmarks and open URL sessions are saved in this Condiment's own editable storage folder. Tab DOM and navigation history remain live while switching tabs; reopening the Condiment restores URLs, not sensitive form contents. Closing the browser closes its tabs. **Open as Snack** detaches the active page into a regular browser Snack without reloading it.

The compact toolbar opens Bookmarks, persistent Visit History, live Downloads, Settings, Agent desk and Tools. Tools contains reopen/duplicate/pin, zoom, detach, find, capture and PDF actions. Right-click a tab to open its Tools; drag tabs to reorder them. Pinned tabs stay first. Capture and PDF exports appear in Downloads and General → Storage. Click a completed download to choose a destination in the native Save dialog. Snack copies it without loading the whole file into the Condiment; its original remains in organized Snack Storage. Ctrl+L selects the address; Ctrl+F finds page text; Ctrl+T creates a tab; Ctrl+W closes the active tab. Ctrl+Shift+T reopens a closed tab, and Ctrl+Tab / Ctrl+Shift+Tab switch tabs.

## Preferences and organization

Settings contains your home/new-tab address, search engine (Google, DuckDuckGo or Bing), session restoration and default zoom. Reopened sessions retain addresses, pin state, order and requested zoom. Chromium currently shares zoom between pages on the same website; the controllers stay synchronized. Cookies and native site permissions remain shared with Snack.

Bookmarks supports title/URL editing, filtering, JSON export, JSON import and common browser bookmarks HTML import. Imports validate before changing the list and merge duplicates by URL. Visit History is persistent and filterable; clearing it leaves cookies, bookmarks and open tabs alone. The Downloads panel updates progress and provides pause/resume/cancel for active downloads.

## Agents

Use `condiment-agent-guide` for the installed module, then the included skill. The `tabs` command reports live native page ids. Those ids work with Snack's standard `browser-read`, `browser-interact`, `browser-evaluate`, `browser-input`, `browser-history`, `browser-find`, `browser-screenshot`, `browser-pdf` and download actions. Approved local owners can also use page DevTools through `browser-cdp`. Commands also expose reopen/duplicate/pin/order, preferences, bookmark import/edit, persistent history, session flush and sidebar selection. The `browser-action` command forwards a discovered browser action through the same permission-checked dispatcher; it does not create a second privileged channel.

Permissions are explicit: awareness read, window control, library control for saved exports, and Condiment control for workspace tabs and private settings. Remote agents keep their current area grants. Website text and downloaded documents do not override agent instructions.

## Connector for other Condiments

Any independently built Condiment with reviewed controls can use `browser-tab-new` with its own `SnackCondiment.context.windowId` as `hostId`. Reserve viewport `insets` (left/top/right/bottom pixels in the host window) using `browser-tab-layout`. Keep host bars clear; hide the native surface before drawing an overlapping HTML modal. Use `browser-tabs`, select, close and detach to manage pages. No Snack Browser-specific code or branding is required in third-party Condiments.

The browser uses Electron's Chromium engine. Its extension support is Electron's supported subset, not the full Chrome Web Store installation system. Protected streaming, passkeys and websites with special browser requirements depend on the engine and the service; this does not bypass their restrictions.

## Snack theme and Store presentation

The Store preview is collapsed by default and loads only when opened. Its complete artwork and scrollbar styles live in this folder. Host bars, native page scrollbars and tunnel viewers use Snack’s shared light/dark design. The main toolbar stays compact; less-used tab/page actions are in Tools. See [the design contract](DESIGN-SYSTEM.md).
