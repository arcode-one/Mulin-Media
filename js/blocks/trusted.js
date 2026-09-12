export const initTrusted = () => {
  document.querySelectorAll("[data-trusted-slider]").forEach((slider) => {
    const track = slider.querySelector(".trusted__track");
    const group = track?.querySelector(".trusted__group");
    if (!group?.children.length || track.dataset.marqueeReady) return;
    track.dataset.marqueeReady = "pending";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const speed = Number.parseFloat(slider.dataset.marqueeSpeed) || 88;
    let cycleWidth = 0;
    let animation = null;
    let inView = true;
    let resizeFrame = 0;
    let ready = false;

    const syncPlayback = () => {
      if (!animation) return;
      if (reduceMotion.matches || document.hidden || !inView) animation.pause();
      else animation.play();
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
      const duration = cycleWidth / speed * 1000;
      const phase = animation && duration ? (Number(animation.currentTime) % duration) / duration : 0;
      const widthChanged = nextCycleWidth !== cycleWidth;
      cycleWidth = nextCycleWidth;

      // Only complete sets: the last logo must always be followed by the first.
      // One extra cycle covers the translation, another guards subpixel edges.
      const copies = Math.ceil(slider.getBoundingClientRect().width / cycleWidth) + 2;
      while (track.children.length < copies) track.append(cloneGroup());
      while (track.children.length > copies) track.lastElementChild.remove();
      if (!animation || widthChanged) {
        animation?.cancel();
        // Let the browser animate the transform without a JS callback per frame.
        animation = track.animate([
          { transform: 'translate3d(0, 0, 0)' },
          { transform: `translate3d(${-cycleWidth}px, 0, 0)` },
        ], { duration: cycleWidth / speed * 1000, iterations: Infinity, easing: 'linear' });
        animation.currentTime = phase * cycleWidth / speed * 1000;
        syncPlayback();
      }
      track.dataset.marqueeReady = "true";
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
    });

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(scheduleResize);
      observer.observe(slider);
      observer.observe(group);
    }
    window.addEventListener("resize", scheduleResize, { passive: true });
    document.addEventListener("visibilitychange", syncPlayback);
    reduceMotion.addEventListener("change", syncPlayback);
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      }, { rootMargin: "100px" });
      observer.observe(slider);
    }
  });
};
