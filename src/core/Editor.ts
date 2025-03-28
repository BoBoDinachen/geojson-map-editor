import { ref, Ref } from "vue";
import { MapRnderer } from "./MapRenderer";
import { DrawingManager } from "./manager/DrawManager";
import * as THREE from "three";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { LayerGroup } from "./enum/Layer";
import { backgroundLayer, groundLayer, wallsLayer } from "@/stores/LayersStore";
import { GroundLayer } from "./layers/Ground";
import { WallsLayer } from "./layers/Walls";

interface Options {
  geocoderContainer?: string;
}

class Editor {
  private _map: MapRnderer | null; // 编辑器地图实例
  private _loading: Ref<boolean>; // 编辑器加载状态
  private _drawManager: DrawingManager | null; // 编辑器绘制管理器

  public camera!: THREE.Camera;
  public scene: THREE.Scene;
  public world: THREE.Group;
  public renderer: THREE.WebGLRenderer | null = null;

  constructor() {
    this._loading = ref(false);
    this._map = new MapRnderer({});
    this._drawManager = DrawingManager.getInstance<DrawingManager>();

    this.scene = new THREE.Scene();
    this.world = new THREE.Group();
    this.world.name = "world";
    this.scene.add(this.world);
  }
  public async init(options: Options) {
    this._loading.value = true;

    const mapInstance = await this._map?.mount("map-container")!;

    await this._initCustomLayers();

    await this._drawManager?.init(mapInstance);

    if (options.geocoderContainer) {
      this.setMapGeocoder(options.geocoderContainer);
    }

    this._loading.value = false;
  }

  public destory() {
    this._map?.destory();
  }

  private async _initCustomLayers() {
    backgroundLayer.value = new BackgroundLayer({ id: "background-layer" });
    groundLayer.value = new GroundLayer({ id: "ground-layer" });
    wallsLayer.value = new WallsLayer({ id: "walls-layer" });

    const layers = [backgroundLayer.value, groundLayer.value, wallsLayer.value];
    layers.forEach((layer) => {
      //@ts-ignore
      this._map?.mapInstance?.addLayer(layer);
    });
    await this._map?.mapInstance?.once("styledata");

  }

  public setMapGeocoder(container: string) {
    const el = document.getElementById(container);
    const geocoder = this._map?.getGeocoder()!;
    if (el && geocoder) {
      el.appendChild(geocoder);
    }
  }

  public get loading() {
    return this._loading.value;
  }

  public setLoading(loading: boolean) {
    this._loading.value = loading;
  }

  public get map() {
    return this._map;
  }

  public getDrawInstance() {
    return this._drawManager?.getDraw();
  }

  public getDrawManager() {
    return this._drawManager;
  }
}

const editor = new Editor();

export default editor;
