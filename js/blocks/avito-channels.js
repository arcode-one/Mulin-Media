import { createSlider } from "../utils/create-slider.js";

export function initAvitoChannels() {
  document.querySelectorAll("[data-avito-channels-slider]").forEach((slider) => createSlider(slider, {
    enableSwipe: true,
  }));
}
