# Build against the whole Snack environment

Condiments are not a fixed set of wallpaper or chat features. A third-party module can orchestrate the same discoverable tool and action surface used by Snack's HTTP API, MCP and connected local agents. The host does not need to recognize your module's name or purpose.

## Discover first, then act

```js
const snack = window.SnackCondiment;
const capabilities = await snack.capabilities();
// Current tools, actions, exact input schemas, features and effective grants.
const desktop = await snack.tool('snacks_awareness', {});
const created = await snack.tool('snacks_create', {
  name: 'My new Snack', html: '<h1>Hello from a third party</h1>',
  orientation: 'landscape'
});
await snack.call('terminal-command', {line: '/help'});
await snack.call('snack-orientation', {id: created.id, orientation: 'portrait'});
```

`call(action, arguments)` uses the shared action registry. `tool(name, arguments)` uses the full API/MCP harness. `capabilities()` returns the live schemas filtered to the module's effective access. New registered Snack tools become available without adding a special case for your module.

This includes window creation, placement, focus and bar controls; sources and ChipClips; Snack Bars and Serving Trays; Pasta Studio documents, revisions and live previews; settings; the Snack terminal; connected services; Condiment management, commands and background runtimes; managed media; chat and agent orchestration. Consult the live schema for the exact operation and required fields. Connected services must first be authorized by the user.

## Request the access your module needs

Users review controls per Condiment. Narrow modules should request narrow access. A local module that needs the entire environment can request all eight control areas:

```json
"permissions": {
  "awareness": "control", "windows": "control", "library": "control",
  "github": "control", "vault": "control", "settings": "control",
  "chat": "control", "condiments": "control"
}
```

After the owner approves all eight, the module can invoke local owner operations through the shared harness as well. This is explicit full control, not an implicit consequence of installing a module. Partial approval remains partial access. Modules cannot increase their own grants. Remote agent callers retain their own grants: invoking a module never converts a remote connection into a local owner. Full-control module commands require local owner authority.

Vault-backed operations use the registered connection tools. Keep credentials out of module source, chat replies and logs. Background execution and each network origin have their own existing approvals.

## Mods can work with other mods

Discover enabled modules with `condiment-status`, then read `condiment-agent-guide` for a chosen module's declared commands, schemas, optional skills and running state. Open its UI or start its approved background runtime before calling it.

```js
const guide = await snack.call('condiment-agent-guide', {id: otherModuleId});
const result = await snack.call('condiment-command', {
  id: otherModuleId, command: 'itsDeclaredCommand', arguments: {value: 7}
});
```

The receiving module registers its implementation with `handleCommand(name, handler)`. Commands return structured results or explicit errors. Both modules' grants and the initiating caller's grants apply. Use declared commands for cooperation rather than reaching into another module's private DOM or assuming its storage structure.

## Main Snack has a fixed panel layout

Modules may style Main Snack and add wallpaper, use its Pasta, change its normal orientation, open its editor and operate its controls. They may not hide/remove Main Snack panels or resize/rearrange individual panels. The host enforces this for module-owned presentation layers, including layers requested through the generic tool bridge. Palette, background, text and decorative color/shadow properties remain available; geometry and visibility properties are rejected on Main Snack. Other Snacks retain the normal presentation surface.

## Terminal and agents

`terminal-command` supports `/help`, `/actions`, `/settings`, editing commands and `/do <action> <JSON>`. It dispatches through the same current grants as a direct action call. It is Snack's terminal command protocol.

Connected OpenAI chat agents receive `snack_capabilities`, `snack_action` and `snack_tool`. Local agents receive the full current manifest, including Condiments and their guides. Other clients discover the same environment with `GET /api/tools`, `GET /api/capabilities`, or MCP `tools/list`, and execute tools through `POST /api/call` or MCP `tools/call`. The onboarding prompt is generated from current capabilities.

The module still runs in its isolated browser runtime. It does not patch Snack's installed code or gain an arbitrary Node/OS shell. Its power comes from the full Snack control surface, connected services, declared module commands and approved network/background facilities. See [protocols](PROTOCOLS.md), [runtimes](RUNTIMES.md), [building](BUILDING.md) and the [live action reference](API-REFERENCE.json).
