import { ref, Ref } from "vue";
import { MapRnderer } from "./MapRenderer";
import { DrawingManager } from "./manager/DrawManager";
import * as THREE from "three";
import { LayerManager } from "./manager/LayerManager";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { LayerGroup } from "./enum/Layer";
import { backgroundLayer } from "@/stores/LayersStore";

class Editor {
  private _map: MapRnderer | null; // 编辑器地图实例
  private _loading: Ref<boolean>; // 编辑器加载状态
  private _drawManager: DrawingManager | null; // 编辑器绘制管理器
  private _layerManager: LayerManager | null;

  public camera!: THREE.Camera;
  public scene: THREE.Scene;
  public world: THREE.Group;
  public renderer: THREE.WebGLRenderer | null = null;

  constructor() {
    this._loading = ref(false);
    this._map = new MapRnderer({});
    this._drawManager = DrawingManager.getInstance<DrawingManager>();
    this._layerManager = LayerManager.getInstance<LayerManager>();

    this.scene = new THREE.Scene();
    this.world = new THREE.Group();
    this.world.name = "world";
    this.scene.add(this.world);
  }
  public async init() {
    this._loading.value = true;

    const mapInstance = await this._map?.mount("map-container")!;

    await this._drawManager?.init(mapInstance);
    this._layerManager?.init(mapInstance);

    this._initCustomLayers();

    this._loading.value = false;
  }

  public destory() {
    this._map?.destory();
  }

  private _initCustomLayers() {
    backgroundLayer.value = new BackgroundLayer(LayerGroup.Background);
    this._layerManager?.addLayer(backgroundLayer.value);
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
}

const editor = new Editor();

export default editor;
