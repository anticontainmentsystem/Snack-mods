# Simple Agent Chat

Chat with one or several agents. Share files, reply, react and make things happen in Snack.

This folder is a complete, independent Condiment. It includes:

- `snack-condiments.json` — this Condiment’s catalog and requested controls
- `icon.svg` — its own icon
- `index.html` — its interface
- `styles.css` — all of its styles
- `script.js` — all of its interface logic
- `skills/SKILL.md` — its optional agent skill

No shared file outside this folder is required. Connect this GitHub folder, or choose a local copy of this folder under Serving Tray → Mods → Mod connections. Install, review the requested controls, and enable it.

The root repository catalog can also discover Wallpaper, Simple Agent Chat and Snack Browser together.

[Full guide](https://github.com/anticontainmentsystem/Snack-mods#readme)

Image tools and attachment workflows: [read the shared guide](../IMAGE-TOOLS.md). Chat 0.1.2 displays pending thumbnails and shared attachment images.


Panel and message backgrounds are translucent in both themes so applied wallpaper stays visible without fading text or attachments. Wallpaper has a bundled default Snack background; select Wallpaper itself in its target list to replace it with your own image using the same fit controls.

## Copy and read long messages

Copy one message with Copy, or the room with Copy chat. Text is selectable; long messages scroll independently with Snack’s themed scrollbar. The copy-transcript command uses the shared local-only chat-copy action. Remote agents read chat-read instead.

### Shared model selection

Simple Agent Chat 0.1.6 reads connection methods and available subscription models from Snack. Open **Choose agents** to change an existing OpenAI participant’s model; no new account connection is created. Model changes apply to the next message, including existing conversations. Snack’s Automation card offers the same controls. Requires a Snack host advertising `chat-agent-configure`; API-key execution is separate from subscription sign-in.

### Connections and chat recipients (0.1.7)

The checkbox beside a name means **send chat messages to this participant**. It does not enable another AI account, listener or model. Snack’s OpenAI participant replies through the route selected in Serving Tray → Automation: **Subscription / Codex CLI** or **API key / direct API**. Each route has separate model selections. API usage is billed separately. A provider’s model list never implies access to another provider’s models; Anthropic Haiku is not a Codex/OpenAI model.

External agent registrations only reply while their client software is actively polling Snack’s chat inbox and sending responses. Manage their access in Automation → Your agentic Snackers. Snack groups legacy local registrations consistently and excludes tunnel clients without chat access. Condiments discover these states with `chat-agents` and `chat-models`; local interactive chat Condiments use `chat-agent-configure` and `chat-connection-select` through the same host registry. Never hardcode model lists or handle account credentials in a Condiment.

### Composer models and complete replies (0.1.8)

The composer shows a model selector for each selected OpenAI participant, labelled with its active subscription or API route. Composer and Simple Agent Chat’s agent dialog share conversation-specific model choices. They do not change Snack’s global defaults in Automation. Simple Agent Chat remembers its last chosen model per participant and connection route for new conversations. If none is saved or it is unavailable, it inherits Snack’s default. Existing conversations keep their own choices. Replies and quoted messages expand without internal scrolling or clipped text; scroll the overall conversation to review the complete transcript.
