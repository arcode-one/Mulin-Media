import { createMarquee } from "../utils/create-marquee.js";

export const initTrusted = () => {
  document.querySelectorAll("[data-trusted-slider]").forEach((slider) => {
    createMarquee(slider, { trackSelector: ".trusted__track", groupSelector: ".trusted__group" });
  });
};
