const PHONE_LENGTH = 10;

function getPhoneDigits(value) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("7") || digits.startsWith("8")) {
    return digits.slice(1, PHONE_LENGTH + 1);
  }

  return digits.slice(0, PHONE_LENGTH);
}

function formatPhone(digits) {
  if (!digits) return "";

  const area = digits.slice(0, 3);
  const first = digits.slice(3, 6);
  const second = digits.slice(6, 8);
  const third = digits.slice(8, 10);
  let formatted = `(${area}`;

  if (area.length === 3) formatted += ")";
  if (first) formatted += ` ${first}`;
  if (second) formatted += `-${second}`;
  if (third) formatted += `-${third}`;

  return formatted;
}

export function initLeadForms() {
  document.querySelectorAll(".lead-form").forEach((form) => {
    const input = form.querySelector(".lead-form__input");
    const checkbox = form.querySelector(".lead-form__checkbox");
    const error = form.querySelector(".lead-form__error");
    const nameInput = form.querySelector("[name='name']");
    const submit = form.querySelector(".lead-form__submit");

    if (!input || !checkbox || !error || !submit) return;

    const clearStatus = () => {
      form.classList.remove("has-error", "is-success");
      error.textContent = "";
      input.removeAttribute("aria-invalid");
      nameInput?.removeAttribute("aria-invalid");
    };

    const setError = (message, field) => {
      form.classList.remove("is-success");
      form.classList.add("has-error");
      error.textContent = message;
      field?.setAttribute("aria-invalid", "true");
      field?.focus();
    };

    input.addEventListener("input", () => {
      const digits = getPhoneDigits(input.value);
      input.value = formatPhone(digits);
      input.dataset.digits = digits;

      if (form.classList.contains("is-success") && !digits) return;

      clearStatus();
    });

    nameInput?.addEventListener("input", () => {
      if (form.classList.contains("is-success") && !nameInput.value) return;
      clearStatus();
    });
    checkbox.addEventListener("change", () => {
      if (form.classList.contains("is-success") && !checkbox.checked) return;
      clearStatus();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (form.classList.contains("is-submitting")) return;

      const digits = input.dataset.digits ?? getPhoneDigits(input.value);

      if (digits.length !== PHONE_LENGTH) {
        setError("Введите номер полностью", input);
        return;
      }

      const desktopConsentOptional = form.hasAttribute("data-consent-optional-desktop")
        && window.matchMedia("(min-width: 768px)").matches;

      if (!checkbox.checked && !desktopConsentOptional) {
        setError("Подтвердите согласие", checkbox);
        return;
      }

      const lead = {
        phone: `+7${digits}`,
        name: nameInput?.value.trim() ?? "",
      };

      clearStatus();
      form.classList.add("is-submitting");
      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");

      form.dispatchEvent(new CustomEvent("lead-form:submit", {
        bubbles: true,
        detail: lead,
      }));

      window.setTimeout(() => {
        form.classList.remove("is-submitting");
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
        form.reset();
        input.value = "";
        input.dataset.digits = "";
        form.classList.add("is-success");
        error.textContent = "Спасибо! Заявка отправлена — скоро свяжемся с вами";

        form.dispatchEvent(new CustomEvent("lead-form:success", {
          bubbles: true,
          detail: lead,
        }));
      }, 350);
    });
  });
}
