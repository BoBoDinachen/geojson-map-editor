import { Feature } from "geojson";
import { storage } from "@/utils/storage";
import { Utils } from "@/utils/index";

export enum StorageKey {
  GroundFeatures = "Ground_Features",
  WallFeatures = "Wall_Features",
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

  saveWallFeatures(features: Feature[]) {
    storage.set(StorageKey.WallFeatures, features, DEFAULT_CACHE_TIME);
  },

  getWallFeatures(): Feature[] {
    return storage.get(StorageKey.WallFeatures) || [];
  },

  updateWallFeatures(features: Feature[]) {
    storage.set(StorageKey.WallFeatures, features, DEFAULT_CACHE_TIME);
  },

  getAllFatures() {
    return [
      ...StorageHandler.getGroundFeatures(),
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
