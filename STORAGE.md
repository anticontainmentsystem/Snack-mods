# Snack Storage

General → Storage is the control center for editable local files and temporary data. Open the root folder or a selected area, inspect/edit text files, preview images, see references, and move unused files to recoverable Trash.

## Areas

- **Pasta**: readable HTML copies of Main Snack Pasta and open Pasta Studio documents.
- **ChipClips**: readable HTML copies of saved HTML Snacks.
- **Media**: user/agent media and browser downloads, with readable original names and unique identities.
- **Condiments**: a separate folder per Condiment, including its uploaded media and editable `settings.json`. This is private module JSON data, not permission grants or Vault credentials.
- **Cache**: disposable website preview files.
- **Trash**: recoverable removed files. Empty Trash permanently removes this area’s contents.
- **Projects**: standalone Condiment projects, editable through the project tools or an external editor.

Vault credentials, OAuth tokens, connection records and internal databases remain outside these folders. Raw storage management is local-owner control; remote clients can read usage summaries and use existing scoped document/project/media/chat actions rather than bypassing their data permissions through a filesystem path.

## External editing and synchronization

Pasta and ChipClip HTML files synchronize in both directions through the existing shared editor/save dispatcher. Ordinary file changes do not require a separate editor bridge or another app installation. Linked live Snacks update from the shared source.

If the file and Snack both changed, neither silently wins. Both versions are copied into the area’s `Conflicts` folder. General → Storage offers **Use file** or **Use Snack**. Optimistic hash checks protect edits made in Storage’s own text editor.

Editing an image in place refreshes applied presentation layers. A Condiment may need to reload its own selected-image preview or settings, depending on how that Condiment reads its data. Its private settings API reads the file on each request. Invalid JSON is reported without overwriting the user’s file.

## Retained versus temporary

A file still referenced by Pasta, a ChipClip, a conversation, an installed Condiment, an applied appearance or an open M Snack is protected from Storage’s Trash action. Clear/remove that use first. Uploads and active browser downloads are also protected. Closing an M Snack unloads its displayed image; captured managed copies can later be cleaned if unused.

Unused media/files can move to Trash and be restored to their original paths. Restore refuses to overwrite another file. Cache cleanup also moves old preview files to Trash; it does not clear cookies, login sessions, saved content or attachments.

Automatic cache cleanup is **off by default**. Enable it and choose an age from 1–365 days, or clean old cache manually. Empty Trash is a separate explicit local action.

## Changing location

Choose a parent folder with **Change location**. Snack prepares a dedicated `Snack Storage` destination and applies the choice on the next app start. It copies current user files into an empty destination, retains the previous folder as backup, and keeps internal/Vault storage separate. The pending choice can be canceled. A nonempty destination or copy error leaves the original location active and reports the problem.

## Agent tools

Discover live schemas with `snacks_capabilities`. `storage-status` reports areas, counts, usage, conflicts and protected references for local owners; remote summaries omit raw paths and private file metadata. `storage-list/read/write/open`, `storage-trash/restore/empty-trash`, `storage-clean-cache`, `storage-settings/update`, `storage-choose-location/cancel-location` and `storage-resolve` use the same implementation as General.

Full local owner Condiments can use local-owner controls after explicit full-control approval. Scoped Condiments retain their own private storage API; remote clients cannot turn Storage access into arbitrary filesystem or credential access.

`image-source-capture` copies the original bytes of an open M Snack into managed media and returns the media id, name, MIME, fit and size. It supports lossless development reload preservation without making agents transport base64. Read owned media with `media-read`; normal image setting and fit controls remain shared.
