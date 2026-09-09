import { initSharedLayout } from "./blocks/layout.js";
import { initHeader } from "./blocks/header.js";
import { initLeadForms } from "./blocks/lead-form.js";
import { initFooter } from "./blocks/footer.js";
import { initAvitoCases } from "./blocks/avito-cases.js";
import { initAvitoTeam } from "./blocks/avito-team.js";
import { initAvitoChannels } from "./blocks/avito-channels.js";
import { initAvitoFaq } from "./blocks/avito-faq.js";
import { initAvitoSolutions } from "./blocks/avito-solutions.js";

async function bootstrap() {
  await initSharedLayout();
  initHeader();
  initLeadForms();
  initFooter();
  initAvitoCases();
  initAvitoTeam();
  initAvitoChannels();
  initAvitoFaq();
  initAvitoSolutions();
}

bootstrap().catch((error) => {
  console.error("Не удалось инициализировать страницу Авито PRO", error);
});
