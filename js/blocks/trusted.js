export const initTrusted = () => {
  document.querySelectorAll("[data-trusted-slider]").forEach((slider) => {
    const track = slider.querySelector(".trusted__track");
    const group = track?.querySelector(".trusted__group");
    if (!group?.children.length || track.dataset.marqueeReady) return;
    track.dataset.marqueeReady = "pending";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const speed = Number.parseFloat(slider.dataset.marqueeSpeed) || 88;
    let cycleWidth = 0;
    let offset = 0;
    let lastTime = null;
    let resizeFrame = 0;
    let ready = false;

    const paint = () => {
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };

    const cloneGroup = () => {
      const clone = group.cloneNode(true);
      clone.dataset.marqueeClone = "";
      clone.setAttribute("aria-hidden", "true");
      clone.inert = true;
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
      clone.querySelectorAll("img").forEach((image) => {
        image.alt = "";
        image.loading = "eager";
        image.draggable = false;
      });
      return clone;
    };

    const rebuild = () => {
      const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
      const nextCycleWidth = group.getBoundingClientRect().width + gap;
      if (!nextCycleWidth) return;

      // Keep the same phase on resize; never restart from the first logo.
      offset = cycleWidth ? (offset / cycleWidth) * nextCycleWidth : 0;
      cycleWidth = nextCycleWidth;

      // Only complete sets: the last logo must always be followed by the first.
      // One extra cycle covers the translation, another guards subpixel edges.
      const copies = Math.ceil(slider.getBoundingClientRect().width / cycleWidth) + 2;
      while (track.children.length < copies) track.append(cloneGroup());
      while (track.children.length > copies) track.lastElementChild.remove();
      paint();
      track.dataset.marqueeReady = "true";
    };

    const animate = (time) => {
      if (lastTime !== null && !reduceMotion.matches && cycleWidth) {
        const elapsed = Math.min(64, Math.max(0, time - lastTime));
        // At this exact boundary the next identical set occupies the same pixels.
        offset = (offset + (speed * elapsed) / 1000) % cycleWidth;
        paint();
      }
      lastTime = time;
      requestAnimationFrame(animate);
    };

    const scheduleResize = () => {
      if (!ready) return;
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(rebuild);
    };

    const images = [...group.querySelectorAll("img")];
    Promise.all(images.map((image) => {
      image.loading = "eager";
      image.draggable = false;
      if (image.complete) return image.decode?.().catch(() => undefined);
      return new Promise((resolve) => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    })).then(() => {
      ready = true;
      rebuild();
      requestAnimationFrame(animate);
    });

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(scheduleResize);
      observer.observe(slider);
      observer.observe(group);
    }
    window.addEventListener("resize", scheduleResize, { passive: true });
    document.addEventListener("visibilitychange", () => { lastTime = null; });
    reduceMotion.addEventListener("change", () => { lastTime = null; });
  });
};
