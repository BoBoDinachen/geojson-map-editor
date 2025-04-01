import { ref, Ref } from "vue";
import { MapRnderer, CustomMapOptions } from "./MapRenderer";
import { DrawingManager } from "./manager/DrawManager";
import * as THREE from "three";
import { MapOptions } from "mapbox-gl";
import { StorageHandler } from "@/storage-handler";

interface Options {}

class Editor {
  private _mapRenderer: MapRnderer | null; // 编辑器地图实例
  private _loading: Ref<boolean>; // 编辑器加载状态
  public camera!: THREE.Camera;
  public scene: THREE.Scene;
  public world: THREE.Group;
  public renderer: THREE.WebGLRenderer | null = null;

  constructor() {
    this._loading = ref(false);
    this._mapRenderer = new MapRnderer({ geocoderContainer: "map-search" });

    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.scene = new THREE.Scene();
    this.world = new THREE.Group();
    this.world.name = "world";
    this.scene.add(this.world);
  }
  public async init(options: Options) {
    this._loading.value = true;
    try {
      const baseMapConfig = StorageHandler.getBaseMapConfig();
      const options: Partial<MapOptions> = {
        accessToken: baseMapConfig.token || " ",
        style: baseMapConfig.url || {
          version: 8,
          glyphs: "/fonts/{fontstack}/{range}.pbf",
          sources: {},
          layers: [],
          zoom: 20,
          center: [0, 0],
          metadata: {},
        },
      };
      console.log("init map.", options);
      await this._mapRenderer?.mount("map-container", options);

      this.initThreeRenderer(this.mapInstance!);
    } catch (error: any) {
      console.error(error);
      window.$message.error(`Map load failed. ${error.message ?? ""}`);
    } finally {
      this._loading.value = false;
    }
  }

  public async reloadMap(options: Partial<MapOptions>) {
    console.log("Reload map.", options);
    this._loading.value = true;
    try {
      await this._mapRenderer?.mount("map-container", options)!;
      this.initThreeRenderer(this.mapInstance!);
      window.$message.success("Map reloaded.");
    } catch (error: any) {
      console.error(error);
      window.$message.error(`Map load failed. ${error.message ?? ""}`);
    } finally {
      this._loading.value = false;
    }
  }

  public destory() {
    this._mapRenderer?.destory();
    this.renderer?.dispose();
  }

  private initThreeRenderer(map: mapboxgl.Map) {
    const canvas = map.getCanvas();

    const h = canvas.clientHeight;
    const w = canvas.clientWidth;
    this.camera = new THREE.PerspectiveCamera(
      map.transform.fov,
      w / h,
      0.1,
      1e21
    );

    // use the Mapbox GL JS map canvas for three.js
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      context: canvas.getContext("webgl2")!,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      map.getCanvas().clientWidth,
      map.getCanvas().clientHeight
    );
    this.renderer.autoClear = false;
  }

  public get loading() {
    return this._loading.value;
  }

  public setLoading(loading: boolean) {
    this._loading.value = loading;
  }

  public get mapRenderer() {
    return this._mapRenderer;
  }

  public get mapInstance() {
    return this._mapRenderer?.mapInstance;
  }

  public getDrawInstance() {
    return DrawingManager.getInstance<DrawingManager>().getDraw();
  }

  public getDrawManager() {
    return DrawingManager.getInstance<DrawingManager>();
  }
}

const editor = new Editor();

export default editor;
