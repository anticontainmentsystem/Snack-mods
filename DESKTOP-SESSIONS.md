# Desktop restoration and Serving Tray priority

Snack remembers the open desktop by default. General → Preference → **Restore desktop on startup** controls whether the next launch restores it. On a fresh desktop, Main Snack follows the cursor/primary-monitor preference. A restored Main Snack uses its saved location instead.

The desktop is saved after layout/source changes settle and again before normal quit. Restoration includes Main Snack, HTML and URL Snacks, M Snacks, Snack Bars, Serving Trays, Pasta Studio and enabled Condiment instances. It preserves monitor, bounds, orientation, theme, pin/minimize/visibility state, source/document/ChipClip links, image and fit, and native Condiment browser tabs. Closed individual Snacks are removed from the next snapshot. Browser pages reopen their addresses and session cookies; unsent forms, JavaScript heaps, media playback position and arbitrary in-memory Condiment state are not serialized. Condiment authors should use their own private storage for durable application state.

Exact saved geometry preserves snapped alignment on unchanged monitors. Resized monitors use Snack grid-unit scaling; unavailable monitors fall back to an available display and clamp windows inside its work area. This cannot preserve an off-screen arrangement when there is no room for it. Disabled, removed or unavailable Condiments/ChipClips are skipped, never installed or approved by restoration. Discover errors through desktop-session-status.

Layout metadata lives in the existing internal runtime storage as desktop-session.json. Unlinked HTML sources are stored once by content hash under **Snack Storage → Pasta → Desktop session**; moving a window does not rewrite its HTML. Linked Pasta and ChipClips use their existing persistent documents. M Snacks retain managed media references and original bytes. Referenced desktop HTML and media are protected by Storage cleanup. Credentials stay in Vault/browser/provider stores; layout records do not copy managed credentials.

## API and MCP

- `general-update` accepts `{settings:{restoreDesktop:true}}` or false through the existing settings dispatcher.
- `desktop-session-status` returns enabled/restoring state, saved time, count and errors. It returns no saved HTML, URLs, tokens or machine paths. Requires settings read and windows read.
- `desktop-session-save` checkpoints the current desktop for next launch and returns the same status. Requires settings control and windows read. It does not close/reopen windows or grant permissions.

Discover current schemas with snacks_capabilities. HTTP and MCP use the same actions, registry and remote area grants. Onboarding is generated from those live capabilities.

## Window stacking

When **Serving Tray always on top** is enabled, Serving Tray stays above ordinary Snacks, pinned Snacks and Condiments. Condiments are independent windows and are not parented above the Tray. Closing/hiding Tray cannot close them. Native save/extension/permission dialogs temporarily yield Tray priority and restore it afterward. OAuth authorization retains its existing yield. The explicitly enabled pinned-fullscreen experiment remains the higher-priority exception.

## Browser toolbar and genuine new tabs

Snack Browser 0.4.1 adds **Tools → Show these tools in tool bar**. It mirrors the same page/tab controls in a compact optional toolbar; it does not add a second action path. `preferences.settings.showToolsInToolbar` is the agent equivalent and defaults to false.

Every New tab gets a distinct native page id, including the local themed search/start page. The start page uses an isolated **about:blank** guest under its own tab, with the themed interface supplied by the Condiment. A search navigates that new guest, preserving existing website tabs. Selecting, closing, reopening and restoring start tabs use the same tab controller. The host permits exactly about:blank in addition to HTTP(S), never arbitrary about/file/application pages. Third-party browser Condiments may use the same safe blank-tab capability. New Browser releases are published to the Store; checking for them does not install or approve them.

Awareness includes a stable sessionKey for restored windows and condimentInstance for module instances; runtime numeric window IDs can change after restart. Locate the current window by sessionKey before sending controls. The previously running embedded Tailscale service is reconnected without changing tunnel visibility, codes or approvals. Expired provider authorization still requires the normal user sign-in. Local tunnel views that initially fail while the service starts are retried when it becomes ready.
