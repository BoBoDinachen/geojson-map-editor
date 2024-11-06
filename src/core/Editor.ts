import { ref, Ref } from "vue";
import { MapRnderer } from "./MapRenderer";
import { DrawingManager } from "./DrawingManager";
import * as THREE from "three";
import { RaycasterManager } from "./RaycasterManager";

class Editor {
  private _map: MapRnderer | null; // 编辑器地图实例
  private _loading: Ref<boolean>; // 编辑器加载状态
  private _drawManager: DrawingManager | null; // 编辑器绘制管理器

  public camera!: THREE.Camera;
  public scene: THREE.Scene;
  public world: THREE.Group;
  public renderer: THREE.WebGLRenderer | null = null;
  public raycasterManager: RaycasterManager | null = null;

  constructor() {
    this._loading = ref(false);
    this._map = new MapRnderer({});
    this._drawManager = DrawingManager.getInstance<DrawingManager>();
    this.raycasterManager = RaycasterManager.getInstance<RaycasterManager>();
    
    this.scene = new THREE.Scene();
    this.world = new THREE.Group();
    this.world.name = "world";
    this.scene.add(this.world);
  }
  public async init() {
    this._loading.value = true;

    const mapInstance = await this._map?.mount("map-container")!;

    await this._drawManager?.init(mapInstance);

    this.raycasterManager?.init(mapInstance,this.renderer!, this.camera, this.world);
    
    this._loading.value = false;
  }

  public destory() {
    this._map?.destory();
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
