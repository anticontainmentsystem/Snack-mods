# Picnic Lab

An optional fictional external-agent playground. It is a complete independent Condiment, not bundled into Snack.

The external page and agent are **local scripted simulations**. No network service, model, secret, pairing or external account is created. A simulated connection must not be mistaken for successful authentication against a real service.

Choose Events and discovery, Callable app capabilities, Agent conversations, or Everything together. Every scenario keeps capability discovery available. Events, acknowledgements, results and the latest envelope show how the boundary behaves. Human buttons and declared Condiment commands use the same handlers.

Buttons under **Real Snack controls** really read the current desktop, open Pasta Studio or save an independent ChipClip. They preserve Main Snack Pasta. Sending to a selected real agent really creates a conversation and may consume that agent's subscription/API allowance. No automatic agent loop runs.

## Two-way exercises

- **Threaded reply and retry** shows a Snack message crossing into the fictional app. Picnic returns a correlated reply. Repeating the same submission yields one queued reply.
- **Two-agent handoff** shows Picnic asking a fictional internal agent for one read-only result, with named participants and a threaded response. In the real-agent exercise, choose a connected agent to try the live Snack model path.
- **Bundle tool notifications** shows why the protocol keeps individual acknowledgements and results even when the service sends a single wake-up.

The three scripted exercises are available as `picnic-roundtrip`, `picnic-delegation`, and `picnic-receipt-batch` through the same Condiment command registry as the buttons.

## Install

Add the official repository to Serving Tray → Mods, refresh, install Picnic Lab and review the requested controls. You can instead download this complete folder and add it as a local Condiment source; it contains its own manifest, HTML, script, CSS, icon and agent skill. No other Condiment is required. Approve background execution only if you want its command handlers available after closing its window.

Nothing about real external connections is required to install or use this simulation. For an actual hosted application, follow [the external connection protocol](../EXTERNAL-CONNECTIONS.md) and the wire-schema/conformance examples; do not copy the simulation's connection identifiers or pretend its local connection is authenticated.

## Agents

Read `condiment-status`, `condiment-agent-guide` for the installed Picnic Lab id, then invoke `condiment-command` with a declared command and arguments. Local agents and approved remote agents use the same path. The caller must hold the Condiment's approved grants; nested calls use the existing harness. The generic `picnic-call` exposes any discovered Snack tool, not just the example buttons. Use it only for the user's task and verify the outcome.

`picnic-connect`, `picnic-scenario`, `picnic-event`, `picnic-app-command`, `picnic-message`, `picnic-discover`, `picnic-call`, `picnic-chipclip`, `picnic-agent-message`, `picnic-agent-replies`, `picnic-state`.

The UI follows Snack's monochrome light/dark theme and scrollbar style. Its icon and all customization assets live in this bundle.
