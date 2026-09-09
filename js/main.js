import { initSharedLayout } from "./blocks/layout.js";
import { initHeader } from "./blocks/header.js";
import { initHero } from "./blocks/hero.js";
import { initLeadForms } from "./blocks/lead-form.js";
import { initTrusted } from "./blocks/trusted.js";
import { initCases } from "./blocks/cases.js";
import { initServices } from "./blocks/services.js";
import { initWorkflow } from "./blocks/workflow.js";
import { initWhyUs } from "./blocks/why-us.js";
import { initTeam } from "./blocks/team.js";
import { initBlog } from "./blocks/blog.js";
import { initFooter } from "./blocks/footer.js";

async function bootstrap() {
  await initSharedLayout();
  initHeader();
  initHero();
  initLeadForms();
  initTrusted();
  initCases();
  initServices();
  initWorkflow();
  initWhyUs();
  initTeam();
  initBlog();
  initFooter();
}

bootstrap().catch((error) => {
  console.error("Не удалось инициализировать страницу", error);
});
