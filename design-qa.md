# Pixel town homepage design QA

- Source visual truth: `C:\Users\hp\AppData\Local\Temp\codex-clipboard-8dab6930-e71c-4023-aa55-b6920a404c75.png`
- Implementation screenshot: `D:\Project\AIBread_Website\design-qa-home-v7-1788704228541.png`
- Mobile screenshot: `D:\Project\AIBread_Website\design-qa-home-v6-mobile.png`
- Full comparison: `D:\Project\AIBread_Website\design-qa-home-comparison.png`
- Source pixels: 1672 × 944
- Implementation pixels: 1672 × 944
- CSS viewport: 1672 × 944, device density 1
- Normalization: source and implementation use identical pixel dimensions; the side-by-side comparison scales each to 836 × 472 without changing aspect ratio.
- State: desktop homepage, town running, default weather, no modal open.
- Focused comparison: not required because the separate 1:1 source and implementation captures keep the portrait, map HUD, labels, and dock text legible; the combined file is used for composition comparison.

## Findings

- No P0/P1/P2 findings remain.
- The implementation preserves the selected structure: character/status rail on the left, living town in the main viewport, town clock at the top, and six primary destinations in the bottom dock.
- The map artwork intentionally differs from the concept image because it is the project's interactive six-building world with real collision zones, residents, weather, time, and navigation.
- The clock plaque, four HUD controls, six navigation destinations, brand plaque, and portrait card are independent pixel-art components. The message and status panels are deterministic code-native pixel surfaces with fixed safe areas, so their dynamic content cannot drift outside the frame.

## Required fidelity surfaces

- Fonts and typography: display copy uses a heavier Song-style stack and compact UI copy uses the existing Chinese sans stack. Title, status, metadata, and navigation labels have distinct weights and remain readable.
- Spacing and layout rhythm: the desktop split is approximately 20/80, the bottom dock occupies a compact game-menu band, and all regions share a consistent double-border rhythm. No viewport overflow hides persistent controls at 1672 × 944.
- Colors and visual tokens: midnight navy, bread gold, muted cream, teal, violet, and warm window light match the reference palette. Bright accents are reserved for status and interaction.
- Image quality and asset fidelity: the map and portrait are real raster pixel assets. The new opaque portrait card translates the supplied friendly toast mascot into the town's 32-bit pixel language; the live map continues to use the supplied sprite sheets for all moving characters.
- Copy and content: labels point to real routes and show current project/article counts. The short line “今天也做点有意思的东西。” replaces generic AI marketing copy.
- Responsiveness: at the narrow in-app browser width, the player card collapses, the map remains primary, touch controls appear, and the six destinations become a horizontal dock.

## Interaction checks

- “怎么玩” opens and closes the town guide dialog.
- The blog dock item navigates successfully to `/blog`.
- Canvas movement controls, weather/light toggles, building interactions, directory dialog, and route links remain connected.
- Four new town menus expose daily requests, collected bread, live resident activity, and a replayable bread-fortune interaction. Visiting places, greeting residents, and collecting bread now feed the same local daily-request state.
- The production build generated all 83 routes successfully with no type or compilation error.

## Comparison history

- Pass 1: P1 — the contain camera left large empty gutters around the map. Fix: changed desktop camera framing to cover the world viewport.
- Pass 2: P2 — cover framing clipped exterior building labels. Fix: moved all six labels onto their building façades.
- Pass 3: P1 — the top-right controls and bottom navigation still read as ordinary web cards with vector icons. Fix: generated a coordinated carved-wood HUD and six-slot illustrated inventory menu, then overlaid the live controls and route labels.
- Pass 4: P1 — the six destinations were separate DOM links but still visually shared one long image rail. Fix: generated six complete four-sided button assets with their own corner hardware and integrated name plaques.
- Pass 5: P1 — the left rail still used CSS rectangles around the portrait and player data. Fix: replaced all four surfaces with independent generated pixel-art components and preserved the live content as semantic overlays.
- Pass 6: P1 — independently generated navigation frames had inconsistent aspect ratios, plaque heights, baselines, and alpha edges. Fix: created one 3:2 master frame, extracted the six icons, and deterministically composited every final button onto the same 540 × 360 canvas.
- Pass 7: P1 — the 4:5 portrait frame and near-square status panel were being stretched into landscape slots. Fix: regenerated them at the actual 15:13 and 5:3 container ratios, switched all artwork to `object-fit: contain`, and removed the overlapping rank label.
- Pass 8: the final desktop capture shows no actionable P0/P1/P2 mismatch. The compact layout intentionally collapses the decorative portrait, message, and status panels so the map and horizontal navigation remain usable without distorting those assets.
- Pass 9: P1 — message and stat copy still inherited obsolete artwork safe areas, pushing the bottom rows onto the frame. Fix: replaced both backgrounds with code-native pixel panels and explicit internal layout; the stat block now has a fixed 180 px desktop height.
- Pass 10: P1 — the portrait frame retained visible alpha fringe and the human chef identity no longer matched the requested mascot. Fix: generated one opaque 600 × 520 finished portrait card with the frame, bakery interior, and bread-shaped AI mascot integrated into a single raster.
- Pass 11: the town gained a persistent four-item activity menu and locally saved quest, friendship, collection, reward, and fortune state. Desktop and compact in-app-browser captures show the controls inside the viewport without overlapping the persistent navigation.
- Pass 12: P1 — the HUD used accelerated game time and quickly diverged from the user's local Chinese time. Fix: the clock, date label, day period, and automatic night overlay now derive from `Asia/Shanghai` wall-clock time.
- Pass 13: P1 — stopping an actor froze frame zero of a running row. Fix: moving actors use sprite rows 7–9 while idle actors switch to the dedicated standing rows 10–12 for the current direction.
- Pass 14: P1 — the desktop camera stayed centered on the map and could lose the player near the upper or lower crop. Fix: every viewport now follows the player with clamped, eased camera coordinates; no camera position can expose space outside the world.
- Pass 15: P1 — the compact D-pad used an absolutely positioned interaction key and the navigation dock required horizontal scrolling. Fix: the D-pad is a true 3 × 3 cross with `E` at its center; compact navigation is six equal columns on tablet widths and a complete 3 × 2 grid on phones.
- Pass 16: the destination dialog was replaced with a single station-board route list. Sequential station numbers, arrival state, building signage, and one clear row action now encode real navigation information instead of repeating generic cards.

final result: passed
