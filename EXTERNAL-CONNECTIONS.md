# External Condiment connections · v1

Snack is a desktop operating environment. A Condiment is a separately installed extension. An external connection lets an approved Condiment connect its own page, application or agent service to Snack's existing controls. There is no per-developer registration with Snack's publisher and no app-specific connector in Snack core.

**Everything in this guide is optional for existing Condiments.** Omit `externalConnections` entirely if you do not use it. No key, pairing UI, external server, extra declaration or background entry is then required. Your current Condiment continues working as before. This guide uses the fictional Picnic application only; it is not a hosted product or required service.

## Choose the pieces you actually use

| Piece | Declaration | What it adds |
| --- | --- | --- |
| Connection and discovery | An `externalConnections` entry | Owner consent, installation binding, Vault credentials, status, reconnect/revoke, live capability discovery |
| App capabilities | `commands` feature | Snack/humans/agents call your arbitrary declared capabilities and read results |
| Events | `events` feature | Your service sends data/state events into Snack |
| Agent identity/messages | `agent` feature and `agentName` | Your runtime appears as its own external agent, with direct addressed conversations |
| Snack control | `snack-api` feature plus explicit area grants | Your service requests any currently permitted shared Snack API/MCP tool; never a reduced fixed list |
| Continue without a window | `lifecycle: "background"` | Snack's host connector stays available while Snack runs, after closing the visible Condiment; separate owner approval required |

Features compose. A feed can expose events now and more capabilities later. Discovery is always present, even with an empty command catalogue. Adding features or access in a new Condiment declaration changes its review digest and requires fresh review. New runtime capabilities are discovered without hardcoded Snack changes; they must stay within the installed declaration and owner grants.

`lifecycle: "window"` is the default: communication pauses when the last visible Condiment window closes and resumes when reopened. A host-managed external background connection does **not** require an otherwise-unused Condiment `background` HTML entry. That older optional field remains available for your own sandboxed background code.

## Manifest

This entry belongs inside the existing `condiments` array in your own complete `snack-condiments.json` bundle:

```json
{
  "id": "picnic",
  "name": "Picnic",
  "entry": "index.html",
  "permissions": { "awareness": "read", "windows": "control", "chat": "control" },
  "network": { "origins": ["https://picnic.example"] },
  "externalConnections": [{
    "id": "picnic-service",
    "name": "Picnic connection",
    "origin": "https://picnic.example",
    "basePath": "/api/snack",
    "approvalUrl": "https://picnic.example/connect",
    "lifecycle": "background",
    "features": ["commands", "events", "agent", "snack-api"],
    "agentName": "Picnic",
    "permissions": { "awareness": "read", "windows": "control", "chat": "control" },
    "privacyUrl": "https://picnic.example/privacy",
    "termsUrl": "https://picnic.example/terms",
    "dataUse": "Describe exactly which messages, command data and files leave the device, retention/deletion and processing providers.",
    "charges": "Describe any credits/charges and whose account pays."
  }]
}
```

The `.example` address is fictional: replace it with your own HTTPS service. `externalConnections` ids are unique within your Condiment. `origin` must also be in `network.origins`; redirects, cookies, private/reserved addresses and arbitrary ports are not used by the host connector. `basePath` is origin-relative. `approvalUrl` must be on that origin. External grants must be requested by the Condiment too; neither approval inherits access from another Condiment. Agent messaging needs `chat: control`. Other features do not require an agent identity or chat permissions.

Your icons, CSS, labels, onboarding/skills and custom application behavior stay in your bundle. Snack implements the shared connection mechanisms; it does not contain your application logic. Do not include keys or account passwords in a bundle.

## Owner experience and approval

1. The owner installs and reviews the Condiment's normal controls and HTTPS origins.
2. In its Store card → Settings → External connections, the owner reviews the service disclosures, individual Snack area grants and optional background lifecycle.
3. Generate a ten-minute, single-use pairing code. It is encrypted in Vault. The receipt returned through API/MCP contains metadata, not the code.
4. Open the declared service approval screen. Snack passes the code and binding metadata in a URL fragment, not a query string. Your owner UI reads `snack-pair` from the fragment, clears it immediately with `history.replaceState`, authenticates the service owner and confirms the installation, Condiment and origin before calling `/pair/expect`. Never log the fragment or put it in analytics. If login requires navigation, reopen approval from Snack after login rather than persisting the code indefinitely.
5. Finish pairing in Snack. Snack exchanges the code for service-issued connection and session credentials and stores them in Vault. The service, page and agent never receive a reusable Snack owner-access token.

The canonical `condimentId` is the exact opaque installed `id` returned by `condiment-status`, not the display name or bare package slug. Accept 1–256 characters intact; current ids may be 108 characters. `installationId` is generated and persisted by Snack. Service `connectionId` is stable across reconnects; a session is temporary.

Snack never asks the developer to hand-edit a shared key map for each user. Your service needs its own owner approval screen and authentication; that is distinct from Snack's local owner consent. The 128-bit code is bound to the intended identity tuple at `/pair/expect`, consumed atomically on a successful matching exchange, throttled on bad attempts and never logged. A failed guess must not consume another owner's valid code.

## HTTPS service contract

All paths are under the declared `basePath`. Session tokens authenticate data-plane requests. Connection tokens authenticate binding control and session open. The service stores credential hashes and enforces its own binding state on every request. Validate bodies using [the published schema package](protocol/external-v1/README.md).

| Endpoint | Authentication | Shape/purpose |
| --- | --- | --- |
| `POST pair/expect` | Your service's owner authentication | `{code,label,condimentId,installationId,origin}` → `{ok:true,expires}`. Owner-approved binding tuple. |
| `POST pair/exchange` | One-time code | Same tuple, without label → `{ok:true,connectionId,connectionToken,session:{sessionId,sessionToken,expires,resumeCursor}}` |
| `POST session/open` | Connection token | `{}` → `{ok:true,connectionId,sessionId,sessionToken,expires,resumeCursor}` |
| `POST session/renew` | Current session token | `{}` → `{ok:true,sessionId,sessionToken,expires}`. Preserve binding, cursors and work. |
| `POST session/close` | Session token | End only that session; preserve approved binding and work. |
| `POST binding/disconnect` | Connection token | `{}` → `{ok:true,state:"disconnected"}`. Explicit owner disconnect stops communication/automatic reconnection. |
| `POST binding/reconnect` | Connection token | `{}` → `{ok:true,state:"active"}` |
| `POST binding/revoke` | Connection token or your service's owner | `{}` → `{ok:true,state:"revoked"}`. Invalidate all sessions and refuse re-opening. Requires fresh pairing afterward. |
| `GET capabilities` | Session token | `{ok:true,capabilities:[...]}`; always available, even if catalogue is empty. |
| `POST command` | Session token | Snack command envelope → immediate sequence-free command acknowledgement; final result/error goes on the stream. Required when exposing app commands. |
| `GET stream?after=N&wait=15&limit=100` | Session token | Multiplexed delivery of events, results, addressed messages and Snack-tool requests. Required for the features using delivery. |
| `POST stream/ack` | Session token | `{cursor}` → `{ok:true}`. Highest contiguous durable receipt, not command completion. |
| `POST ingest` | Session token | `{items:[...]}` → `{ok:true,received:[{id,stored:true}]}`. Required for messages, Snack-tool acknowledgements/results or other inbound items used by your integration. |
| `POST stream/resync-accept` | Session token | `{connectionId,checkpointId,snapshotSeq,acknowledgedLoss}` → `{ok:true,ackCursor}`. Only when a recovery checkpoint is offered. |

Owner management, authentication and discovery are base plumbing. Unused functional features need no dummy commands, agent, event producer or model integration. Methods supporting your declared features must work; capabilities not implemented are declared unavailable with a recovery condition, not falsely successful.

The same APIs are accessible to trusted local automation through registered `external-*` Snack actions. Owner approval, pairing, credential management, reconnect/revoke and loss acceptance remain owner controls. Remote agents cannot approve themselves or retrieve managed secrets.

## Wire envelopes and delivery

```json
{
  "v": 1, "type": "command", "id": "request-123",
  "connectionId": "service-binding-id", "ts": 1794910000000,
  "body": { "name": "picnic-status", "args": {} }
}
```

Types: `command`, `ack`, `result`, `error`, `event`, `message`. A `correlationId` on a reply names the request being answered. A sender's id namespace is scoped by binding and direction. On stream delivery only, every item has an immutable per-connection `seq`; the HTTP batch includes the authenticated current `sessionId`. `originalSessionId`, if present, is historical. Replayed items are not rewritten. Ingest and synchronous acknowledgements carry no delivery sequence.

Results use `body:{ok:true,state:"done",data:...}`. Errors use `body:{ok:false,code,retryable,message}`. Command acknowledgements use `body:{accepted:true}` with optional duplicate/status information. Accepted is not completed. Jobs can be long-running; do not hold the HTTP call open until speech, rendering or other work finishes.

Snack durably records a contiguous batch before acknowledging it. Execution then goes through the current shared harness and fresh grants. Already executing work found after a Snack restart is marked uncertain instead of blindly re-executed. A repeated command id with identical arguments must return its original receipt/status; different arguments conflict. The service must atomically record acceptance before effects, and apply the same deduplication guarantees to `/ingest`.

One long poll per connection; 15-second server wait leaves room under the host's existing 20-second network timeout. Batches are at most 100 items and each HTTP request/response currently uses the existing 1 MB transport boundary. This is message framing, not a fixed limit on your capabilities or application. Reference large media by managed ids or application URLs; do not inline entire files into every event. For transient failures, Snack backs off from one to thirty seconds and honors service retry delays. A prematurely empty poll does not trigger a busy request loop.

An owner revoke blocks new Snack execution immediately. Snack retries remote revocation notification when a service is unreachable and visibly reports **remote notification pending**. It cannot undo completed external effects or claim an unreachable service received the revocation. Your service must check binding authorization before starting queued work and disclose what can finish or be cancelled.

Replay gaps never silently skip transactional messages/commands/results. Offer an identifiable snapshot that covers the missing state through `snapshotSeq`, list unrecoverable transactional items, preserve later items, and require explicit owner acceptance of the exact checkpoint/loss list. Advancing beyond it additionally requires contiguous durable receipt. Ordinary reconnection and closing a window do not imply acceptance of lost work.

## Full Snack control and agent conversations

A service request on the stream uses an exact advertised tool name:

```json
{
  "v":1,"type":"command","id":"inspect-1","connectionId":"service-binding-id",
  "seq":1,"ts":1794910000000,
  "body":{"name":"snacks_capabilities","args":{"query":"Pasta Studio ChipClip"}}
}
```

Then call `snacks_action` with `{action:"<discovered action>",arguments:{...}}`, or any other discovered Snack tool. No hardcoded subset replaces the live registry. These requests run as a remote actor under the intersection of the connection's approved grants and the installed Condiment's current grants. Disabling or updating the Condiment pauses access pending review. Remote actors cannot grant themselves owner authority or read managed credentials.

With the optional `agent` feature, Snack supplies the stable agent identity. Send a stream message with `body:{to:"<discovered Snack agent id>",text:"..."}`. Snack attributes it to the authenticated external agent, creates/reuses its direct conversation and routes replies through `/ingest`, preserving `correlationId`. Do not spoof `from`. Runtime-provided sender text is not identity. Native/subscription and API models can participate without being renamed into a second agent. When a native model delegates tool calls on behalf of the external actor, Snack keeps that actor's current grants; it does not substitute local owner access.

## Optional Condiment SDK helpers

The existing `window.SnackCondiment` remains unchanged. Its new `.external` namespace is optional and carries no credentials:

```js
const { connections } = await SnackCondiment.external.connections();
const connection = connections.find(c => c.declarationId === 'picnic-service');
const schemas = await SnackCondiment.external.capabilities(connection.id, {
  query: 'status', view: 'schemas'
});
const job = await SnackCondiment.external.command(connection.id, 'picnic-status', {});
const result = await SnackCondiment.external.result(connection.id, job.id, 5000);
const events = await SnackCondiment.external.events(connection.id, 0);
```

Capability search is paginated and inline. Use `names` for exact schemas and `nextOffset` for another page. Discovery remains available to every connection. Calling external capabilities requires the feature/approval, not additional unused chat functionality. `SnackCondiment.onChange` announces new state; read events/results after it rather than creating a polling timer in each panel. Owners configure consent in native Store controls; your sandboxed page never receives the connection/session credentials.

See `external-status`, `external-capabilities`, `external-command`, `external-result`, `external-events`, `external-send`, owner pairing/management actions and the live `snacks_capabilities` schemas. General agents can discover and invoke these same actions. Human buttons and agents use the same handlers.

## Build, test and release

Use the schema package and generic conformance examples without contacting Snack's developers. Your app can be written in any language; neither Python nor Node is a Snack-user requirement. A persistent external backend is needed for the HTTPS protocol's independent background behavior. A local scripted simulation is not an authenticated external backend.

Test pairing consent, identity binding, empty discovery, all feature combinations you actually use, partial acknowledgements, duplicate requests, conflicting ids, unknown outcomes, queued work, reconnect, reduced grants, revocation during an outstanding poll, offline revocation notification and replay recovery. Verify application effects as well as protocol receipts. Privacy/service disclosures and a usable owner approval UI are required before real acceptance testing; production deployment is a separate decision.

[Picnic Lab](picnic-lab/README.md) is an optional fictional, local simulation for users and agents. It demonstrates discovery, event/command/message scenarios and optional real Snack actions. It needs no external server, key or account and is not bundled into Snack. The shared protocol schemas are a contract, not app-specific code embedded in Snack.


### Rendering SDK outcomes

`external.result` returns `{id,status,result,error}`. Only `status:"done"` is a completed success. Show `result` then; show `error` for failed or uncertain work. Sending, accepted and running are pending states, not completion. Connection-record existence alone does not mean connected: inspect `state`, `active` and `available`. Keep a separate display cursor for retained events; do not replace the host durable transport cursor. Secondary settings and logs belong in the optional host menu described in [Design system](DESIGN-SYSTEM.md).
