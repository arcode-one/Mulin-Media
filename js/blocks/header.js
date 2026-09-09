const MOBILE_BREAKPOINT = 767;

export function initHeader() {
  const header = document.querySelector(".header");

  if (!header) return;

  const site = header.closest(".site");
  if (site && header.parentElement !== site) {
    site.prepend(header);
  }

  const syncScrolledState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  syncScrolledState();
  window.addEventListener("scroll", syncScrolledState, { passive: true });

  const openButton = header.querySelector(".header__menu-toggle");
  const closeButton = header.querySelector(".header__menu-close");
  const menu = header.querySelector(".header__menu");
  const menuLinks = header.querySelectorAll(".header__menu-link");

  if (!openButton || !closeButton || !menu) return;

  let lastFocusedElement = null;

  const getFocusableElements = () => Array.from(
    menu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  );

  const setMenuState = (isOpen) => {
    menu.classList.toggle("is-open", isOpen);
    menu.setAttribute("aria-hidden", String(!isOpen));
    openButton.setAttribute("aria-expanded", String(isOpen));
    openButton.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
    document.body.classList.toggle("is-menu-open", isOpen);

    if (isOpen) {
      lastFocusedElement = document.activeElement;
      requestAnimationFrame(() => closeButton.focus());
    } else if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const trapFocus = (event) => {
    if (event.key !== "Tab" || !menu.classList.contains("is-open")) return;

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements.at(-1);

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement?.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  };

  openButton.addEventListener("click", () => setMenuState(true));
  closeButton.addEventListener("click", () => setMenuState(false));
  menuLinks.forEach((link) => link.addEventListener("click", () => setMenuState(false)));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenuState(false);
    }

    trapFocus(event);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > MOBILE_BREAKPOINT && menu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });
}
