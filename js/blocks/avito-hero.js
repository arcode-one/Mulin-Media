// Fit the artwork's visible area, excluding its transparent right margin.
export function initAvitoHero() {
  const container = document.querySelector(".avito-hero__container");
  const content = container?.querySelector(".avito-hero__content");
  const visual = container?.querySelector(".avito-hero__visual");
  if (!container || !content || !visual) return;

  const range = window.matchMedia("(min-width: 641px) and (max-width: 1440px)");
  const update = () => {
    if (!range.matches) {
      visual.style.removeProperty("--hero-visual-scale");
      visual.style.removeProperty("--hero-visual-right");
      container.style.removeProperty("--hero-content-height");
      return;
    }
    const available = container.getBoundingClientRect().right - content.getBoundingClientRect().right - 12;
    // Visible composition spans x=53..792 inside the original 856px box.
    const scale = Math.min(0.86, Math.max(0.1, available / 739));
    visual.style.setProperty("--hero-visual-scale", String(scale));
    visual.style.setProperty("--hero-visual-right", `${-64 * scale}px`);
    if (window.matchMedia("(max-width: 768px)").matches) {
      // Keep equal vertical space around each column and room for the header.
      const height = Math.max(content.getBoundingClientRect().height, 760 * scale) + 220;
      container.style.setProperty("--hero-content-height", `${Math.ceil(height)}px`);
      return;
    }
    const contentBottom = content.getBoundingClientRect().bottom - container.getBoundingClientRect().top;
    const artworkBottom = visual.offsetTop + 760 * scale;
    container.style.setProperty("--hero-content-height", `${Math.ceil(Math.max(contentBottom, artworkBottom))}px`);
  };
  // The update writes the observed container's height. Defer that write out of
  // ResizeObserver delivery so WebKit does not enter a same-frame resize loop.
  let frame = 0;
  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };
  const observer = new ResizeObserver(schedule);
  observer.observe(container);
  observer.observe(content);
  range.addEventListener("change", schedule);
  update();
}
