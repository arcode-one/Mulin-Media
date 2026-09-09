import { createLoopSlider } from "../utils/create-slider.js";

export const initTrusted = () => {
  const mobileLayout = window.matchMedia("(max-width: 767px)");

  document.querySelectorAll("[data-trusted-slider]").forEach((slider) => {
    createLoopSlider(slider, {
      trackSelector: ".trusted__list",
      slideSelector: ".trusted__item",
      enableSwipe: true,
      enabled: () => mobileLayout.matches,
    });
  });
};
