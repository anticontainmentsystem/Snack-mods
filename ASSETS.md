# Assets stay with the Condiment

Keep every image, icon, font, stylesheet and script your Condiment needs in its own folder. Local resources are bundled into the isolated interface: scripts, linked stylesheets, quoted local CSS imports, CSS `url(...)` images/fonts, favicons, image/source/audio/video/track `src` and media `poster` attributes. Paths resolve relative to the file containing them, including nested stylesheets. Files cannot escape the source folder. The final bundled interface has a 5 MB limit.

Use relative files such as `images/logo.svg` or `../fonts/display.woff2`. Assets become data URLs; their original paths are not network connections. Runtime-generated JavaScript file paths are not automatically discoverable: use statically referenced assets, an inline data URL, or obtain runtime data through the approved connector/network API. Arbitrary external URLs remain subject to the isolated runtime's content policy.

Simple Agent Chat includes its own `snack-emoji.svg`. Its Snack category inserts `:snack:` and renders the bundled logo artwork in the picker, messages and reactions. Dark mode inverts the monochrome artwork. No shared parent stylesheet, sibling bundle or Snack-specific image lookup is needed.
