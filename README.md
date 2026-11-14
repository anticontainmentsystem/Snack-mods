# Snack Mods

Public testing source for **Condiments** that run on top of Snack. These are not bundled with the Snack app.

Connect `https://github.com/anticontainmentsystem/Snack-Mods` in **Serving Tray → Mods → Mod connections**. Refresh the source, install a Condiment, and review its requested controls before enabling it. You can also point Snack at a local copy of this repository. Private repositories use the GitHub accounts already connected to Snack.

## Condiments

**Wallpaper** adds an image background to any current Snack, with fill, fit and stretch. Its presentation settings do not modify the Snack's HTML.

**Simple Agent Chat** supports one or several selected OpenAI/account or API/MCP inbox agents in shared conversations. It includes images, video, audio, documents, archives, emoji, replies and reactions. OpenAI responses use Snack's account runtime. Paired agents receive inbox messages and must implement the advertised chat actions to reply. Receiving a file does not guarantee that every model can interpret every media format.

Optional agent onboarding and skills are included and discoverable after enabling a Condiment. Snack can copy an onboarding prompt or share guide references in a chat. Skills never broaden the user's current permissions.

## Source format

The root `snack-condiments.json` has `version: 1` and a `condiments` array. Each entry declares an id, name, version, HTML entry, requested area/level permissions, and optional agent instructions and skill files. HTML can reference relative JavaScript and CSS within this repository; Snack snapshots and bundles them into an isolated iframe. The iframe has no native preload or direct filesystem access.

Use the injected `window.SnackCondiment.call(action, arguments)` connector and `window.SnackCondiment.onChange(callback)`. All actions use Snack's shared API/MCP registry and the intersection of the Condiment's approved controls and the caller's current permissions. Managed secrets and owner-only controls are unavailable. Package updates require another review; they do not silently replace approved code.

No account keys, credentials, private conversations, or user media belong in this repository.
