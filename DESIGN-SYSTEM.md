# Theme and shared presentation

Snack's host interface uses light/dark monochrome surfaces, square corners, high-contrast hover controls and consistent bar icons. Shared scrollbars are 9px, with a white thumb, a 1px black outline and no arrow buttons. Tracks follow the owning light/dark theme.

`snack-theme-set` sets an explicit theme for a Snack through the same controller reflected by its physical theme button. `snacks_awareness` exposes `theme` for verification. Native website guests inherit their owning browser workspace theme; ordinary browser Snacks use their own theme. Generated onboarding and live capabilities advertise the current behavior. Existing remote area grants still apply.

Core host documents, script-enabled HTML frames, native Chromium pages and tunnel viewers receive the shared scrollbar treatment. Native sites receive a user-origin stylesheet, so ordinary website author rules do not replace it. Script-disabled Store previews use adaptive CSS and inherit their iframe element's color scheme; changing theme does not reload them. Third-party website content keeps its own page layout and typography.

## Main Snack wallpaper

Main's body accepts managed data/blob images under its explicit image policy. Its grid background is transparent, and resting panels use translucent theme surfaces. Selected and hovered controls remain high contrast. No panel dimensions, positions or contents change. Condiments retain the existing restriction against removing or resizing Main panels.

## Condiment Store previews

Author-provided `store.card` HTML remains part of that author's bundle. The Store places it in a collapsed **Preview** section and creates the sandboxed iframe only when expanded. Unchanged cards and their iframe nodes are reused across unrelated updates, preventing repeated navigation/blinking. Scripts remain disabled. Authors should provide responsive, static artwork and include their scrollbar CSS for use outside Snack too.

`condiment-preview-set` controls expansion in a Serving Tray (`targetId` can select the tray). `snacks_awareness` reports the tray's `storePreviews` ids. Opening a preview does not enable or install its Condiment.

## Third-party UI authors

The SDK applies `data-theme="light"` or `data-theme="dark"` to the Condiment document root. Use it for your surfaces and form controls. Keep your own icons, artwork, CSS and scripts inside the bundle; no external Snack asset paths are required. Generated project templates include the basic branded scrollbar rules as ordinary editable CSS, not a runtime dependency.

You can build a completely different interface, game or tool with reviewed controls. Shared host bars and native browser/tunnel controls continue to use Snack's design system. Read `BROWSER-WORKSPACES.md` for native view boundaries, theme inheritance, page ids and agent controls.

## Condiment Store shelves

Every Store card has the same 300px height and equal responsive column widths. The title/icon, compact primary actions and optional agent-guide footer keep fixed positions. Descriptions, publisher metadata, links, lazy previews and expanded management controls scroll inside the middle/lower details area; they never resize the card. Use the shared white thumb with a one-pixel black outline and no scrollbar arrows. Preview controls continue through condiment-preview-set over the shared API/MCP dispatcher, and stable card/iframe identities survive unrelated Store updates. This is host presentation: authors keep their own icons, metadata and custom preview content. No Condiment install or approval is changed by the Store layout.


## Condiment options belong in the host bar menu

Keep general configuration, connection tools, diagnostic logs and secondary options in a dropdown opened from the host top bar. Primary application controls may live in content when useful. Avoid a second permanent options toolbar. The host menu follows light/dark theme, uses a one-pixel border and the themed scrollbar, and overlays native Chromium content without reducing its viewport.

Declare optional `menu` entries inside the Condiment manifest entry: `[{"label":"Show activity","command":"app-activity","arguments":{"visible":true}}]`. Each command must also be declared in `commands` with its input schema and handled with `SnackCondiment.handleCommand`. Menu clicks invoke the existing shared command path; API/MCP agents can inspect `condiment-menu-items`, open `condiment-menu-open`, or call `condiment-command` directly under their current grants. No custom host code or icon assets inside Snack are needed. Omit menu when unused; existing bundles keep working. Host-managed external connections also offer Connection settings.

For an immersive native browser workspace, explicitly set `insets:{top:18,bottom:0,left:0,right:0}` with `browser-tab-new` or the discovered layout action. The top inset reserves the standard Snack bar; the content fills the remaining area. Additional insets are for deliberately visible UI only. Do not reserve unexplained bottom space or hardcode a white background in dark mode. Keep secondary views scrollable with the shared themed scrollbar. Validate layout in both orientations, both themes and alongside native browser views.
