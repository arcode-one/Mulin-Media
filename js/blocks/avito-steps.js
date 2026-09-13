const DESKTOP_LAYOUT = {
  roadmapHeight: 1249,
  sectionSelectorHeight: null,
  firstTop: 0,
  interval: 242,
  finishTop: 1019,
  sameSideGap: 20,
};

const MOBILE_LAYOUT = {
  roadmapHeight: 1430,
  sectionSelectorHeight: 1843,
  firstTop: 149,
  interval: 232,
  finishTop: 1295,
  sameSideGap: 20,
};

export function initAvitoSteps() {
  const section = document.querySelector(".avito-steps");
  const roadmap = section?.querySelector(".avito-steps__roadmap");

  if (!section || !roadmap) return;

  let frame = 0;
  let lastSignature = "";

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(layout);
  };

  const layout = () => {
    const isMobile = matchMedia("(max-width: 768px)").matches;
    const config = isMobile ? MOBILE_LAYOUT : DESKTOP_LAYOUT;
    const steps = [...roadmap.querySelectorAll(".avito-step")];

    section.style.removeProperty("height");
    section.style.removeProperty("min-height");
    roadmap.style.removeProperty("height");
    roadmap.style.setProperty("--avito-roadmap-extra", "0px");

    steps.forEach((step, index) => {
      step.style.top = `${config.firstTop + config.interval * index}px`;
      step.style.left = index % 2 === 0 ? "0px" : "auto";
      step.style.right = index % 2 === 0 ? "auto" : "0px";
    });

    const naturalSectionHeight = config.sectionSelectorHeight
      ?? Number.parseFloat(getComputedStyle(section).height);
    const tops = [];
    const heights = steps.map((step) => step.getBoundingClientRect().height);

    steps.forEach((step, index) => {
      const designTop = config.firstTop + config.interval * index;
      const previousSameSide = index >= 2
        ? tops[index - 2] + heights[index - 2] + config.sameSideGap
        : designTop;
      const top = Math.max(designTop, previousSameSide);

      tops[index] = top;
      step.style.top = `${Math.round(top)}px`;
    });

    const contentBottom = steps.reduce(
      (bottom, step, index) => Math.max(bottom, tops[index] + heights[index]),
      0,
    );
    const finish = roadmap.querySelector(".avito-steps__endpoint--finish");
    const finishBottom = config.finishTop + (finish?.getBoundingClientRect().height ?? 0);
    const requiredRoadmapHeight = Math.max(
      config.roadmapHeight,
      Math.ceil(contentBottom + 24),
      Math.ceil(finishBottom + 24),
    );
    const extra = Math.max(0, requiredRoadmapHeight - config.roadmapHeight);
    const signature = [isMobile, roadmap.clientWidth, ...heights.map(Math.ceil), extra].join(":");

    roadmap.style.height = `${requiredRoadmapHeight}px`;
    roadmap.style.setProperty("--avito-roadmap-extra", `${extra}px`);

    if (extra > 0) {
      const sectionHeight = Math.ceil(naturalSectionHeight + extra);
      section.style.height = `${sectionHeight}px`;
      section.style.minHeight = `${sectionHeight}px`;
    }

    lastSignature = signature;
  };

  const resizeObserver = new ResizeObserver(() => {
    const steps = [...roadmap.querySelectorAll(".avito-step")];
    const signature = [
      matchMedia("(max-width: 768px)").matches,
      roadmap.clientWidth,
      ...steps.map((step) => Math.ceil(step.getBoundingClientRect().height)),
    ].join(":");

    if (!lastSignature.startsWith(signature)) schedule();
  });

  resizeObserver.observe(roadmap);
  roadmap.querySelectorAll(".avito-step").forEach((step) => resizeObserver.observe(step));

  const mutationObserver = new MutationObserver(schedule);
  mutationObserver.observe(roadmap, { childList: true, characterData: true, subtree: true });

  addEventListener("resize", schedule, { passive: true });
  document.fonts?.ready.then(schedule);
  schedule();
}
