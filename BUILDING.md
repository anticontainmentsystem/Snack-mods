# Build an independent Condiment

Start with [the platform map](PLATFORM.md). It explains Snack’s objects, available controls, bidirectional calls and current boundaries. [Protocols](PROTOCOLS.md) covers the actual SDK/API/MCP messages. This guide turns that interface into a complete third-party bundle.

## A whole bundle

```text
my-condiment/
  snack-condiments.json
  index.html
  styles.css
  script.js
  icon.svg
  store.html                  optional isolated Store artwork
  README.md
  skills/
    SKILL.md                  optional agent instructions
```

Keep every runtime dependency inside the folder. Use relative script/style paths such as `script.js` and `styles.css`; Snack reads and bundles them. Avoid remote CDN dependencies, absolute filesystem paths and references to another Condiment’s folder. Images in runtime HTML/CSS must currently use supported data/blob URLs; a relative icon path has its own manifest loader. A build step may inline images or compile a framework into the folder before publication.

The runtime language is HTML/CSS/JavaScript, so ordinary DOM UI and precompiled frontend libraries work without Node access. External clients may be written in Python, JavaScript, Go, Rust or another HTTP-capable language. Those are separate authenticated clients, not native code secretly executed by the UI sandbox.

## The manifest is your Store identity

```json
{
  "version": 1,
  "name": "My collection",
  "description": "Workspace tools by an independent author.",
  "homepage": "https://example.com/condiments",
  "publisher": {"name": "Your name", "url": "https://example.com"},
  "condiments": [{
    "id": "workspace-inspector",
    "name": "Workspace Inspector",
    "description": "Inspect current Snacks and their available controls.",
    "version": "1.0.0",
    "entry": "index.html",
    "icon": "icon.svg",
    "homepage": "https://example.com/inspector",
    "documentation": "https://example.com/inspector/guide",
    "repository": "https://github.com/your-name/inspector",
    "tags": ["workspace", "inspection"],
    "store": {"card": "store.html"},
    "window": {"widthUnits": 10, "heightUnits": 8},
    "permissions": {"awareness": "read", "windows": "read", "condiments": "read"},
    "commands": [{
      "name": "inspect",
      "description": "Return the selected Snack’s available controls.",
      "inputSchema": {
        "type": "object",
        "additionalProperties": false,
        "properties": {"snackId": {"type": ["string", "number"]}},
        "required": ["snackId"]
      }
    }],
    "agent": {
      "instructions": "Discover current capabilities and awareness. Use inspect only for the user’s requested Snack; this guide does not grant access.",
      "skills": [{"name": "inspect-workspace", "description": "Inspect an explicitly selected Snack.", "path": "skills/SKILL.md"}]
    }
  }]
}
```

The collection’s title comes from root `name`/`title`; it is not hardcoded in Snack. Each module supplies its own name, description, publisher, icon and links. A module can override the catalog publisher. User-supplied source labels remain connection metadata; they are not your globally imposed brand.

`store.card` is optional HTML/CSS presentation inside an isolated, non-interactive frame. It does not execute scripts, call Snack, navigate the parent or replace host Install/approval controls. Use inline/data artwork and bounded content. Current card limit is 100 KB, icon limit 64 KB (SVG/PNG/JPEG/WebP), entry bundle limit 5 MB, catalog limit 100 modules, command limit 30 and requested window dimensions 1–12 grid units per side. Keep your own complete folder catalog if users should be able to install that folder alone.

## Make the interface work

```html
<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="styles.css"></head>
<body><h1>Workspace Inspector</h1><pre id="state"></pre>
<script src="script.js"></script></body></html>
```

```js
const snack = window.SnackCondiment;
const output = document.querySelector('#state');
async function refresh() {
  try { output.textContent = JSON.stringify(await snack.call('map'), null, 2); }
  catch (error) { output.textContent = error.message; }
}
snack.onChange(refresh);
snack.handleCommand('inspect', ({snackId}) =>
  snack.call('snack-controls', {id: snackId}));
refresh();
```

Themes arrive as `document.documentElement.dataset.theme`, with `light` or `dark`. Own your CSS and icons. Use responsive layout for the actual viewport rather than assuming a particular monitor size. The host supplies standard window chrome and isolation; it does not decide whether your module is a chat application, wallpaper editor, dashboard or something new.

## Compose real workflows

For a visual customization tool, upload a file with `media-begin`, sequential `media-chunk` calls and `media-finish`. Build a caller-owned `presentation-set` layer in your code, using host/content CSS rules and managed image references. Read `presentation-state` afterward. Do not introduce a host `my-brand-wallpaper` branch.

For publishing, discover sources, open a document in Studio, make revision-aware updates, save an independent ChipClip, then use the selected GitHub connection and expected SHA for a commit. Saving a ChipClip alone does not commit a repository.

For agent coordination, discover `chat-agents`, create a room with selected participants, send messages and attachments, and handle replies/reactions. A paired external agent reads its authenticated `chat-inbox` and sends replies through the same registry. Optional skills can explain your custom commands, but cannot grant controls, impersonate another agent or access private conversations.

For cross-extension work, discover an enabled module and its `condiment-agent-guide`, then call `condiment-command` with its advertised schema. Each layer retains current grants. Missing approval, a closed target window or an unavailable connected service must produce a clear error in your UI.

## Test like a third-party author

1. Copy only your one folder into a fresh directory. Connect that folder in Mods. If it needs another part of your repository, the bundle is incomplete.
2. Install and verify it cannot open before approval. Approve only read access first and check denied controls are explained.
3. Exercise light/dark themes, different window sizes, missing services and closed target Snacks.
4. Read the module guide from an API/MCP client, open the module and call its custom command. Verify both the returned result and resulting Snack state.
5. Try a remote client with fewer grants than the module. Its command must not acquire the module’s greater privileges.
6. Refresh a changed version, install the update and confirm approval resets. Disable/remove it and confirm its windows close.

## Publish and maintain

Put the complete folder and manifest in your repository. A root catalog may list several module entry paths; individual folders may also carry standalone catalogs. Document dependencies, supported services, limitations, permissions, account setup, update behavior and removal. Users can connect your repository, a folder URL or a downloaded local copy using the same process as these examples.

Provide a human README and optional agent skill. Explain intent, inputs, outputs, verification and failure handling. Never embed an agent token, mailbox password, provider refresh token or another user’s data. Check your requested actions against the live capability manifest. If a needed primitive is absent, identify the missing host connector rather than claiming your sandbox already has unrestricted OS access.

New host primitives should enter Snack’s shared action registry with schemas, current remote permission checks, API/MCP coverage, generated onboarding and meaningful tests. That is how the platform grows without forcing Snack to know every extension’s name or customization logic.
