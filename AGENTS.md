# Shared site layout

- All pages must use the same header and footer, including new service pages, cases, and CMS-created pages.
- Reuse `partials/header.html`, `partials/footer.html`, and `initSharedLayout()` in the static site. Do not copy their markup into page-specific templates.
- Use the shared header/footer CSS and load `css/blocks/footer-responsive.css` after page styles. Do not introduce page-specific header/footer skins or responsive overrides.
- Active navigation state may differ; layout, menu destinations, form, and styling must remain shared.
- Header contrast must match the hero: set `data-header-theme="dark"` on the body for dark heroes (white logo/text before scrolling), or `"light"` for light heroes. Scrolled headers always use the dark logo on the light background. This is a shared component state, not a separate page layout.
- This repository currently contains static HTML, not an installed CMS. During CMS integration, put the common header/footer in the global default page template so pages created in the admin inherit them automatically. Do not claim admin integration is working until implemented and tested.
