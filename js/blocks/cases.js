import { createLoopSlider } from "../utils/create-slider.js?v=20260912-cases-step";
import { CASE_STUDIES, CASES_PAGE_CONFIG } from "../data/cases-data.js";

const renderCaseCard = (caseStudy) => {
  const mobileSource = caseStudy.mobileImage
    ? `<source media="(max-width: 767px)" srcset="${caseStudy.mobileImage}">`
    : "";

  return `
    <li class="cases__slide" data-slide data-case-services="${caseStudy.services.join(" ")}">
      <article class="case-card">
        <div class="case-card__top">
          <span class="case-card__tag">${caseStudy.tag}</span>
          <picture class="case-card__metrics" aria-hidden="true">
            <img loading="lazy" decoding="async" src="${caseStudy.metrics}" width="80" height="30" alt="">
          </picture>
        </div>
        <h3 class="case-card__title">${caseStudy.title}</h3>
        <div class="case-card__media">
          <picture class="case-card__media-backdrop" aria-hidden="true">
            ${mobileSource}
            <img loading="lazy" decoding="async" src="${caseStudy.image}" alt="">
          </picture>
          <picture>
            ${mobileSource}
            <img loading="lazy" decoding="async" src="${caseStudy.image}" alt="${caseStudy.imageAlt}">
          </picture>
        </div>
        <p class="case-card__description">${caseStudy.description}</p>
        <a class="case-card__button" href="${caseStudy.href}">Открыть</a>
      </article>
    </li>
  `;
};

export const initCases = () => {
  document.querySelectorAll(".cases").forEach((section) => {
    const slider = section.querySelector("[data-cases-slider]");
    const track = section.querySelector(".cases__track");
    if (!slider || !track) return;

    const page = document.body.dataset.layoutPage ?? "home";
    const pageConfig = CASES_PAGE_CONFIG[page] ?? CASES_PAGE_CONFIG.home;
    const requestedService = section.dataset.casesService ?? pageConfig.service;
    const visibleCases = requestedService === "all"
      ? CASE_STUDIES
      : CASE_STUDIES.filter((caseStudy) => caseStudy.services.includes(requestedService));

    if (!visibleCases.length) {
      section.hidden = true;
      return;
    }

    const title = section.querySelector(".cases__title");
    if (title) title.textContent = section.dataset.casesTitle ?? pageConfig.title;
    if (title && page === "avito") title.innerHTML = 'Наши <span class="cases__title-accent">кейсы</span>';

    track.innerHTML = visibleCases.map((caseStudy) => renderCaseCard(
      page === "avito" ? { ...caseStudy, ...caseStudy.avitoDisplay } : caseStudy,
    )).join("");

    const status = section.querySelector("[data-cases-status]");

    createLoopSlider(slider, {
      trackSelector: ".cases__track",
      slideSelector: ".cases__slide",
      previousButtons: section.querySelectorAll("[data-cases-prev]"),
      nextButtons: section.querySelectorAll("[data-cases-next]"),
      dotsWrap: section.querySelector("[data-cases-dots]"),
      dotClass: "cases__dot",
      enableSwipe: true,
      stableTrack: true,
      snapInsetAfterInteraction: () => window.innerWidth <= 640 ? null : 16,
      onPreview: (index) => {
        slider.classList.add("is-previewing");
        slider.querySelectorAll(".cases__slide").forEach((slide) => {
          slide.classList.toggle("is-preview-active", Number(slide.dataset.loopIndex) === index);
        });
      },
      onChange: (index, total) => {
        slider.classList.remove("is-previewing");
        slider.querySelectorAll(".is-preview-active").forEach((slide) => slide.classList.remove("is-preview-active"));
        if (status) status.textContent = `Позиция ${index + 1} из ${total}`;
      },
    });
  });
};
