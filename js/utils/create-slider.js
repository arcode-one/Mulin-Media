const mod = (value, length) => ((value % length) + length) % length;

const toElements = (value) => {
  if (!value) return [];
  if (value instanceof Element) return [value];
  return [...value].filter((item) => item instanceof Element);
};

const getTransitionTime = (element) => {
  const styles = window.getComputedStyle(element);
  const durations = styles.transitionDuration.split(",").map((value) => Number.parseFloat(value) * (value.includes("ms") ? 1 : 1000));
  const delays = styles.transitionDelay.split(",").map((value) => Number.parseFloat(value) * (value.includes("ms") ? 1 : 1000));

  return durations.reduce((longest, duration, index) => {
    return Math.max(longest, duration + (delays[index] ?? delays.at(-1) ?? 0));
  }, 0);
};

export function createLoopSlider(root, options = {}) {
  if (!root) return null;

  const track = root.querySelector(options.trackSelector || "ul");
  const slideSelector = options.slideSelector || "[data-slide]";
  const slides = track ? [...track.children].filter((slide) => slide.matches(slideSelector)) : [];

  if (!track || slides.length < 2) return null;

  const previousButtons = toElements(options.previousButtons);
  const nextButtons = toElements(options.nextButtons);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activeClass = options.activeClass || "is-active";
  const transition = options.transition || "transform 440ms cubic-bezier(.22, 1, .36, 1)";
  const initialActive = slides.findIndex((slide) => slide.classList.contains(activeClass));
  let activeIndex = initialActive >= 0 ? initialActive : 0;
  let clones = [];
  let baseOffset = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let currentX = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocityX = 0;
  let dragDirection = null;
  let dragFrame = 0;
  let suppressClick = false;
  let isAnimating = false;
  let pendingSteps = 0;
  let requestedIndex = null;
  let resizeFrame = 0;
  let leadingClonesRevealed = false;
  let hasSnapInteraction = false;

  const getSnapCorrection = () => {
    const inset = typeof options.snapInsetAfterInteraction === "function"
      ? options.snapInsetAfterInteraction() : options.snapInsetAfterInteraction;
    if (!hasSnapInteraction || inset == null) return 0;
    const padding = Number.parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
    return padding - inset;
  };

  const revealLeadingClones = () => {
    leadingClonesRevealed = true;
    clones.forEach((clone) => { clone.style.visibility = ""; });
  };

  const markInteracted = () => {
    if (options.interactionClass) root.classList.add(options.interactionClass);
  };

  if (options.interactionClass) root.classList.remove(options.interactionClass);

  slides.forEach((slide, index) => {
    slide.dataset.loopIndex = String(index);
  });

  const dots = options.dotsWrap
    ? slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = options.dotClass || "avito-slider-controls__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Показать слайд ${index + 1}`);
      options.dotsWrap.append(dot);
      return dot;
    })
    : toElements(options.dots);

  const isEnabled = () => options.enabled?.() ?? true;
  const getOrderedSlides = () => [...slides].sort((first, second) => {
    const firstIndex = Number(first.dataset.loopIndex);
    const secondIndex = Number(second.dataset.loopIndex);
    return mod(firstIndex - activeIndex, slides.length) - mod(secondIndex - activeIndex, slides.length);
  });

  const getStep = () => {
    const first = getOrderedSlides()[0];
    if (!first) return 0;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const updateUi = () => {
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle(activeClass, isActive);
      options.updateSlide?.(slide, { index, activeIndex, isActive, enabled: isEnabled() });
    });

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle(activeClass, isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });

    [...previousButtons, ...nextButtons].forEach((button) => {
      button.disabled = false;
      button.removeAttribute("aria-disabled");
    });

    options.onChange?.(activeIndex, slides.length);
  };

  const removeClones = () => {
    clones.forEach((clone) => clone.remove());
    clones = [];
  };

  const makeClone = (slide) => {
    const clone = slide.cloneNode(true);
    clone.dataset.loopClone = "";
    clone.classList.remove(activeClass);
    clone.setAttribute("aria-hidden", "true");
    clone.style.pointerEvents = options.stableTrack ? "auto" : "none";
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
    clone.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach((element) => {
      element.tabIndex = -1;
    });
    clone.querySelectorAll("img, a").forEach((element) => {
      element.draggable = false;
    });
    return clone;
  };

  const setTrackTransition = () => {
    track.style.transition = reduceMotion.matches ? "none" : transition;
  };

  const rebuild = () => {
    removeClones();
    const ordered = options.stableTrack ? slides : getOrderedSlides();

    if (!isEnabled()) {
      slides.forEach((slide) => track.append(slide));
      root.classList.remove("is-loop-slider", "is-swipe-enabled", "is-dragging", "is-animating");
      root.style.removeProperty("overflow");
      root.style.removeProperty("touch-action");
      root.style.removeProperty("scroll-behavior");
      root.style.removeProperty("scroll-snap-type");
      track.style.removeProperty("transform");
      track.style.removeProperty("transition");
      track.style.removeProperty("will-change");
      updateUi();
      return;
    }

    ordered.forEach((slide) => track.append(slide));
    const step = getStep();
    if (!step) return;

    const bufferCount = Math.max(2, Math.ceil(root.clientWidth / step) + 1);
    const before = document.createDocumentFragment();
    const after = document.createDocumentFragment();

    for (let position = -bufferCount; position < 0; position += 1) {
      const clone = makeClone(ordered[mod(position, ordered.length)]);
      if (options.stableTrack && !leadingClonesRevealed) clone.style.visibility = "hidden";
      clones.push(clone);
      before.append(clone);
    }

    for (let position = 0; position < bufferCount; position += 1) {
      const clone = makeClone(ordered[position % ordered.length]);
      clones.push(clone);
      after.append(clone);
    }

    track.prepend(before);
    track.append(after);
    baseOffset = (bufferCount + (options.stableTrack ? activeIndex : 0)) * step + getSnapCorrection();
    root.classList.add("is-loop-slider");
    if (options.enableSwipe !== false) root.classList.add("is-swipe-enabled");
    root.style.overflow = "hidden";
    root.style.touchAction = options.enableSwipe === false ? "" : "pan-y pinch-zoom";
    root.style.scrollBehavior = "auto";
    root.style.scrollSnapType = "none";
    root.scrollLeft = 0;
    track.style.willChange = "transform";
    track.style.transition = "none";
    track.style.transform = `translate3d(${-baseOffset}px, 0, 0)`;
    void track.offsetWidth;
    setTrackTransition();
    updateUi();
  };

  const waitForTransition = () => new Promise((resolve) => {
    const transitionTime = reduceMotion.matches ? 0 : getTransitionTime(track);
    if (!transitionTime) {
      resolve();
      return;
    }

    let settled = false;
    const done = (event) => {
      if (settled || (event && event.propertyName !== "transform")) return;
      settled = true;
      track.removeEventListener("transitionend", done);
      resolve();
    };

    track.addEventListener("transitionend", done);
    window.setTimeout(() => done(), transitionTime + 80);
  });

  const animateStep = async (direction) => {
    options.onPreview?.(mod(activeIndex + direction, slides.length));
    // Preserve the initial container alignment, then snap to the section edge.
    const previousCorrection = getSnapCorrection();
    hasSnapInteraction = true;
    baseOffset += getSnapCorrection() - previousCorrection;
    if (options.stableTrack && direction < 0) revealLeadingClones();
    isAnimating = true;
    root.classList.remove("is-dragging");
    root.classList.add("is-animating");
    track.style.removeProperty("transition");
    setTrackTransition();
    void track.offsetWidth;
    track.style.transform = `translate3d(${-(baseOffset + direction * getStep())}px, 0, 0)`;
    await waitForTransition();
    const previousIndex = activeIndex;
    activeIndex = mod(activeIndex + direction, slides.length);
    root.classList.remove("is-animating");
    isAnimating = false;
    if (options.stableTrack) {
      // Keep the DOM fixed between swipes. Normalize only the transform at the
      // loop boundary, where the identical copy occupies exactly the same place.
      baseOffset += (activeIndex - previousIndex) * getStep();
      if (activeIndex !== previousIndex + direction) {
        revealLeadingClones();
        track.style.transition = "none";
        track.style.transform = `translate3d(${-baseOffset}px, 0, 0)`;
        void track.offsetWidth;
        setTrackTransition();
      }
      updateUi();
    } else {
      rebuild();
    }
  };

  const processQueue = async () => {
    if (isAnimating || !isEnabled()) return;

    while (isEnabled()) {
      let direction = 0;

      if (pendingSteps) {
        direction = Math.sign(pendingSteps);
        pendingSteps -= direction;
      } else if (requestedIndex !== null && requestedIndex !== activeIndex) {
        const forward = mod(requestedIndex - activeIndex, slides.length);
        const backward = forward - slides.length;
        direction = Math.abs(forward) <= Math.abs(backward) ? 1 : -1;
      } else {
        requestedIndex = null;
        break;
      }

      await animateStep(direction);
    }
  };

  const move = (direction) => {
    if (!isEnabled()) return;
    markInteracted();
    requestedIndex = null;
    pendingSteps += direction;
    processQueue();
  };

  const goTo = (index) => {
    if (!isEnabled()) return;
    markInteracted();
    pendingSteps = 0;
    requestedIndex = mod(index, slides.length);
    processQueue();
  };

  const animateBack = async () => {
    options.onPreview?.(activeIndex);
    isAnimating = true;
    root.classList.remove("is-dragging");
    track.style.removeProperty("transition");
    setTrackTransition();
    void track.offsetWidth;
    track.style.transform = `translate3d(${-baseOffset}px, 0, 0)`;
    await waitForTransition();
    isAnimating = false;
  };

  const paintDrag = () => {
    dragFrame = 0;
    const step = getStep();
    const limit = options.stableTrack ? step : step * 1.08;
    const deltaX = Math.max(-limit, Math.min(limit, currentX - startX));
    options.onPreview?.(Math.abs(deltaX) > step * 0.15
      ? mod(activeIndex - Math.sign(deltaX), slides.length)
      : activeIndex);
    track.style.transform = `translate3d(${-(baseOffset - deltaX)}px, 0, 0)`;
  };

  const finishSwipe = (event, cancelled = false) => {
    if (pointerId === null || (event.pointerId !== undefined && event.pointerId !== pointerId)) return;

    currentX = Number.isFinite(event.clientX) ? event.clientX : currentX;
    if (dragFrame) {
      window.cancelAnimationFrame(dragFrame);
      paintDrag();
    }

    const deltaX = currentX - startX;
    const wasHorizontal = dragDirection === "horizontal";
    const dragged = wasHorizontal && Math.abs(deltaX) > 6;
    const distanceThreshold = Math.min(80, Math.max(36, root.clientWidth * 0.1));
    const velocityThreshold = 0.42;
    let direction = 0;

    if (!cancelled && dragDirection === "horizontal"
      && (Math.abs(deltaX) >= distanceThreshold || Math.abs(velocityX) >= velocityThreshold)) {
      direction = deltaX < 0 ? 1 : -1;
    }

    if (dragged) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
    }

    const finishedPointerId = pointerId;
    pointerId = null;
    dragDirection = null;
    velocityX = 0;
    if (root.hasPointerCapture?.(finishedPointerId)) root.releasePointerCapture(finishedPointerId);

    if (direction) move(direction);
    else if (wasHorizontal) animateBack();
    else root.classList.remove("is-dragging");
  };

  if (!root.hasAttribute("tabindex")) root.tabIndex = 0;
  root.querySelectorAll("img, a").forEach((element) => {
    element.draggable = false;
  });

  if (options.enableSwipe !== false) {
    root.addEventListener("pointerdown", (event) => {
      if (!isEnabled() || isAnimating || (event.pointerType === "mouse" && event.button !== 0)) return;
      if (!options.stableTrack) markInteracted();
      pointerId = event.pointerId;
      startX = currentX = lastX = event.clientX;
      startY = event.clientY;
      lastTime = event.timeStamp;
      velocityX = 0;
      dragDirection = null;

      try {
        if (!options.stableTrack) root.setPointerCapture(pointerId);
      } catch {
        // Synthetic pointer events do not always expose pointer capture.
      }
    });

    root.addEventListener("pointermove", (event) => {
      if (pointerId === null || event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      if (!dragDirection && Math.max(Math.abs(deltaX), Math.abs(deltaY)) >= 6) {
        dragDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
        if (dragDirection === "horizontal") {
          markInteracted();
          if (options.stableTrack) {
            try { root.setPointerCapture(pointerId); } catch { /* Synthetic pointer. */ }
          }
          root.classList.add("is-dragging");
          track.style.transition = "none";
        }
      }

      if (dragDirection !== "horizontal") return;
      if (options.stableTrack && deltaX > 0) revealLeadingClones();
      event.preventDefault();
      const elapsed = Math.max(1, event.timeStamp - lastTime);
      const instantVelocity = (event.clientX - lastX) / elapsed;
      velocityX = velocityX * 0.7 + instantVelocity * 0.3;
      currentX = event.clientX;
      lastX = event.clientX;
      lastTime = event.timeStamp;
      if (!dragFrame) dragFrame = window.requestAnimationFrame(paintDrag);
    });

    root.addEventListener("pointerup", (event) => finishSwipe(event));
    root.addEventListener("pointercancel", (event) => finishSwipe(event, true));
    root.addEventListener("lostpointercapture", (event) => {
      // Touch starts with implicit capture on the tapped image/link. Its loss
      // bubbles when we transfer capture to the viewport; that is not a cancel.
      if (event.target === root && pointerId !== null) finishSwipe(event, true);
    });
    root.addEventListener("dragstart", (event) => event.preventDefault());
    root.addEventListener("click", (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);
  }

  root.addEventListener("keydown", (event) => {
    if (!isEnabled() || event.target !== root || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    move(event.key === "ArrowRight" ? 1 : -1);
  });

  previousButtons.forEach((button) => button.addEventListener("click", () => move(-1)));
  nextButtons.forEach((button) => button.addEventListener("click", () => move(1)));
  dots.forEach((dot, index) => dot.addEventListener("click", () => goTo(index)));
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      if (!isAnimating) rebuild();
    });
  }, { passive: true });
  reduceMotion.addEventListener("change", rebuild);

  rebuild();
  return { move, goTo, rebuild, getActiveIndex: () => activeIndex };
}

export function createSlider(root, options = {}) {
  if (!root) return null;

  const controls = root.parentElement?.querySelector("[data-slider-controls]") || root.querySelector("[data-slider-controls]");
  const dotsWrap = controls?.querySelector("[data-dots]");

  return createLoopSlider(root, {
    trackSelector: options.trackSelector || "ul",
    slideSelector: options.slideSelector || "[data-slide]",
    previousButtons: controls?.querySelectorAll("[data-prev]"),
    nextButtons: controls?.querySelectorAll("[data-next]"),
    dotsWrap,
    dotClass: "avito-slider-controls__dot",
    enableSwipe: options.enableSwipe,
    enabled: () => window.matchMedia("(max-width: 767px)").matches || Boolean(options.translateOnDesktop),
  });
}
