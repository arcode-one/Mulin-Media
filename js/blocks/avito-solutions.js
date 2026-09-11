import { openSuccessPopup } from "./success-popup.js";

export function initAvitoSolutions() {
  document.querySelectorAll(".avito-inline-form").forEach((form) => {
    const phone = form.querySelector('input[type="tel"]');
    const consent = form.querySelector('input[type="checkbox"]');
    const error = form.querySelector(".avito-inline-form__error");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const digits = phone?.value.replace(/\D/g, "") || "";
      if (digits.length < 10) {
        if (error) error.textContent = "Введите корректный номер телефона";
        phone?.focus();
        return;
      }
      if (!consent?.checked) {
        if (error) error.textContent = "Подтвердите согласие на обработку данных";
        consent?.focus();
        return;
      }
      if (error) error.textContent = "";
      form.reset();
      openSuccessPopup(form.querySelector("button[type='submit']"));
    });
  });
}
