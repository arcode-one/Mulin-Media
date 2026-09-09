import { initSharedLayout } from "./blocks/layout.js";
import { initHeader } from "./blocks/header.js";
import { initLeadForms } from "./blocks/lead-form.js";
import { initFooter } from "./blocks/footer.js";
import { initCasesCatalog } from "./blocks/cases-catalog.js";

async function bootstrap() {
  await initSharedLayout();
  initHeader();
  initCasesCatalog();
  initLeadForms();
  initFooter();
}

bootstrap().catch((error) => {
  console.error("Не удалось инициализировать страницу кейсов", error);
});
