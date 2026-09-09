export function initWhyUs() {
  const section = document.querySelector("[data-why-us]");

  if (!section) return;

  section.dataset.whyUsReady = "true";
}
