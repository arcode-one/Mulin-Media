import { createLoopSlider } from "../utils/create-slider.js";

export function initTeam() {
  const section = document.querySelector("[data-team]");
  const viewport = section?.querySelector(".team__viewport");
  const mobileLayout = window.matchMedia(document.body.dataset.layoutPage === "avito" ? "(max-width: 768px)" : "(max-width: 767px)");

  if (!section || !viewport) return;

  createLoopSlider(viewport, {
    trackSelector: ".team__list",
    slideSelector: "[data-team-slide]",
    previousButtons: section.querySelectorAll("[data-team-prev]"),
    nextButtons: section.querySelectorAll("[data-team-next]"),
    enableSwipe: true,
    stableTrack: true,
    revealLeadingClones: true,
    onPreview: (index) => {
      viewport.classList.add("is-previewing");
      viewport.querySelectorAll("[data-team-slide]").forEach((slide) => {
        slide.classList.toggle("is-preview-active", Number(slide.dataset.loopIndex) === index);
      });
    },
    onChange: () => {
      viewport.classList.remove("is-previewing");
      viewport.querySelectorAll(".is-preview-active").forEach((slide) => {
        slide.classList.remove("is-preview-active");
      });
    },
    updateSlide: (slide, { isActive }) => {
      slide.setAttribute("aria-hidden", String(mobileLayout.matches && !isActive));
    },
  });
}
