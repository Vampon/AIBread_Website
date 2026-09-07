# Pixel Town UI v4 generation record

Mode: built-in `imagegen`.

References:

- Current implementation critique: `codex-clipboard-43e47650-424c-45ef-80a1-7f2409610a1c.png`
- Current left rail critique: `codex-clipboard-56e6808c-dc80-4ddb-a1ee-28f0f955225c.png`
- Approved art direction: `codex-clipboard-8dab6930-e71c-4023-aa55-b6920a404c75.png`

## Left-rail component prompts

The four final generation prompts all used `Use case: ui-mockup`, requested one
isolated straight-on component, genuine transparent alpha, no text, and the
approved late-1990s Japanese farming-RPG direction. Their exact component specs
were:

1. Brand plaque — a wide 4:1 carved dark-walnut plaque with bronze corner caps,
   deep navy inset, and a bread crest socket at far left; calm empty center/right
   for live HTML title text.
2. Portrait frame — a portrait 4:5 carved walnut overlay with wheat/bread corner
   carvings, bronze clamps, a fully transparent center opening, and an integrated
   lower-right online lamp housing; no character or text.
3. Message plaque — a wide 5:2 dark-wood panel with bread-and-wheat ornament,
   bronze joinery, navy cloth inset, and empty room for two lines plus one link.
4. Status panel — a 4:3 walnut-and-bronze player panel with a bread medallion,
   one experience-gauge groove, three subtle content lanes, and an otherwise
   empty navy inset for live stats.

Every prompt explicitly avoided modern CSS cards, thin vector borders, rounded
web cards, gradients, glassmorphism, neon, 3D rendering, watermarks, and extra
scene content.

## Independent navigation-button prompt set

Each button was generated in a separate built-in imagegen call using this exact
shared prompt, with `<id>`, `<object>`, and `<accent>` replaced by the table below:

```text
Use case: ui-mockup
Asset type: ONE standalone production pixel-art website navigation button (<id>)
Input images: Image 1 shows why the current joined navigation strip must be replaced; Image 2 is the approved art direction.
Primary request: create exactly ONE complete, closed, independent game-menu button. It must be a self-contained rectangular object with all four corners visible, thick carved dark-walnut frame, oxidized bronze corner plates and tiny bolts, and a deep midnight-navy cloth inset. The button's hero object is <object>. Integrate a small empty carved name-plaque area into the lower center for live HTML text.
Style: authentic handcrafted late-1990s Japanese farming RPG inventory/menu art; deliberately stepped pixel corners; crisp hard 16-bit/32-bit pixel clusters; tactile worn wood and metal; readable object silhouette; charming premium game art.
Palette: midnight navy, charcoal, aged bronze, <accent>.
Composition: straight-on orthographic, wide 5:3 button, tight crop; object centered slightly above the middle; full frame visible on every side; generous separation from canvas edges.
Background: genuine transparent alpha outside the closed button.
Text: no text, no letters, no numbers, no logo, no watermark.
Constraints: one button only, no adjacent slot, no shared top or bottom rail, no strip, no sprite sheet, no UI mockup scene.
Avoid: modern web card, CSS-looking border, thin vector outline, rounded pill, gradient, glassmorphism, neon glow, 3D render, photorealism.
```

| id | object | accent |
| --- | --- | --- |
| work | a painter's easel holding a tiny mountain landscape, wooden palette and brush | soft bread-gold and muted sky-blue |
| blog | an open handwritten journal and a feather quill in a small ink pot | warm parchment cream and restrained violet |
| resources | a stack of old learning books, rolled lesson scroll and bookmark | forest green, leather brown and bread-gold |
| news | a chunky beige retro AI computer terminal with a mint sparkle on screen and one tiny speech bubble | muted mint and warm cream |
| navigation | a folded illustrated town map, compass and red location pin | forest green, muted cyan and brick red |
| about | a friendly smiling bread mascot wearing a tiny brown beret and holding one small instant photo | bread-gold, warm cream and soft rose |

Generated sources were preserved in the Codex generated-image store. Workspace
copies were alpha-cleaned, tightly cropped, resized with nearest-neighbor sampling,
and palette-compressed for production delivery.
