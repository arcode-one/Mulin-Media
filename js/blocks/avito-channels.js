import { createMarquee } from "../utils/create-marquee.js";

export function initAvitoChannels() {
  document.querySelectorAll("[data-avito-channels-slider]").forEach((slider) => {
    const list = slider.querySelector(".avito-channels__list");
    if (!list) return;
    if (!slider.querySelector(".avito-channels__track")) {
      const track = document.createElement("div");
      track.className = "avito-channels__track";
      list.before(track);
      track.append(list);
    }
    createMarquee(slider, { trackSelector: ".avito-channels__track", groupSelector: ".avito-channels__list" });
  });
}
