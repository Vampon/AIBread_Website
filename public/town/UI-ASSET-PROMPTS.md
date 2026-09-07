# Pixel Town UI asset prompts

The production assets in this folder were created with the built-in `imagegen`
mode. The approved concept screenshot and the current implementation screenshot
were supplied as visual references.

## `ui-dock-v2.png`

```text
Use case: ui-mockup
Asset type: production pixel-art bottom navigation / inventory bar for a Chinese personal website
Input images: Image 1 identifies the current ugly bottom navigation inside the red rectangle; Image 2 is the approved visual target and the definitive art direction.
Primary request: redraw ONLY the bottom six-slot navigation as a genuine handcrafted game UI raster asset, not a web-card mockup.
Composition: one ultra-wide horizontal connected inventory bar filling the canvas edge to edge, exactly six equal rectangular slots in a single row. In the left 38% of each slot, draw one large distinct pixel-art object icon in this exact order: painter canvas with brush; open handwritten journal with quill; small stack of books and scroll; chunky retro AI computer terminal with a tiny speech bubble; folded town map with compass pin; friendly bread mascot holding a small photo. Leave the right 62% of each slot visually quiet and empty for live HTML labels.
Style: authentic late-1990s Japanese farming RPG inventory UI, carefully hand-placed 16-bit/32-bit pixels, chunky stepped corners, carved dark wood and oxidized bronze, subtle cloth backing, tiny corner bolts, strong 1px pixel highlights, readable silhouettes, coherent scale.
Palette: midnight navy-black, charcoal wood, aged bronze, bread gold, with restrained violet/mint/cyan accent colors matching the target.
Background: genuinely transparent outside the outer frame.
Text: no text, no letters, no numbers, no logos, no watermark.
Constraints: exactly six slots; straight-on orthographic UI view; crisp hard pixel edges; no rounded modern cards; no thin vector outlines; no gradients; no glassmorphism; no glowing neon frames; no 3D render; no photorealism; no mockup perspective; no extra items; do not include the map scene or character portrait.
```

## `ui-hud-v2.png`

```text
Use case: ui-mockup
Asset type: production pixel-art HUD cluster for the top-right corner of a browser game homepage
Input images: Image 1 identifies the current ugly top-right clock and four buttons inside the red rectangle; Image 2 is the approved visual target and definitive art direction.
Primary request: redraw ONLY one compact two-row HUD cluster as a genuine handcrafted game UI raster asset.
Composition: a wide clock/status plaque across the full top row, with an aged pixel-art map-scroll emblem at far left and a small sun-and-cloud weather emblem at far right; keep the broad center area visually quiet and empty for dynamic live time text. Under it, align exactly four square push buttons to the right edge. Their pixel-art symbols, left to right: pause bars, sun/day-night, rain cloud, question mark. Every button must read as a separate pressable game control.
Style: authentic late-1990s Japanese farming RPG HUD, chunky stepped dark-wood frame, oxidized bronze corners, tiny corner pins, 1px hard pixel highlights, tactile inset button faces, coherent 16-bit/32-bit pixel density.
Palette: midnight navy-black, charcoal, aged bronze, warm bread gold, muted cream, tiny cyan weather accent.
Background: genuinely transparent outside the HUD shapes.
Text: only the four requested universal symbols; no words, no numbers, no logo, no watermark.
Constraints: straight-on orthographic UI asset; clock plaque and button strip must be separate visible rows inside one tight bounding box; crisp hard pixel edges; no thin vector line UI; no modern rounded cards; no gradients; no glassmorphism; no neon glow; no 3D render; no photorealism; no map scene; no character portrait.
```

## Transparency cleanup

Imagegen background-extraction passes used the following prompts. The model
rendered a checker pattern instead of alpha, so the final PNGs were post-processed
with an edge-connected background removal; the generated pixel artwork itself was
preserved.

```text
Use case: background-extraction
Edit target: the supplied six-slot pixel-art navigation bar image.
Primary request: remove ONLY the white and light-gray checkerboard background and replace it with genuine transparent alpha. Then crop the canvas tightly to the outermost dark-wood pixel frame, leaving only 2 transparent pixels of padding.
Invariants: preserve the navigation bar, all six slots, every object icon, pixel geometry, colors, highlights, shadows, proportions, ordering, and straight-on view exactly as provided. Do not redraw or restyle any part. Do not add text, symbols, items, outlines, backgrounds, or watermark. Output must be a tightly cropped ultra-wide PNG with actual transparency outside the frame.
```

```text
Use case: background-extraction
Edit target: the supplied compact two-row pixel-art HUD cluster.
Primary request: remove ONLY the white and light-gray checkerboard background and replace it with genuine transparent alpha. Then crop the canvas tightly to the outermost dark-wood pixel frame, leaving only 2 transparent pixels of padding.
Invariants: preserve the clock plaque, map-scroll emblem, weather emblem, all four square buttons, pixel geometry, colors, highlights, shadows, proportions, ordering, and straight-on view exactly as provided. Do not redraw or restyle any part. Do not add text, numbers, symbols, items, outlines, backgrounds, or watermark. Output must be a tightly cropped PNG with actual transparency outside the HUD shapes.
```
