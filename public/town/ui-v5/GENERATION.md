# Pixel Town UI v5 generation record

Mode: built-in `imagegen`.

## Master navigation frame

```text
Use case: ui-mockup
Asset type: master frame for six production pixel-art navigation buttons
Input images: Image 1 identifies inconsistent frames, label plaques and dirty cutout edges; Image 2 is the approved art direction.
Primary request: create ONE empty, perfectly straight standalone navigation-button master frame. Every future button will reuse this exact frame. Use a closed rectangular carved walnut frame, four identical oxidized-bronze corner plates, a deep navy textile inset, and ONE centered empty engraved name plaque physically attached inside the bottom portion of the frame.
Geometry: exact 3:2 outer aspect ratio; perfectly horizontal top and bottom edges; bilateral symmetry; the name plaque must be centered at 50% width, its top at exactly 76% of button height, its height exactly 16% of button height, and its width exactly 58% of button width. Leave the icon area above it completely empty and unornamented.
Style: authentic hand-pixeled late-1990s Japanese farming RPG menu UI, crisp hard pixel clusters, restrained wood grain, no painterly blur.
Transparency: genuine transparent alpha outside the complete outer silhouette; no checkerboard painted into the image; clean hard alpha with no white fringe, gray halo, shadow outside canvas, or stray pixels.
Text: no text, no icons, no letters, no numbers, no watermark.
Constraints: one frame only, no adjacent frame, no strip, no shared rails, no perspective, no irregular crop.
Avoid: modern CSS card, rounded web UI, thin vector lines, gradients, glassmorphism, neon, 3D render, photorealism.
```

## Portrait frame

```text
Use case: ui-mockup
Asset type: replacement production pixel-art portrait frame overlay
Primary request: redraw ONE complete landscape portrait frame specifically for a 300 by 260 CSS slot, naturally designed at an exact 15:13 outer aspect ratio, with carved walnut, wheat and bread decoration, bronze joints, a lower-right green online lamp, and a transparent center opening.
Transparency: genuine transparent alpha outside the frame and throughout the center opening; no checkerboard, fringe, halo, outside shadow, or stray pixels.
Text: no text, no character, no watermark.
```

## Status panel

```text
Use case: ui-mockup
Asset type: replacement production pixel-art player status panel
Primary request: redraw ONE complete landscape status panel for a 300 by 180 CSS slot at an exact 5:3 ratio, with a symmetric walnut-and-bronze frame, calm navy inset, and a small bread medallion contained in the top-right corner. Keep the inset empty, without pre-drawn bars, dividers or labels, for live HTML stats.
Transparency: genuine transparent alpha outside the silhouette; no checkerboard, fringe, halo, outside shadow, or stray pixels.
Text: no text, no watermark.
```

## Icon extraction prompt set

Six separate calls used the following prompt, substituting the named object group:

```text
Use case: background-extraction
Asset type: production transparent pixel-art navigation icon
Primary request: remove the entire wooden button frame, navy textile background, name plaque, metal hardware, painted checkerboard, and all surrounding pixels. Return only the requested central object group as one clean isolated pixel-art cutout.
Invariants: preserve the object design, colors, internal pixel geometry, proportions, highlights and shadows exactly; do not redraw, restyle or add anything.
Composition: keep the complete object group centered on a square canvas, sized to fill about 82% of the canvas with consistent 9% clear padding on all sides.
Transparency: genuine transparent alpha everywhere outside the object; hard clean pixel edge; no white or gray fringe, no checker pattern, no rectangular dark patch, no outside drop shadow, no stray pixels.
Text: no text, no letters, no numbers, no watermark.
```

The six object groups were: work easel and palette; blog journal and quill;
learning books and scroll; AI computer and speech bubble; town map, compass and
pin; bread mascot, beret and photo.

All six production buttons were deterministically composited onto the same
540×360 master canvas. Icon center, plaque geometry, alpha cleanup and label
coordinates are therefore identical across the full row.
