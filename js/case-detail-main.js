import { initSharedLayout } from "./blocks/layout.js";
import { initHeader } from "./blocks/header.js";
import { initLeadForms } from "./blocks/lead-form.js";
import { initFooter } from "./blocks/footer.js";
import { initCaseDetail } from "./blocks/case-detail.js";

async function bootstrap() {
  await initSharedLayout();
  initHeader();
  initCaseDetail();
  initLeadForms();
  initFooter();
}

bootstrap().catch((error) => {
  console.error("Не удалось инициализировать страницу отдельного кейса", error);
});
