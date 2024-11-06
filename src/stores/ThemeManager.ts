import { reactive } from "vue";

export const ThemeManager = reactive({
  activeTheme: "dark" as Theme,
  isDarkTheme() {
    return this.activeTheme === "dark";
  },
  toogleTheme() {
    this.activeTheme = this.activeTheme === "dark" ? "light" : "dark";
    this.setHtmlClassName(this.activeTheme);
  },
  /** 在 html 根元素上挂载 class */
  setHtmlClassName(value: Theme) {
    document.documentElement.className = value;
  },
  initTheme() {
    this.activeTheme = "dark";
    this.setHtmlClassName(this.activeTheme);
  },
});

export type Theme = "dark" | "light";
