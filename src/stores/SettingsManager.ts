import { storage } from "@/utils/storage";
import { reactive, toRaw } from "vue";

export interface ISettings {
  general: {
    theme: "dark" | "light";
    mapbox_token: string;
  };
  editor: {};
  preview: {};
}
class SettingsManager {
  private _sttings: ISettings;
  constructor() {
    this._sttings = reactive({
      general: {
        theme: "dark",
        mapbox_token: "",
      },
      editor: {},
      preview: {},
    });
  }

  // 序列化设置保存到本地
  public saveSttings() {
    const settings = toRaw(this._sttings);
    console.log("saveSttins=>", settings);
    storage.set("settings", settings);
  }

  public get settings() {
    return this._sttings;
  }

  private _initSettings() {}
}

const settingsManager = new SettingsManager();

export default settingsManager;
