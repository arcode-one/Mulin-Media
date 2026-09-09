export function initAvitoFaq() {
  document.querySelectorAll("[data-avito-faq]").forEach((faq) => {
    const items = [...faq.querySelectorAll(".avito-faq__item")];

    const setItemState = (item, isOpen) => {
      const question = item.querySelector(".avito-faq__question");
      const action = item.querySelector(".avito-faq__action");
      const answer = item.querySelector(".avito-faq__answer");
      if (!question || !action || !answer) return;

      item.classList.toggle("is-open", isOpen);
      question.setAttribute("aria-expanded", String(isOpen));
      action.setAttribute("aria-expanded", String(isOpen));
      action.textContent = isOpen ? "Скрыть ответ" : "Получить ответ";
      answer.hidden = false;
      answer.setAttribute("aria-hidden", String(!isOpen));
    };

    const toggleItem = (item) => {
      const shouldOpen = !item.classList.contains("is-open");

      items.forEach((otherItem) => setItemState(otherItem, otherItem === item && shouldOpen));
    };

    items.forEach((item) => {
      const question = item.querySelector(".avito-faq__question");
      const action = item.querySelector(".avito-faq__action");
      const answer = item.querySelector(".avito-faq__answer");
      if (!question || !action || !answer) return;

      setItemState(item, item.classList.contains("is-open"));

      question.addEventListener("click", () => toggleItem(item));
      action.addEventListener("click", () => toggleItem(item));
    });
  });
}
