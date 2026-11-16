# Browser workspaces and visible controls

Snack owns Chromium. Ordinary website Snacks can show a compact navigation/address bar and native page menu when General → UI → Browser → Browser controls is enabled. `general-update` with `{settings:{browserControls:true}}` changes existing windows immediately; the default is false. Page view bounds and tunnel input/captures adapt to the toolbar. A website never receives the host IPC bridge.

Pasta Studio's `configure` bar control uses `tray-toggle` to show/hide the primary Serving Tray at its remembered position. The icon is the same shared Serving Tray icon used elsewhere. Tunnel cards show their actual URL as an always-visible launch button; `tailscale-launch` opens a configured active route as a native browser Snack. `tailscale-status` and `snacks_serve_status` remain authoritative, and connection state is pushed and refreshed in the UI. Public access codes stay in Vault and are never added to copied or launched URLs.

## Native tabs for any Condiment

An approved Condiment can host real native website views, without page iframe restrictions or browser implementation code in the Condiment:

```js
const hostId = SnackCondiment.context.windowId;
const page = await SnackCondiment.call('browser-tab-new', {
  hostId, url: 'https://example.com/',
  insets: { left: 0, top: 110, right: 0, bottom: 40 }
});
await SnackCondiment.call('browser-read', { id: page.id });
```

Only a Condiment can be the workspace host; Main Snack and Studio cannot be overlaid. Viewport insets are host pixels, with top and bottom host bars protected. Recalculate them on resize via `browser-tab-layout`; set `visible:false` before showing an overlapping HTML modal. Browser guests are native views above HTML, so ordinary z-index cannot cover them.

`browser-tabs` lists pages for a host; select/close/detach operate on the returned page id. Tabs retain live DOM, navigation and shared cookies when switched. Detach moves the same page into a normal Snack. Closing the owning Condiment closes attached pages; detached pages survive. Awareness exposes `browserOwnerId` so agents can distinguish workspace pages from standalone Snacks. Hidden tab shells do not appear in Snack Time or taskbars.

All existing native page tools accept tab ids: read, interact, evaluate, input, navigation, zoom, downloads and owner-approved page CDP. Page tools target guest WebContents, never the Condiment or app renderer. `browser-state.coordinateSpace` is `page` for embedded tabs (normalized page viewport) and `snack` for ordinary website Snacks (normalized full Snack, excluding host bars from input).

## More page tools

- `browser-history`: entries and current navigation index for one page.
- `browser-find` / `browser-find-stop`: native text search and clearing.
- `browser-screenshot`: viewport or full-page PNG export.
- `browser-pdf`: native PDF export without a print dialog.
- `browser-downloads` / `browser-download-read`: locate and retrieve exports in bounded chunks.

Screenshot/PDF exports return a managed `downloadId`, name, MIME and size. They live alongside browser downloads under General → Storage. Export actions and native page menus require library control in addition to window control. Native-tab workspace actions require reviewed Condiment control alongside window control. Remote callers cannot acquire new grants, install extensions, approve site permissions or retrieve credentials through these APIs.

The optional **Snack Browser** Condiment is a standalone reference client in the public Snack-mods repository. Its assets, manifest, icon, instructions and agent skill are self-contained; it is not shipped or automatically installed with Snack. Other developers can build their own browser interfaces using exactly the same connector.

Electron supports only its documented subset of Chrome extensions. The connector does not claim Chrome Web Store support or bypass website, DRM, authentication or device-permission requirements.

## Organization and durable clients

`browser-tab-pin` changes pin state; `browser-tab-order` validates an exact permutation of current host-owned page ids and keeps pinned pages first. Closing a tab waits for its actual closure before selecting a neighboring tab. `browser-state.find` exposes match counts; find `next:false` starts a search and `next:true` advances it. Navigation clears old match counts. `targetZoom` retains the controller request while a page loads. Native Chromium zoom in this build is shared by same-origin pages, so affected controllers are synchronized.

`browser-download-export` requires library and window control, opens a native destination picker and copies the completed download directly. No destination path may be supplied or returned; a remote caller cannot approve that dialog through this API. The original managed file remains in Storage.

The standalone browser client owns its preferences, bookmark import/export, visit history, closed tabs, mutation queue and session persistence. These are not hardcoded into Snack; third-party browser Condiments may implement different policies on the same native connector.

`browser-focus` requests page, address or find focus through the shared bridge; it never accepts arbitrary host selectors or keystrokes. Human-created tabs focus the address field, and selecting a tab returns keyboard focus to its page when the workspace is active.

## Browser 0.3: human controls and agent parity

The Home button is always in the navigation bar. By default it opens Snack’s own themed search page. Choose Google, DuckDuckGo or Bing there or in Settings; the address bar uses the same choice. Set a website as Home in Settings, use the current page, or restore `snack:home`. New tabs use Home. This local search interface belongs to the Condiment, not to a website.

PDF and Capture create managed files and then show a native Save dialog for humans; Downloads keeps the original even if saving a copy is canceled. Native page menus do the same. Agents call `browser-pdf` / `browser-screenshot` and receive a download ID; `browser-download-read` reads bounded chunks and `browser-download-export` offers the human destination picker.

Visit History can remove a single URL, a local-calendar date range (inclusive), or all visits. This Condiment stores the latest visit per URL, not every visit, and this list is distinct from a live tab’s back/forward navigation. `clear-history` accepts `url`, or ISO `from` / `to`, or no filter. Bookmarks support edit, import/export, title sort, manual ordering and individual/all removal through `organize-bookmarks` and the bookmark commands.

Downloads can remove one finished record or all finished records with `browser-download-clear`. This keeps downloaded files in Storage; active downloads must be canceled before clearing. `browser-cache-clear` accepts one HTTP(S) `origin` or no origin for all cache. It clears HTTP and Cache Storage, retaining cookies and sign-in storage. These shared APIs apply to the shared Snack browser session, not just one Condiment tab. Remote callers retain their area permissions; cache changes need settings control and download cleanup needs library/window control.

The Extensions page installs supported **unpacked extension folders containing manifest.json**, lists installed extensions, removes them and opens their popup/options page. The extensions bar offers each installed extension. Installation, removal and extension pages require local authority plus the settings grant. No other browser installation is required. Electron implements a subset of extension APIs; Chrome Web Store one-click installation and universal Chrome compatibility are **not implemented**. The Store link is for browsing, not a promise that every listed extension works. See [Electron extension support](https://www.electronjs.org/docs/latest/api/extensions).

Browser 0.3 requests settings control for cache/extension management in addition to its prior grants. Existing users review the changed controls before enabling the update; nothing silently expands an approval. Other third-party browser Condiments can use the same native actions with their own interfaces and metadata.

## Chat transcript copying

Simple Agent Chat 0.1.5 supplies per-message **Copy** and conversation **Copy chat**. Long text stays selectable and scrolls inside its message with the themed scrollbar; outer conversation scrolling stays separate. `chat-copy` copies a message or entire room transcript locally. Remote agents use permission-checked `chat-read`; clipboard writes are local-only. The Condiment’s `copy-transcript` command exposes the same operation. Transcripts include sender, timestamp, text and attachment names, not attachment bytes or credentials.
