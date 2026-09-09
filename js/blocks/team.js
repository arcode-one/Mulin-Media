import { createLoopSlider } from "../utils/create-slider.js";

export function initTeam() {
  const section = document.querySelector("[data-team]");
  const viewport = section?.querySelector(".team__viewport");
  const mobileLayout = window.matchMedia("(max-width: 767px)");

  if (!section || !viewport) return;

  createLoopSlider(viewport, {
    trackSelector: ".team__list",
    slideSelector: "[data-team-slide]",
    previousButtons: section.querySelectorAll("[data-team-prev]"),
    nextButtons: section.querySelectorAll("[data-team-next]"),
    enableSwipe: true,
    updateSlide: (slide, { isActive }) => {
      slide.setAttribute("aria-hidden", String(mobileLayout.matches && !isActive));
    },
  });
}
