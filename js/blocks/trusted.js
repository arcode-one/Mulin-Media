export const initTrusted = () => {
  document.querySelectorAll("[data-trusted-slider]").forEach((slider) => {
    const track = slider.querySelector(".trusted__list");

    if (!track || track.dataset.marqueeReady === "true" || track.dataset.marqueeInitializing === "true") {
      return;
    }

    track.dataset.marqueeInitializing = "true";

    const sourceItems = [...track.children];
    const clones = sourceItems.map((item) => {
      const clone = item.cloneNode(true);
      clone.classList.add("trusted__item--clone");
      clone.setAttribute("aria-hidden", "true");

      clone.querySelectorAll("img").forEach((image) => {
        image.alt = "";
        image.loading = "eager";
      });

      track.append(clone);

      return clone;
    });

    const updateCycleDistance = () => {
      const distance = clones[0].offsetLeft - sourceItems[0].offsetLeft;

      if (distance > 0) {
        track.style.setProperty("--trusted-cycle-translate", `${-distance}px`);
      }
    };

    const waitForImage = (image) => {
      image.loading = "eager";

      if (image.complete) {
        return typeof image.decode === "function" ? image.decode().catch(() => undefined) : Promise.resolve();
      }

      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    };

    Promise.all([...track.querySelectorAll("img")].map(waitForImage)).then(() => {
      updateCycleDistance();

      requestAnimationFrame(() => {
        updateCycleDistance();
        delete track.dataset.marqueeInitializing;
        track.dataset.marqueeReady = "true";
      });
    });

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(updateCycleDistance);
      resizeObserver.observe(slider);
    } else {
      window.addEventListener("resize", updateCycleDistance, { passive: true });
    }
  });
};
