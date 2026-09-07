# UI v6 generation record

Mode: built-in `imagegen` tool

## `portrait-card.png`

Reference roles:

- Current dark bronze pixel portrait frame: visual language and framing reference.
- Rounded bread mascot screenshot: character identity reference.

Final prompt:

```text
Use case: style-transfer
Asset type: finished portrait card for a pixel-art game website sidebar
Primary request: Create a new complete pixel-art portrait card featuring a friendly anthropomorphic slice-of-bread AI mascot, clearly inspired by the simple rounded toast silhouette, tiny black oval eyes, small smiling mouth, warm golden crust and caramel-colored swoop on top from the mascot reference. Dress the mascot in a compact futuristic cream-and-deep-teal jacket with subtle cyan circuit accents and a small glowing AI badge. The character should wave hello and feel warm, clever, playful and trustworthy.
Scene/backdrop: cozy dark navy bakery-workshop interior with a softly glowing oven window, restrained detail so the mascot remains clear.
Style/medium: authentic hand-pixeled 32-bit game portrait, crisp stepped edges, limited palette, no painterly blur, no 3D render, matching the bronze/dark-navy pixel UI reference.
Composition/framing: exact 15:13 landscape portrait-card composition; centered waist-up mascot; complete ornate bronze-and-dark-wood pixel frame integrated into the card; all outer corners and edges fully inside the canvas; full-bleed opaque dark background behind the frame so no transparency or cutout fringe is needed.
Lighting/mood: warm bakery amber plus restrained cyan rim light.
Text: none.
Constraints: one bread mascot only; no human face, no chef hat, no photo, no letters, no UI labels, no watermark; frame must be symmetrical, straight, fully visible and not cropped; output must read as one finished rectangular game UI asset, not a cutout pasted over another image.
Avoid: white halo, checkerboard, transparent fringe, blurry anti-aliasing, warped frame, stretched proportions, large empty margins.
```

The generated source was normalized to the exact production size of 600 x 520 pixels with nearest-neighbor resampling. The production asset is intentionally opaque: frame, background, and character are one finished card, so there is no alpha fringe around the border.
