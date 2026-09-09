const PARTIALS = [
  ["[data-layout-header]", "./partials/header.html"],
  ["[data-layout-footer]", "./partials/footer.html"],
];

const PAGE_ROUTES = {
  home: {
    about: "#about",
    services: "#services",
    cases: "./cases.html",
    articles: "#blog",
  },
  avito: {
    about: "#avito-team",
    services: "#avito-solutions",
    cases: "./cases.html",
    articles: "./index.html#blog",
  },
  cases: {
    about: "./index.html#about",
    services: "./index.html#services",
    cases: "./cases.html",
    articles: "./index.html#blog",
  },
  case: {
    about: "./index.html#about",
    services: "./index.html#services",
    cases: "./cases.html",
    articles: "./index.html#blog",
  },
  default: {
    about: "./index.html#about",
    services: "./index.html#services",
    cases: "./cases.html",
    articles: "./index.html#blog",
  },
};

async function loadPartial(selector, path) {
  const mount = document.querySelector(selector);

  if (!mount) return;

  const response = await fetch(new URL(path, document.baseURI));

  if (!response.ok) {
    throw new Error(`Не удалось загрузить ${path}: ${response.status}`);
  }

  const template = document.createElement("template");
  template.innerHTML = (await response.text()).trim();
  mount.replaceWith(template.content.cloneNode(true));
}

function configureHeader(page) {
  const header = document.querySelector("[data-shared-header]");

  if (!header) return;

  header.classList.toggle("header--light", page !== "home");

  const routes = PAGE_ROUTES[page] ?? PAGE_ROUTES.default;

  header.querySelectorAll("[data-header-route]").forEach((link) => {
    const route = link.dataset.headerRoute;
    link.href = routes[route] ?? PAGE_ROUTES.default[route];
  });

  const activePage = page === "case" ? "cases" : page;

  header.querySelectorAll("[data-page-link]").forEach((link) => {
    const isActive = link.dataset.pageLink === activePage;

    link.classList.toggle("header__nav-link--active", isActive && link.classList.contains("header__nav-link"));

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function configureFooter(page) {
  const footer = document.querySelector("[data-shared-footer]");
  footer?.classList.toggle("site-footer--avito", page === "avito");
}

export async function initSharedLayout() {
  const page = document.body.dataset.layoutPage ?? "default";

  await Promise.all(PARTIALS.map(([selector, path]) => loadPartial(selector, path)));
  configureHeader(page);
  configureFooter(page);

  document.documentElement.classList.add("layout-is-ready");
}
