export function initCaseDetail() {
  document.querySelectorAll(".case-detail__figure img").forEach((image) => {
    const reveal = () => image.classList.add("is-loaded");

    if (image.complete) {
      reveal();
    } else {
      image.addEventListener("load", reveal, { once: true });
    }
  });
}
