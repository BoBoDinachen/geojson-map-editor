import { Feature } from "geojson";
import { storage } from "@/utils/storage";
import { Utils } from "@/utils/index";
import { customRef } from "vue";

export enum StorageKey {
  GroundFeatures = "Ground_Features",
  BlockFeatures = "Block_Features",
  WallFeatures = "Wall_Features",
  BaseMapConfig = "BaseMap_Config",
  ShowBaseMap = "Show_BaseMap",
  ShowGridBackground = "Show_Grid_Background",
}

const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 30; // 缓存时间 30 天

export const StorageHandler = {
  saveGroundFeatures(features: Feature[]) {
    storage.set(StorageKey.GroundFeatures, features, DEFAULT_CACHE_TIME);
  },

  getGroundFeatures(): Feature[] {
    return storage.get(StorageKey.GroundFeatures) || [];
  },

  updateGroundFeatures(features: Feature[]) {
    storage.set(StorageKey.GroundFeatures, features, DEFAULT_CACHE_TIME);
  },

  saveBlockFeatures(features: Feature[]) {
    storage.set(StorageKey.BlockFeatures, features, DEFAULT_CACHE_TIME);
  },

  getBlockFeatures(): Feature[] {
    return storage.get(StorageKey.BlockFeatures) || [];
  },

  updateBlockFeatures(features: Feature[]) {
    storage.set(StorageKey.BlockFeatures, features, DEFAULT_CACHE_TIME);
  },

  saveWallFeatures(features: Feature[]) {
    storage.set(StorageKey.WallFeatures, features, DEFAULT_CACHE_TIME);
  },

  getWallFeatures(): Feature[] {
    return storage.get(StorageKey.WallFeatures) || [];
  },

  updateWallFeatures(features: Feature[]) {
    storage.set(StorageKey.WallFeatures, features, DEFAULT_CACHE_TIME);
  },

  saveBaseMapConfig(config: { token: string; url: string }) {
    storage.set(StorageKey.BaseMapConfig, config, DEFAULT_CACHE_TIME);
  },

  getBaseMapConfig(): { token: string; url: string } {
    return storage.get(StorageKey.BaseMapConfig) || { token: "", url: "" };
  },

  getAllFatures() {
    return [
      ...StorageHandler.getGroundFeatures(),
      ...StorageHandler.getBlockFeatures(),
      ...StorageHandler.getWallFeatures(),
    ];
  },

  exportMapFile(fileName: string) {
    const allFeatures = this.getAllFatures();
    const data = {
      type: "FeatureCollection",
      features: allFeatures,
    };
    Utils.exportJSON(data, `${fileName}.geojson`);
  },
};

export function useStorageRef<T>(key: StorageKey, defaultValue: T) {
  return customRef<T>((track, trigger) => {
    return {
      get() {
        track();
        let value = storage.get(key);
        return value ?? defaultValue;
      },
      set(newValue) {
        storage.set(key, newValue, DEFAULT_CACHE_TIME);
        trigger();
      },
    };
  });
}
