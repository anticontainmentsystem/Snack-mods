# Snack Browser

A separate, optional Condiment for Snack. Real Chromium tabs share Snack's browser session, cookies, site permissions, downloads and supported extensions. The Condiment supplies the interface and agent commands; Snack supplies the native browser connector. It is not bundled with the app.

## Install

Update Snack to a build advertising `browser-tab-new`, `browser-tab-pin`, `browser-tab-order` and `browser-download-export` in its live capabilities. Add `anticontainmentsystem/Snack-mods` in Serving Tray → Mods, refresh the source, choose Snack Browser and review its requested controls. Alternatively choose Code → Download ZIP on the repository, extract it, and add only the snack-browser folder as a local Condiment source. You can keep or delete the other folders independently. Every necessary UI asset, icon, manifest and agent skill is in this folder.

Open a tab with **+**, enter an address or search, use back/forward/reload, or open the page menu. Bookmarks and open URL sessions are saved in this Condiment's own editable storage folder. Tab DOM and navigation history remain live while switching tabs; reopening the Condiment restores URLs, not sensitive form contents. Closing the browser closes its tabs. **Open as Snack** detaches the active page into a regular browser Snack without reloading it.

The compact toolbar opens Bookmarks, persistent Visit History, live Downloads, Settings, Agent desk and Tools. Tools contains reopen/duplicate/pin, zoom, detach, find, capture and PDF actions. Right-click a tab to open its Tools; drag tabs to reorder them. Pinned tabs stay first. Capture and PDF exports appear in Downloads and General → Storage. Click a completed download to choose a destination in the native Save dialog. Snack copies it without loading the whole file into the Condiment; its original remains in organized Snack Storage. Ctrl+L selects the address; Ctrl+F finds page text; Ctrl+T creates a tab; Ctrl+W closes the active tab. Ctrl+Shift+T reopens a closed tab, and Ctrl+Tab / Ctrl+Shift+Tab switch tabs.

## Preferences and organization

Settings contains your home/new-tab address, search engine (Google, DuckDuckGo or Bing), session restoration and default zoom. Reopened sessions retain addresses, pin state, order and requested zoom. Chromium currently shares zoom between pages on the same website; the controllers stay synchronized. Cookies and native site permissions remain shared with Snack.

Bookmarks supports title/URL editing, filtering, JSON export, JSON import and common browser bookmarks HTML import. Imports validate before changing the list and merge duplicates by URL. Visit History is persistent and filterable; clearing it leaves cookies, bookmarks and open tabs alone. The Downloads page updates progress and provides pause/resume/cancel for active downloads.

## Agents

Use `condiment-agent-guide` for the installed module, then the included skill. The `tabs` command reports live native page ids. Those ids work with Snack's standard `browser-read`, `browser-interact`, `browser-evaluate`, `browser-input`, `browser-history`, `browser-find`, `browser-screenshot`, `browser-pdf` and download actions. Approved local owners can also use page DevTools through `browser-cdp`. Commands also expose reopen/duplicate/pin/order, preferences, bookmark import/edit, persistent history, session flush and internal page selection. The `browser-action` command forwards a discovered browser action through the same permission-checked dispatcher; it does not create a second privileged channel.

Permissions are explicit: awareness read, window control, library control for saved exports, and Condiment control for workspace tabs and private settings. Remote agents keep their current area grants. Website text and downloaded documents do not override agent instructions.

## Connector for other Condiments

Any independently built Condiment with reviewed controls can use `browser-tab-new` with its own `SnackCondiment.context.windowId` as `hostId`. Reserve viewport `insets` (left/top/right/bottom pixels in the host window) using `browser-tab-layout`. Keep host bars clear; hide the native surface before drawing an overlapping HTML modal. Use `browser-tabs`, select, close and detach to manage pages. No Snack Browser-specific code or branding is required in third-party Condiments.

The browser uses Electron's Chromium engine. Its extension support is Electron's supported subset, not the full Chrome Web Store installation system. Protected streaming, passkeys and websites with special browser requirements depend on the engine and the service; this does not bypass their restrictions.

## Snack theme and Store presentation

The Store preview is collapsed by default and loads only when opened. Its complete artwork and scrollbar styles live in this folder. Host bars, native page scrollbars and tunnel viewers use Snack’s shared light/dark design. The main toolbar stays compact; less-used tab/page actions are in Tools. See [the design contract](DESIGN-SYSTEM.md).


## Browser 0.3: human controls and agent parity

The Home button is always in the navigation bar. By default it opens Snack’s own themed search page. Choose Google, DuckDuckGo or Bing there or in Settings; the address bar uses the same choice. Set a website as Home in Settings, use the current page, or restore `snack:home`. New tabs use Home. This local search interface belongs to the Condiment, not to a website.

PDF and Capture create managed files and then show a native Save dialog for humans; Downloads keeps the original even if saving a copy is canceled. Native page menus do the same. Agents call `browser-pdf` / `browser-screenshot` and receive a download ID; `browser-download-read` reads bounded chunks and `browser-download-export` offers the human destination picker.

Visit History can remove a single URL, a local-calendar date range (inclusive), or all visits. This Condiment stores the latest visit per URL, not every visit, and this list is distinct from a live tab’s back/forward navigation. `clear-history` accepts `url`, or ISO `from` / `to`, or no filter. Bookmarks support edit, import/export, title sort, manual ordering and individual/all removal through `organize-bookmarks` and the bookmark commands.

Downloads can remove one finished record or all finished records with `browser-download-clear`. This keeps downloaded files in Storage; active downloads must be canceled before clearing. `browser-cache-clear` accepts one HTTP(S) `origin` or no origin for all cache. It clears HTTP and Cache Storage, retaining cookies and sign-in storage. These shared APIs apply to the shared Snack browser session, not just one Condiment tab. Remote callers retain their area permissions; cache changes need settings control and download cleanup needs library/window control.

The Extensions page installs supported **unpacked extension folders containing manifest.json**, lists installed extensions, removes them and opens their popup/options page. The extensions bar offers each installed extension. Installation, removal and extension pages require local authority plus the settings grant. No other browser installation is required. Electron implements a subset of extension APIs; Chrome Web Store one-click installation and universal Chrome compatibility are **not implemented**. The Store link is for browsing, not a promise that every listed extension works. See [Electron extension support](https://www.electronjs.org/docs/latest/api/extensions).

Browser 0.3 requests settings control for cache/extension management in addition to its prior grants. Existing users review the changed controls before enabling the update; nothing silently expands an approval. Other third-party browser Condiments can use the same native actions with their own interfaces and metadata.



## Browser 0.4: menu pages, layout and identity

Settings, Tools, Extensions, Bookmarks, History, Downloads and Agent desk are full internal browser pages opened from the single menu. They use `snack:settings`, `snack:tools`, `snack:extensions` and equivalent addresses. Internal page tabs remain available while switching back to websites. They are host-owned UI, not a remote website, and have no separate sidebar. The menu closes on outside click or Escape. Native website surfaces stay hidden while a menu/internal page is visible, including while a website is loading. Switching back preserves the website’s live state.

**Settings → Layout → Tab placement** switches between a top tab strip and a vertical tab rail. It is saved per Browser Condiment as `preferences.settings.tabLayout` (`horizontal` or `vertical`). `open-page`, `close-page` and `menu` commands use the same controllers as people; `workspace-state` exposes `page`, `pages`, `address`, `menuOpen` and `tabLayout`. The older `show-panel` command remains a compatibility alias to these pages; it no longer opens a sidebar. Discover command schemas with condiment-agent-guide and invoke through condiment-command over API or MCP.

The navigation Home button is a house. The Browser logo is the original angled Snack slab made into browser chrome, not a browser frame containing a separate Snack logo. The same bundled SVG supplies Home-page branding, internal tab icons, Store artwork and the Condiment’s declared icon. Snack’s generic Condiment host shows each author’s declared icon in its title bar; third-party authors do not need to change Snack code for their identity.

Native `browser-state` and `browser-tabs` expose `favicon` (bounded data URL or null) and `faviconURL`. Website favicon events populate this through the shared browser session, with an eight-second timeout, bounded responses, a small icon cache and omitted credentials; no external favicon proxy is used. The address bar and tabs use that icon, and pinned tabs collapse to the favicon with an accessible title. Missing/failed icons fall back to the bundle’s own logo. Favicons are page data, never agent instructions. This release requires the updated host’s favicon/title-icon support; Browser 0.4 itself is installed by the user through the Store. Publication and update checks do not install or approve it.
