# SDK, HTTP API and MCP

## In a Condiment: JavaScript SDK

Snack injects `window.SnackCondiment` into the isolated entry page. You do not supply an agent bearer token to this SDK.

```js
const snack = window.SnackCondiment;
const state = await snack.call('map');
console.log(state.monitors, state.snacks);

const stop = snack.onChange(async () => {
  // Coalesced invalidation: re-read state; do not assume an event payload.
  render(await snack.call('map'));
});
// stop() unsubscribes this callback.
```

`context` contains the extension ID, display name, window ID and instance name. `call(action, arguments)` returns a Promise. It rejects for denied, invalid or unavailable operations. Context names and saved IDs are not credentials.

```js
await snack.call('condiment-storage-set', {
  key: 'layout', value: {selectedMonitor: 'example'}
});
const {value} = await snack.call('condiment-storage-get', {key: 'layout'});
```

Storage is automatically scoped to the calling Condiment. Another extension cannot select your namespace by passing your ID. This JSON store is for settings, not credentials.

## Receive commands from Snack or an agent

Declare the command schema in your manifest, then implement it:

```js
snack.handleCommand('inspect', async ({snackId}) => {
  return snack.call('snack-controls', {id: snackId});
});
```

The caller discovers `condiment-agent-guide` and invokes:

```json
{"action":"condiment-command","arguments":{"id":"DISCOVERED_CONDIMENT_ID","command":"inspect","arguments":{"snackId":123}}}
```

A visible window or an owner-enabled declared background runtime must be running. When both are present, commands go to the background entry. Current command timeout is 30 seconds and the returned JSON is bounded to 1 MB. Nested SDK calls still go through permission checks; a command cannot turn a read-only caller into a privileged local actor. Current input validation handles the advertised top-level types, enums, required fields and ranges; validate your own nested domain data too.

## External clients: any language that speaks HTTP

Pair an agent under **Automation**. Use the endpoint and private credential from its generated onboarding. The localhost port is runtime configuration, not a hardcoded public service. Local and remote connections have different authorization behavior. Never include a real credential in a published example.

| Endpoint | Contract |
| --- | --- |
| `GET /api/tools` | Currently allowed tools and input schemas. |
| `GET /api/capabilities` | Revision, allowed actions, tools, connection grants and features. |
| `POST /api/call` | JSON `{"name":"TOOL_NAME","arguments":{}}`; success contains `result`. |
| `POST /mcp` | JSON-RPC 2.0 MCP initialize, ping, tools/list and tools/call. |

All require `Authorization: Bearer <paired credential>`. These are server-side/native client endpoints; browser-origin requests are rejected. A Condiment uses its injected SDK rather than bypassing that boundary with a bearer token.

Discover first, then read awareness:

```python
import os, requests
base = os.environ['SNACK_API_BASE']
headers = {'Authorization': 'Bearer ' + os.environ['SNACK_AGENT_TOKEN']}
tools = requests.get(base + '/api/tools', headers=headers).json()
def call(name, arguments=None):
    response = requests.post(base + '/api/call', headers=headers,
                             json={'name': name, 'arguments': arguments or {}})
    response.raise_for_status()
    return response.json()['result']
capabilities = call('snacks_capabilities')
awareness = call('snacks_awareness')
```

An app action is wrapped by the tool `snacks_action`:

```json
{"name":"snacks_action","arguments":{"action":"browser-state","arguments":{"id":123}}}
```

For an action requiring a launcher/configuration context, optional `targetId` chooses an existing Snack Bar or Serving Tray. It is not a way to address arbitrary native windows. Use the discovered action’s arguments for its own target ID.

HTTP authentication failures return 401; invalid or denied calls return an error response. MCP tool failures return `isError: true` with text explaining the failure. Inspect both transport status and tool result. Never retry a write blindly after an uncertain connection loss: read state first.

## MCP exchange

POST these JSON-RPC requests to the copied `/mcp` endpoint with the same bearer header:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"My Snack Client","version":"1.0"}}}
```

```json
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
```

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"snacks_awareness","arguments":{}}}
```

This implementation returns JSON responses; `GET /mcp` does not provide an SSE stream. It currently advertises `tools.listChanged: false`. Rediscover after reconnects, permission changes or unknown actions instead of assuming a subscription will update your tool list.

## Pull, push, calls, receipts and concurrency

**Pull:** read awareness, sources, documents, connection status, library contents and browser state. **Push:** use an advertised update/save/commit action. **Call:** invoke an action, an agent inbox operation or an extension command. These are precise shared operations, not arbitrary code execution on the host.

Studio documents support revision-aware edits and preserved conflicts. GitHub writes accept an expected SHA. Read before writing, handle conflicts explicitly, and read back the result. A successful call is an action response; it is not an independent guarantee that a larger multi-step intention succeeded.

Generic chat actions provide directed inboxes and authenticated sender identity. A receiver polls `chat-inbox`, reads its shared conversation, and uses `chat-send` with the room and reply target. Attachments use managed IDs and bounded chunks, not unrestricted host file paths.

Email’s built-in connector has its own durable receive/result receipts. Those receipts do not imply every SDK/REST action has a durable event or receipt history. Sandboxed background entries now run while Snack runs, with separate owner opt-in. They can receive custom commands and poll approved HTTPS services. A durable generic job/event queue is not yet present. See [runtime contracts](RUNTIMES.md).

## Runtime and network discovery

`condiment-runtime` reports background lifecycle and approved HTTPS origins. `condiment-agent-guide` includes this connectivity with commands and skills. `condiment-background` is local-owner-only lifecycle control. `condiment-http` requires an enabled Condiment context, condiments control access, an exact owner-approved public origin and current caller grants. Direct remote requests without a scoped Condiment context are rejected. Request/response bodies are text, limited to 1 MB; redirects are returned without following. No Vault value is returned or automatically injected.

## Live discovery stays authoritative

The [generated reference](API-REFERENCE.json) includes shared action names, input schemas, required areas, read/control levels and owner-only flags. A module may call its approved actions and tools; approval of all eight control areas enables local owner operations. External remote clients need their own current grants as well. Onboarding is a bootstrap prompt generated from live capabilities, not a permanent static feature list.


See [the full Snack control surface](FULL-CONTROL.md) for `capabilities()`, `tool()`, all eight control areas, local owner operations, mod-to-mod commands and Main Snack panel protection. [Host UI consistency](ui-kit/README.md) describes the shared monochrome bar controls.

Individual website tunnels stream native Chromium frames, including sites that reject iframe embedding. The browser-input action accepts normalized mouse/wheel input, keyboard keys and text only for website guests; host bars use their registered controls. Public codes and view-only restrictions remain enforced. Frames pause in hidden browser tabs. See the live action schema for exact input fields.


## Optional external Condiment services

See [External connections](EXTERNAL-CONNECTIONS.md) for the service-neutral v1 contract: discovery, owner-approved pairing and grants, background lifecycle, bidirectional commands/messages/events, durable receipts, replay recovery and revocation. Feature declarations are composable; undeclared integrations keep working without unused components. Capability discovery remains available even when its current command catalogue is empty. Internal and approved external agents use the shared API/MCP actions and current grants. Fictional examples demonstrate starting points, not limits.
