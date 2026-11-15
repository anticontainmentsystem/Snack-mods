# Receive, call, act and return a result

A Condiment can supply a visible UI, a separately approved background HTML entry, custom command receivers and exact service origins. Snack supplies the sandbox and shared controls; the author supplies the workflow.

## Three receivers

1. **Visible interface:** your entry HTML receives `window.SnackCondiment` and can register handlers. Its code runs while its window is open.
2. **Background entry:** optional background HTML receives the same SDK in a hidden sandboxed host. It runs while Snack runs and the owner has enabled it. Its handlers/timers survive the visible interface closing.
3. **External process:** a separately paired program or agent uses authenticated HTTP or MCP. It may use any HTTP-capable language, subject to current grants. This does not load arbitrary native code into the HTML sandbox.

All use the same shared action registry. Background code does not receive a separate privileged behavior path.

## Manifest and approval

```json
{
  "version": 1,
  "name": "My collection",
  "condiments": [{
    "id": "service-board", "name": "Service Board", "version": "1.0.0",
    "entry": "index.html", "background": "worker.html",
    "permissions": {"condiments": "control", "awareness": "read", "windows": "read"},
    "network": {"origins": ["https://api.example.com"]},
    "commands": [{"name": "inspect", "description": "Return a workspace summary",
      "inputSchema": {"type": "object", "properties": {}, "additionalProperties": false}}]
  }]
}
```

`background` is an HTML path relative to the source. Its relative JS/CSS files are bundled just like the visible entry. Keep every dependency inside the source. Never ship a real credential in the bundle.

The review lists requested Snack areas, exact HTTPS origins and background execution. Origins/background are **unchecked by default**. Installation is not approval. Enabling the visible UI does not automatically approve destinations or start a background entry. The owner may approve only needed controls.

Entries, origins and controls are covered by the version digest. Installing changed content resets approvals, disables it and closes existing instances. Disabling/removing the module closes its UI and background hosts. Background startup is restored with Snack only for modules still enabled with background execution selected. The module Settings expose Start/Stop background independently of its visible UI.

## Implement a background entry

`worker.html` can be ordinary HTML containing a relative script:

```html
<!doctype html><html><head><meta charset="utf-8"></head><body>
<script src="worker.js"></script></body></html>
```

```js
const snack = window.SnackCondiment;
let summary = null, polling = false;
async function refresh() {
  if (polling) return;
  polling = true;
  try {
    const response = await snack.call('condiment-http', {
      url: 'https://api.example.com/status', method: 'GET'
    });
    if (!response.ok) throw Error('HTTP ' + response.status);
    summary = JSON.parse(response.body);
    await snack.call('condiment-storage-set', {key: 'summary', value: summary});
  } finally { polling = false; }
}
snack.handleCommand('inspect', async () => ({
  summary, workspace: await snack.call('map')
}));
setInterval(() => refresh().catch(console.error), 60000);
refresh().catch(console.error);
```

Describe each handler's input schema in the manifest. Return JSON or throw an informative error. Callers invoke `condiment-command` with the discovered ID, command name and arguments. When both UI and background are running, commands go to background. Register handlers there and avoid duplicate side-effecting timers in both hosts.

`condiment-runtime` reports declared/enabled/running state and approved origins. `condiment-agent-guide` includes the author's commands, skills and current connectivity. `condiment-background` is owner-only lifecycle control; remote clients cannot start their own worker or approve destinations.

## Public HTTPS bridge

```js
const response = await snack.call('condiment-http', {
  url: 'https://api.example.com/items', method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({title: 'A user-requested item'})
});
if (!response.ok) throw Error('HTTP ' + response.status);
const result = JSON.parse(response.body);
```

The response has `status`, `ok`, `headers`, text `body`, `bytes`, and `redirectFollowed: false`. HTTP error statuses are responses; DNS/TLS/permission/size/time failures reject. Check both layers.

Methods: GET, HEAD, POST, PUT, PATCH, DELETE and OPTIONS. GET/HEAD accept no body. Limits: 1 MB request and response bodies, 16 KB request headers, 10-second DNS lookup and 20-second request lifetime. Responses are text, not arbitrary binary streams.

Only exact approved public HTTPS origins on port 443 are accepted. No wildcards, paths in origin declarations, URL credentials, IP literals, localhost, private/reserved addresses or cloud metadata endpoints. All DNS results must be public; TLS uses the validated address. Redirects are not followed; a next URL needs its own explicit request and approved origin. Certificate validation stays enabled. Cookie, Host, proxy and hop-by-hop overrides are blocked; response cookies are not exposed.

The bridge does not retrieve or inject managed Vault credentials. Do not store secrets in plain JSON settings or include them in source. A provider needing managed OAuth, privileged credential binding, inbound webhooks, binary streams or raw sockets needs a deliberately designed connector. Existing host-service actions can use their own authorized connections without returning credentials.

## State and delivery

`condiment-storage-get/set/remove` is scoped to the calling module, bounded to 1 MB per JSON setting. Use it for settings, checkpoints and cached results, not credentials. `onChange` is coalesced invalidation: re-read state rather than expecting a guaranteed event per operation.

A `call` Promise returns the shared action result. A custom command returns its result to the caller. Closing a runtime during a command returns an error. After uncertain loss during a write, read the changed state before retrying.

Background execution is not durable delivery or exactly-once processing. It does not run when Snack is closed, the computer sleeps or it is offline. There is no generic persisted job queue or catch-up scheduler yet. Authors should checkpoint, use idempotency/revisions where available, and report uncertainty. Email's durable command receipts do not automatically apply to other extension calls.

## Agents and external programs

Keep paired credentials in the external client, not in a Condiment. Discover HTTP tools or MCP tools/list, read capabilities and awareness, then invoke shared actions through `snacks_action`. Live schemas/grants remain authoritative.

An external client may use `condiment-invoke` for a discovered enabled module. Approved module grants intersect with caller grants. Direct remote `condiment-http` calls without module context are rejected. Custom commands require the target module's approved areas/levels. Owner-only management and managed Vault controls remain unavailable to extensions.

Skills should explain intent, arguments, outputs, side effects, service dependencies, verification, errors and idempotency. A skill is guidance, not authorization, and must not contain a real token or connection code.
