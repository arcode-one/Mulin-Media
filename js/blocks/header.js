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
  const menuLinks = header.querySelectorAll("a.header__menu-link");

  if (!openButton || !closeButton || !menu) return;

  let lastFocusedElement = null;
  const servicesItem = header.querySelector(".header__nav-item--has-submenu");
  const servicesToggle = header.querySelector("[data-services-toggle]");
  const mobileServicesToggle = header.querySelector(".header__menu-services-toggle");
  const mobileServices = header.querySelector(".header__menu-services");
  const desktopHover = window.matchMedia("(min-width: 1280px) and (hover: hover)");
  const setServicesOpen = (open) => {
    servicesItem?.classList.toggle("is-services-open", open);
    servicesToggle?.setAttribute("aria-expanded", String(open));
  };
  const setMobileServicesOpen = (open) => {
    if (mobileServices) mobileServices.hidden = !open;
    mobileServicesToggle?.setAttribute("aria-expanded", String(open));
  };
  if (mobileServices) {
    header.querySelectorAll(".header__submenu-list > li").forEach((item) => {
      mobileServices.append(item.cloneNode(true));
    });
    mobileServices.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });
  }
  servicesToggle?.addEventListener("click", () => {
    setServicesOpen(servicesToggle.getAttribute("aria-expanded") !== "true");
  });
  servicesItem?.addEventListener("pointerenter", () => {
    if (desktopHover.matches) setServicesOpen(true);
  });
  servicesItem?.addEventListener("pointerleave", () => {
    if (desktopHover.matches) setServicesOpen(false);
  });
  servicesItem?.addEventListener("focusout", (event) => {
    if (!servicesItem.contains(event.relatedTarget)) setServicesOpen(false);
  });
  mobileServicesToggle?.addEventListener("click", () => {
    setMobileServicesOpen(mobileServicesToggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("click", (event) => {
    if (!servicesItem?.contains(event.target)) setServicesOpen(false);
  });

  const getFocusableElements = () => Array.from(
    menu.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ).filter((element) => element.getClientRects().length > 0);

  const setMenuState = (isOpen) => {
    if (!isOpen) setMobileServicesOpen(false);
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
    if (event.key === "Escape" && servicesToggle?.getAttribute("aria-expanded") === "true") {
      setServicesOpen(false);
      servicesToggle.focus();
    }
    if (event.key === "Escape" && mobileServicesToggle?.getAttribute("aria-expanded") === "true") {
      setMobileServicesOpen(false);
      mobileServicesToggle.focus();
      return;
    }
    if (event.key === "Escape" && menu.classList.contains("is-open")) {
      setMenuState(false);
    }

    trapFocus(event);
  });

  window.addEventListener("resize", () => {
    setServicesOpen(false);
    if (window.innerWidth > MOBILE_BREAKPOINT && menu.classList.contains("is-open")) {
      setMenuState(false);
    }
  });
}
