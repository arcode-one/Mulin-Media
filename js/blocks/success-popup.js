const POPUP_ID = "success-popup";
const TRANSITION_DURATION = 280;
const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let popup = null;
let dialog = null;
let lastFocused = null;
let closeTimer = 0;

function closeSuccessPopup() {
  if (!popup || popup.hidden) return;

  window.clearTimeout(closeTimer);
  popup.classList.remove("is-visible");
  document.body.classList.remove("success-popup-open");
  document.querySelector(".site")?.removeAttribute("inert");

  closeTimer = window.setTimeout(() => {
    popup.hidden = true;
    lastFocused?.focus?.();
  }, TRANSITION_DURATION);
}

function handlePopupKeydown(event) {
  if (!popup || popup.hidden) return;

  if (event.key === "Escape") {
    event.preventDefault();
    closeSuccessPopup();
    return;
  }

  if (event.key !== "Tab" || !dialog) return;

  const focusable = [...dialog.querySelectorAll(FOCUSABLE_SELECTOR)];
  const first = focusable[0];
  const last = focusable.at(-1);

  if (!first || !last) {
    event.preventDefault();
    dialog.focus();
    return;
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function createSuccessPopup() {
  const root = document.createElement("div");
  root.id = POPUP_ID;
  root.className = "success-popup";
  root.hidden = true;
  root.innerHTML = `
    <div class="success-popup__backdrop" data-success-popup-close></div>
    <section
      class="success-popup__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-popup-title"
      aria-describedby="success-popup-description"
      tabindex="-1"
    >
      <button class="success-popup__close" type="button" data-success-popup-close aria-label="Закрыть окно">
        <span aria-hidden="true"></span>
      </button>
      <div class="success-popup__icon" aria-hidden="true">
        <svg viewBox="0 0 34 34" focusable="false">
          <path d="m9 17.5 5.2 5.2L25.5 11.4"></path>
        </svg>
      </div>
      <p class="success-popup__eyebrow">MULIN MEDIA</p>
      <h2 class="success-popup__title" id="success-popup-title">Спасибо!</h2>
      <p class="success-popup__description" id="success-popup-description">
        Заявка успешно отправлена.<br>
        Мы свяжемся с вами в ближайшее время.
      </p>
      <button class="success-popup__button" type="button" data-success-popup-close>Хорошо</button>
    </section>
  `;

  document.body.append(root);
  popup = root;
  dialog = root.querySelector(".success-popup__dialog");

  root.querySelectorAll("[data-success-popup-close]").forEach((control) => {
    control.addEventListener("click", closeSuccessPopup);
  });
  root.addEventListener("keydown", handlePopupKeydown);

  return root;
}

function ensureSuccessPopup() {
  return popup ?? document.getElementById(POPUP_ID) ?? createSuccessPopup();
}

export function initSuccessPopup() {
  ensureSuccessPopup();
}

export function openSuccessPopup(trigger = document.activeElement) {
  const root = ensureSuccessPopup();

  window.clearTimeout(closeTimer);
  lastFocused = trigger instanceof HTMLElement ? trigger : document.activeElement;
  root.hidden = false;
  document.body.classList.add("success-popup-open");
  document.querySelector(".site")?.setAttribute("inert", "");

  window.requestAnimationFrame(() => {
    root.classList.add("is-visible");
    dialog?.focus();
  });
}
