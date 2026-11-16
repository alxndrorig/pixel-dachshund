# pixel-dachshund

A look for Claude Code in the desktop and mobile apps: a warm palette in light and dark mode, and a pixel dachshund that trots across the page behind the conversation. The terminal and editors draw no look, so the mod does nothing there.

The dog crosses the window along seven lanes, one cell at a time, in either direction. It is as long as the context window is full: short in a fresh session, 24 cells longer at a full window, and short again after a compaction.

Where the app has background animation switched off, the dog stands still in the chat column and has moved on after each answer.

## Commands

- `/dachshund` sets the look.
- `/dachshund off` clears it and keeps it away in every session.

A session has one theme. The dachshund is set when a session starts and does not take the page back from a theme set later.

## Install

At the prompt of a terminal session:

```
/plugin install pixel-dachshund --marketplace alxndrorig/pixel-dachshund
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install pixel-dachshund --marketplace alxndrorig/pixel-dachshund
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `alxndrorig/pixel-dachshund`, then Add plugin.

## Changing the dog

- `hooks/sprite.ts`: the drawing, one character per cell, with two frames for the legs and the tail.
- `hooks/scene.ts`: the lanes, the pace and how strong the dog is against the page.
- `hooks/palette.ts`: the colors of both modes.

To look at the result without the app, write a preview and open its pages in a browser:

```
bun scripts/preview.ts <folder>
```
