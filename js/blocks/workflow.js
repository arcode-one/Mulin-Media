export function initWorkflow() {
  const workflow = document.querySelector("[data-workflow]");

  if (!workflow) return;

  const steps = [...workflow.querySelectorAll("[data-workflow-step]")];
  const detail = {
    icon: workflow.querySelector("[data-workflow-detail-icon]"),
    number: workflow.querySelector("[data-workflow-detail-number]"),
    title: workflow.querySelector("[data-workflow-detail-title]"),
    description: workflow.querySelector("[data-workflow-detail-description]"),
    result: workflow.querySelector("[data-workflow-detail-result]"),
    time: workflow.querySelector("[data-workflow-detail-time]"),
  };

  const selectStep = (selected) => {
    steps.forEach((step) => {
      const isSelected = step === selected;
      step.classList.toggle("is-active", isSelected);
      step.setAttribute("aria-pressed", String(isSelected));
    });

    detail.icon.textContent = selected.dataset.icon;
    detail.number.textContent = selected.dataset.number;
    detail.title.textContent = selected.dataset.title;
    detail.description.textContent = selected.dataset.detail;
    detail.result.textContent = selected.dataset.result;
    detail.time.textContent = selected.dataset.time;
  };

  steps.forEach((step) => step.addEventListener("click", () => selectStep(step)));
}
