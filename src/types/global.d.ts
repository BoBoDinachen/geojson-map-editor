import {
  CustomThemeCommonVars,
  DialogApi,
  MessageApi,
  NotificationApi,
  ThemeCommonVars,
} from "naive-ui";
declare global {
  interface Window {
    $message: MessageApi;
    $notification: NotificationApi;
    $themeVars: ComputedRef<ThemeCommonVars & CustomThemeCommonVars>;
    $dialog: DialogApi;
  }
}
