export function initHero() {
  const hero = document.querySelector(".hero");

  if (!hero) return;

  const updateViewportHeight = () => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty("--mobile-menu-height", `${viewportHeight}px`);
  };

  updateViewportHeight();
  window.visualViewport?.addEventListener("resize", updateViewportHeight, { passive: true });
  window.addEventListener("orientationchange", updateViewportHeight, { passive: true });
}
