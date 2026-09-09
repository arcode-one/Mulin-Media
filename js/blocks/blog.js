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
    enabled: () => mobileLayout.matches,
    updateSlide: (slide, { isActive }) => {
      slide.setAttribute("aria-hidden", String(mobileLayout.matches && !isActive));
    },
  });
}
