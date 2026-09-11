import { openSuccessPopup } from "./success-popup.js";

const PHONE_LENGTH = 10;

function normalizePhone(value) {
  const digits = value.replace(/\D/g, "");
  return (digits.startsWith("7") || digits.startsWith("8") ? digits.slice(1) : digits).slice(0, PHONE_LENGTH);
}

function formatPhone(digits) {
  if (!digits) return "";

  const area = digits.slice(0, 3);
  const first = digits.slice(3, 6);
  const second = digits.slice(6, 8);
  const third = digits.slice(8, 10);
  let value = `(${area}`;

  if (area.length === 3) value += ")";
  if (first) value += ` ${first}`;
  if (second) value += `-${second}`;
  if (third) value += `-${third}`;

  return value;
}

function initFilters(root) {
  const buttons = Array.from(root.querySelectorAll("[data-filter]"));
  const cards = Array.from(root.querySelectorAll("[data-category]"));
  const empty = root.querySelector("[data-cases-empty]");
  const mobileFilter = root.querySelector("[data-mobile-case-filter]");
  const mobileTrigger = root.querySelector("[data-mobile-filter-trigger]");
  const mobileOptions = root.querySelector("[data-mobile-filter-options]");
  const mobileLabel = root.querySelector("[data-mobile-filter-label]");

  if (!buttons.length || !cards.length || !empty) return;

  const closeMobileFilter = () => {
    if (!mobileFilter || !mobileTrigger || !mobileOptions) return;

    mobileFilter.classList.remove("is-open");
    mobileFilter.closest(".cases-catalog__results")?.classList.remove("has-open-filter");
    document.body.classList.remove("cases-filter-open");
    mobileTrigger.setAttribute("aria-expanded", "false");
    mobileOptions.hidden = true;
  };

  const applyFilter = (filter) => {
    let visibleCount = 0;

    cards.forEach((card) => {
      const isVisible = filter === "all" || card.dataset.category === filter;
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    });

    buttons.forEach((button) => {
      const isActive = button.dataset.filter === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (mobileLabel) {
      const selected = buttons.find((button) => button.dataset.filter === filter && button.closest("[data-mobile-filter-options]"));
      mobileLabel.textContent = filter === "all" ? "Выберите инструмент" : selected?.textContent.trim() || "Выберите инструмент";
    }

    empty.hidden = visibleCount > 0;
  };

  buttons.forEach((button) => button.addEventListener("click", () => {
    applyFilter(button.dataset.filter);
    closeMobileFilter();
  }));

  mobileTrigger?.addEventListener("click", () => {
    if (!mobileFilter || !mobileOptions) return;

    const willOpen = !mobileFilter.classList.contains("is-open");
    mobileFilter.classList.toggle("is-open", willOpen);
    mobileFilter.closest(".cases-catalog__results")?.classList.toggle("has-open-filter", willOpen);
    document.body.classList.toggle("cases-filter-open", willOpen);
    mobileTrigger.setAttribute("aria-expanded", String(willOpen));
    mobileOptions.hidden = !willOpen;
  });

  document.addEventListener("click", (event) => {
    if (mobileFilter && !mobileFilter.contains(event.target)) closeMobileFilter();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    closeMobileFilter();
    mobileTrigger?.focus();
  });
}

function initContactForm(root) {
  const form = root.querySelector("[data-cases-contact]");

  if (!form) return;

  const phone = form.querySelector("input[type='tel']");
  const status = form.querySelector("[role='status']");
  const submit = form.querySelector("button[type='submit']");

  if (!phone || !status || !submit) return;

  phone.addEventListener("input", () => {
    phone.value = formatPhone(normalizePhone(phone.value));
    form.classList.remove("has-error");
    status.textContent = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const isValid = normalizePhone(phone.value).length === PHONE_LENGTH;

    form.classList.toggle("has-error", !isValid);

    if (!isValid) {
      status.textContent = "Введите номер телефона полностью";
      phone.focus();
      return;
    }

    submit.disabled = true;
    status.textContent = "";
    form.reset();
    openSuccessPopup(submit);

    window.setTimeout(() => {
      submit.disabled = false;
    }, 900);
  });
}

export function initCasesCatalog() {
  const root = document.querySelector(".cases-catalog");

  if (!root) return;

  initFilters(root);
  initContactForm(root);
}
