# Condiment update checks

Snack checks connected Condiment sources every eight hours while the app is running—about three times a day. It checks shortly after startup when the last check is overdue, and checks again after an overdue computer resume. Recent checks survive app restarts, so reopening Snack does not repeatedly fetch every source.

In **Serving Tray → Mods**, **Check for updates** checks all connected repositories and folders immediately. The Store shows the last check, available installed updates and source failures. A card with an update distinguishes its installed version from the available version.

Checking never installs, enables, approves or replaces a Condiment. You choose **Update**, then review its controls, network origins and background access. An unreachable source keeps its last known catalog and installed versions intact. No sources are added automatically; the Official repository link remains an optional starting point.

Agents can discover `condiment-update-status` for the current state and `condiment-check-updates` for a manual check through the shared API/MCP action registry. Manual source checking requires local owner authority. Concurrent checks are coalesced; one failing source does not prevent checking the others.
