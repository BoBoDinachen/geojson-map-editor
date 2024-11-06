import { type App } from "vue";
import SvgIcon from "./SvgIcon.vue";

export function setupGlobalComponent(app: App) {
  app.component("SvgIcon", SvgIcon);
}
