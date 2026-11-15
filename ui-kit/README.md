# Snack host controls

Snack supplies Condiment window bars. Do not recreate the host bar in your module: its close, minimize, pin and theme controls already use the shared controller, current API/MCP controls, drag handling and theme.

The host thumbtack is a monochrome SVG using `currentColor`, never an emoji. Standard bar buttons are 27 × 18 CSS pixels, with a 14 × 14 symbol. Light mode uses a dark button and white icon; dark mode inverts them, and hover inverts the button again. The included `pin.svg` and `snack-controls.css` are optional examples for custom controls inside your interface. Include any files you use in your own bundle.

Third-party authors still own their module's icon, content artwork and layout. The host chrome and shared controls belong to Snack. Use discoverable actions rather than copying native behavior. Agents can inspect `condiment-agent-guide`, call approved module commands with `condiment-command`, and use the current local or remote capability manifest to orchestrate Snack.
