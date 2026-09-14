# Homepage hero — original Figma assets

Source: https://www.figma.com/design/J2z29h0ANsETHYEQMyPkIn/?node-id=62-517

- `hero-scene-figma.png`: exact Figma export of photo group `62:518`, 1920 × 807.
- `hero-person-desktop.png`: original image fill from `IMG_0249 1`, node `62:523`, 853 × 1844. The existing file was verified byte-for-byte against the downloaded raw image on 2026-09-15.
- Portrait SHA-256: `44d1cec652711b4e1cb78e2b8c239d425ddd83f8c2132ceb30cba3d56ea68e8e`.
- Scene SHA-256: `bd216f382e66f8406baf208b8df58f5b0a94a879b47ede0db4dbafa050b1c3b0`.

Use the single exported scene on desktop and at 577–820 CSS px. The tablet layout crops the same scene with the person on the right; do not overlay a separate portrait or room background, which creates a visible seam. Positioning and shading are CSS only; do not regenerate or redraw the person or room.

At up to 576 CSS px, use the original mobile composition from node `62:563`: height 1151px, title y=100, description y=433, form y=865. Compose the existing original room, portrait, mask and shadow/light assets according to nodes `62:565`–`62:576`, rather than stretching the 390px-wide visible export. This extends the scene across wider phones without distorting the portrait. The shared header is unchanged.
