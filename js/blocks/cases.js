import { createLoopSlider } from "../utils/create-slider.js";

export const initCases = () => {
  document.querySelectorAll(".cases").forEach((section) => {
    const slider = section.querySelector("[data-cases-slider]");
    if (!slider) return;

    const status = section.querySelector("[data-cases-status]");

    createLoopSlider(slider, {
      trackSelector: ".cases__track",
      slideSelector: ".cases__slide",
      previousButtons: section.querySelectorAll("[data-cases-prev]"),
      nextButtons: section.querySelectorAll("[data-cases-next]"),
      dots: section.querySelectorAll("[data-cases-dot]"),
      enableSwipe: true,
      onChange: (index, total) => {
        if (status) status.textContent = `Позиция ${index + 1} из ${total}`;
      },
    });
  });
};
