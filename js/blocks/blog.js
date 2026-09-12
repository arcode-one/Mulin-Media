import { createLoopSlider } from "../utils/create-slider.js";

export function initBlog() {
  const section = document.querySelector("[data-blog]");
  const viewport = section?.querySelector(".blog__viewport");
  const mobileLayout = window.matchMedia("(max-width: 767px)");

  if (!section || !viewport) return;

  createLoopSlider(viewport, {
    trackSelector: ".blog__list",
    slideSelector: "[data-blog-slide]",
    previousButtons: section.querySelectorAll("[data-blog-prev]"),
    nextButtons: section.querySelectorAll("[data-blog-next]"),
    enableSwipe: true,
    stableTrack: true,
    revealLeadingClones: true,
    onPreview: (index) => {
      viewport.classList.add("is-previewing");
      viewport.querySelectorAll("[data-blog-slide]").forEach((slide) => {
        slide.classList.toggle("is-preview-active", Number(slide.dataset.loopIndex) === index);
      });
    },
    onChange: () => {
      viewport.classList.remove("is-previewing");
      viewport.querySelectorAll(".is-preview-active").forEach((slide) => slide.classList.remove("is-preview-active"));
    },
    enabled: () => mobileLayout.matches,
    updateSlide: (slide, { isActive }) => {
      slide.setAttribute("aria-hidden", String(mobileLayout.matches && !isActive));
    },
  });
}
