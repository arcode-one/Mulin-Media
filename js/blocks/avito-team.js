import { createSlider } from "../utils/create-slider.js";

export function initAvitoTeam() {
  document.querySelectorAll("[data-avito-team-slider]").forEach((slider) => createSlider(slider, {
    enableSwipe: true,
  }));
}
