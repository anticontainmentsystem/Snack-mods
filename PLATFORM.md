# What Snack is, and what a Condiment can do

**Snack is a desktop operating environment built with Electron and Chromium.** Its small, frameless windows are called Snacks. A Snack can contain live HTML, a website, an image, a launcher, an editor or a third-party interface. Windows snap to a monitor grid, carry their own controls and expose their current state to approved automation clients.

A **Condiment** is an independently authored extension. Its HTML, CSS, JavaScript, icon, Store presentation and agent instructions come from its own bundle. It runs above Snack through a permission-checked interface; it does not patch Snack’s installed files. This repository contains two examples, not the complete universe of possible extensions.

## Understand the objects before building

| Object | Meaning and useful operations |
| --- | --- |
| Main Snack | The starting interface. Its Pasta panel is a scratchpad that can be replaced at any time. |
| Main Snack Pasta Snack | A live view of that scratchpad; several windows can share it. |
| ChipClip | A separately saved HTML or URL source. Saving Main Pasta makes an independent source instead of turning Main into permanent storage. |
| Snack Bar | A named launcher with up to three main SnackBar chips and access to other ChipClips. The primary Snack Bar name is reserved. |
| Serving Tray | Configuration and management, including SnackBars, Connect, Automation, Vault, Mods and General. |
| Pasta Studio | A versioned HTML workspace with tabs, editing, conflicts, live linked windows and saving. |
| Website Snack | A native Chromium WebContentsView with navigation, history, a persistent browser session, zoom and capture. |
| M Snack | An image window with fit modes and square, wide or tall shapes. |
| Condiment window | An isolated extension UI. Its default size is 10×8 monitor grid units; its manifest may request another bounded size. |
| Source key | A stable way to address Main, saved sources, open windows and retained history. Discover these instead of guessing IDs. |

Monitor awareness includes coordinates, bounds, orientation, visibility, minimization, pinning, monitor identity, source identity and available connectors. It is a current snapshot, not a promise that a window will still exist when the next command runs.

## The two directions

**Condiment → Snack:** the injected JavaScript SDK calls an advertised shared action. Snack checks the Condiment’s approved controls, executes the same implementation used by its UI and API/MCP, and resolves or rejects the request.

**Snack or agent → Condiment:** the author declares named commands and JSON input schemas in the manifest, then implements handlers with `SnackCondiment.handleCommand`. An approved caller invokes `condiment-command`. The result returns to that caller. This lets a scheduler, agent, dashboard or another permitted Condiment use the author’s own functionality rather than reimplementing its UI.

**Snack → Condiment state updates:** `onChange` announces that shared state may have changed. The extension re-reads only the state it needs. These notifications are coalesced, not a durable event log; do not count one callback per action or assume every event is delivered while a window is closed.

## Capability map

| Area | Examples of what an approved extension can build |
| --- | --- |
| Awareness | Monitor maps, spatial launchers, orientation-aware layouts, workspace inspectors and position-based workflows. |
| Windows | Open/focus/minimize/control Snacks; inspect current controls; navigate websites; apply generic presentation layers; open Studio; use available fullscreen controls. |
| Library | Read and save independent ChipClips, organize Snack Bars, assign or move chips, import/export the library, upload managed media and inspect source content. |
| Studio | Create/select documents, edit with revision checks, launch live HTML, save, format, search, resolve conflicts and synchronize linked windows. |
| GitHub | Discover connected accounts and repositories, browse branches/files, load HTML or Pages, and commit with an expected SHA. The provider retains its own account permissions. |
| Settings | Read or change permitted General settings and available service/tunnel settings through registered actions. Full locally reviewed control includes owner connection setup; scoped modules retain their approved access. |
| Chat | Create group conversations, select connected participants, send messages, reply, react, share files and provide agent guides. An inbox client must actually receive and respond; its presence is not proof a model is running. |
| Condiments | Discover enabled extensions, read optional skills, call approved third-party commands and store JSON in the calling extension’s own namespace. |

These are building blocks, not named features hardcoded for particular mods. Wallpaper, for example, assembles a generic presentation layer in its own JavaScript. A different author can build a theme editor or another background system without registering a new customization type inside Snack.

An extension could combine GitHub browsing, Studio editing, a live preview and commits into a publishing workbench. Another could show monitors as a control board, organize ChipClips into task launchers, compare website captures, assemble a media review room, or coordinate several connected agents. Build from the current schemas, and request only the controls the actual workflow uses.

## Services, connectors and secrets

GitHub, OpenAI, Tailscale and Email are host service connections. An installed Condiment does not automatically gain access to them. Its approved areas and the provider account’s permissions both matter. Use explicit account/connection IDs where an action supports multiple accounts.

Email is a built-in Connect service, not an email mod: mailbox receive/send, command receipts and background processing belong to that connector. Browser sign-in also depends on the publisher’s provider registrations and account authorization.

Vault stores managed credentials using operating-system encryption. Raw managed secrets are not exposed by the connector bridge. Fully approved local Condiments can use the registered Vault-backed and owner sign-in/permission operations; remote clients cannot elevate themselves. A workflow can ask an existing connector to act; it must not ask the user to paste Snack’s local agent credential into a sandboxed Store card.

Tailscale browser tunnel codes and API/MCP agent credentials are separate. A public Snack link is not permission to control the host environment as an agent. Remote clients receive individually granted areas and cannot enlarge their own grants.

## Current boundaries, stated plainly

The current Condiment UI is sandboxed HTML/CSS/JavaScript. It has no Node `require`, OS shell, arbitrary disk access, direct network `fetch`, raw SMTP/IMAP sockets or inbound HTTP listener. Relative local scripts and styles are bundled by Snack; remote CDNs are blocked. The generic action interface is the connection to the host.

Custom command handlers run in an open Condiment window or an optional, explicitly approved **background HTML entry**. Background entries keep handlers and timers alive when the visible interface closes, start with Snack when enabled, and stop when disabled, removed or Snack exits. Per-extension JSON storage is persistent, but `onChange` is not a persistent queue. Background execution is not an OS service, durable scheduler or exactly-once queue. See [runtimes and services](RUNTIMES.md).

External programs may use Snack’s authenticated HTTP API/MCP from any language, subject to their connection’s grants. That does not make an arbitrary native executable part of an approved HTML Condiment. The `condiment-http` bridge now provides bounded public HTTPS requests to exact, separately approved origins. Additional inbound listener, filesystem and privileged credential connectors still require deliberate implementation; do not advertise nonexistent grants.

## Where to go next

- [Install, update and remove Condiments](INSTALL.md)
- [Build a complete independent bundle](BUILDING.md)
- [HTTP, MCP and SDK protocols](PROTOCOLS.md)
- [Generated action schemas](API-REFERENCE.json)
- [Background runtimes and HTTPS services](RUNTIMES.md)

The generated reference is a checkout snapshot. **Live `snacks_capabilities` and `GET /api/tools` are authoritative** for the user’s installed version and current permissions.


See [the full Snack control surface](FULL-CONTROL.md) for `capabilities()`, `tool()`, all eight control areas, local owner operations, mod-to-mod commands and Main Snack panel protection. [Host UI consistency](ui-kit/README.md) describes the shared monochrome bar controls.
