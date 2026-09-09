import { createSlider } from "../utils/create-slider.js";

export function initAvitoCases() {
  document.querySelectorAll("[data-avito-cases-slider]").forEach((slider) => {
    createSlider(slider, {
      enableSwipe: true,
      translateOnDesktop: true,
      getVisibleCount: () => window.matchMedia("(max-width: 767px)").matches ? 1 : 3,
    });
  });
}
