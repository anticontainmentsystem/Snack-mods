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

Screenshot/PDF exports return a managed `downloadId`, name, MIME and size. They live alongside browser downloads under General → Storage. Export actions require library control; native menus additionally require local authority. Native-tab workspace actions require reviewed Condiment control alongside window control. Remote callers cannot acquire new grants, install extensions, approve site permissions or retrieve credentials through these APIs.

The optional **Snack Browser** Condiment is a standalone reference client in the public Snack-mods repository. Its assets, manifest, icon, instructions and agent skill are self-contained; it is not shipped or automatically installed with Snack. Other developers can build their own browser interfaces using exactly the same connector.

Electron supports only its documented subset of Chrome extensions. The connector does not claim Chrome Web Store support or bypass website, DRM, authentication or device-permission requirements.
