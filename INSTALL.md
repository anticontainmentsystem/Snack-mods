# Install and manage Condiments

Snack is the desktop app. Condiments are optional third-party extensions loaded separately. This repository is a discovery source; visiting it does not install or connect anything.

## Connect this whole repository

1. Open **Serving Tray → Mods → Mod connections**.
2. Expand **Add a GitHub / Pages source**.
3. Paste `https://github.com/anticontainmentsystem/Snack-mods`.
4. Leave **Public repository** selected. A public source does not need a GitHub account.
5. Connect the source. The Store reads its `snack-condiments.json`.
6. Choose one Condiment, select **Install**, review its requested controls, then **Approve & enable** and **Open**.

The Pages address `https://anticontainmentsystem.github.io/Snack-mods/` points to the same catalog. Nothing is automatically installed just because a source is connected.

## Take only one complete Condiment

Use either independent source:

- `https://github.com/anticontainmentsystem/Snack-mods/tree/main/wallpaper`
- `https://github.com/anticontainmentsystem/Snack-mods/tree/main/simple-agent-chat`

Each folder includes its own manifest, interface, styles, scripts, icon and optional skills. Keep the complete folder together. Neither requires copying shared files from the repository root or installing the other Condiment.

## Download and install locally

Use GitHub **Code → Download ZIP**, extract it, then choose **Serving Tray → Mods → Choose a local folder**. Choose the extracted repository root for the whole catalog, or the `wallpaper`/`simple-agent-chat` folder for only that module. Choose the folder containing the intended `snack-condiments.json`, not the ZIP file itself.

You may also clone the repository with Git if you prefer. Git is a development convenience, not an end-user requirement. Copying a complete extracted folder is enough.

## Private repositories and multiple accounts

Connect the intended GitHub account under **Connect** first. When adding the mod source, choose that connected account rather than Public repository. Snack uses that connection’s actual authorized identity and repository access. Signing into a different account in a browser does not change an already stored Snack authorization.

The repository owner and the connected GitHub user do not have to be identical: collaborators can legitimately access a repository. Choose the connection you intend to use. A wrong account label must be corrected by verifying/reconnecting the credential, not by renaming it to impersonate another account.

## Your repository or someone else’s

The installation process is the same for every author. Supply a public repository, a connected private repository or a local folder containing the manifest. A repository catalog can contain multiple independent modules; a folder catalog can contain just one.

Review the source, publisher identity and requested controls. Store titles and publisher fields are author-supplied metadata, not an endorsement from Snack. Optional author skills are instructions, not permission grants.

## Updates and removal

- **Refresh** reads the source again; it does not silently replace an enabled installed version.
- **Update** installs the changed snapshot. Changed bundles require a new control review before enabling.
- **Disable** stops an installed module and closes its windows.
- **Remove** removes that installed module. It does not delete its GitHub repository or a local source folder.
- Removing a **source connection** removes the discovery source; manage already installed modules separately.

You may keep one Condiment, both, neither, or only your own. These examples are not bundled with Snack and do not auto-connect when Snack starts.

If a request fails, read the displayed error. Missing module approval, missing remote caller grants, a disconnected service and an expired provider authorization are distinct situations. Do not solve them by placing credentials inside a module’s HTML.


Public GitHub Condiment sources download their files from raw.githubusercontent.com, avoiding the anonymous GitHub API quota and requiring no account. Private sources continue to use the selected connected GitHub account. Source refresh/check actions share this same behavior through UI, HTTP and MCP. A source following main receives new published content; an exact commit ref intentionally stays fixed. Checks discover updates without installing or approving them.
