import { initSharedLayout } from "./blocks/layout.js";
import { initHeader } from "./blocks/header.js";
import { initLeadForms } from "./blocks/lead-form.js";
import { initFooter } from "./blocks/footer.js";
import { initCases } from "./blocks/cases.js";
import { initTeam } from "./blocks/team.js";
import { initAvitoChannels } from "./blocks/avito-channels.js";
import { initAvitoFaq } from "./blocks/avito-faq.js";
import { initAvitoSolutions } from "./blocks/avito-solutions.js";
import { initAvitoSteps } from "./blocks/avito-steps.js";

async function bootstrap() {
  await initSharedLayout();
  initHeader();
  initLeadForms();
  initFooter();
  initCases();
  initTeam();
  initAvitoChannels();
  initAvitoFaq();
  initAvitoSolutions();
  initAvitoSteps();
}

bootstrap().catch((error) => {
  console.error("Не удалось инициализировать страницу Авито PRO", error);
});
