export function initFooter() {
  const currentYear = String(new Date().getFullYear());
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = currentYear;
  });

  const syncContactLinks = () => {
    document.querySelectorAll("[data-footer-contact]").forEach((link) => {
      link.href = mobileQuery.matches ? link.dataset.mobileHref : link.dataset.desktopHref;
    });
  };

  syncContactLinks();
  mobileQuery.addEventListener("change", syncContactLinks);
}
