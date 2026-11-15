# An entire third-party Condiment starter

Copy **this whole folder**. It contains its own catalog, HTML, CSS, JavaScript, icon, optional background entry and agent skill. It has no dependency on Wallpaper, Simple Agent Chat or a shared app-owned customization file.

For a local test: download the repository ZIP, extract it, open Snack → Serving Tray → Mods → Mod connections → local folder, and select this starter folder. Or connect `https://github.com/anticontainmentsystem/Snack-mods/tree/main/starter` as a public source. Install and review controls. Background is optional and unchecked by default. When it is enabled, inspect commands remain available after the visible interface closes.

This template is not included in the root testing catalog and is not bundled with the Snack app. Rename its module ID, catalog name, publisher, descriptions, icon, interface and skills when making your own. Publish all its runtime files together in your own repository or local source folder. See [BUILDING.md](../BUILDING.md) and [RUNTIMES.md](../RUNTIMES.md).

The example reads awareness, handles an inspect command and saves a private JSON setting. It changes no Snack layout and makes no network request. Add exact network.origins and use condiment-http when your workflow needs a service; each origin requires separate approval. Keep credentials out of source and plain settings. There is no Node, shell, raw socket or arbitrary filesystem access.
