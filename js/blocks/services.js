export function initServices() {
  const services = document.querySelector("[data-services]");

  if (!services) return;

  const links = services.querySelectorAll(".service-card__button, .services-promo__button");

  links.forEach((link) => {
    const card = link.closest("article");
    const title = card?.querySelector("h3")?.textContent.replace(/\s+/g, " ").trim();

    if (title) link.setAttribute("aria-label", `Подробнее: ${title}`);
  });
}
