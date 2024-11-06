import { Singleton } from "@/utils/Singleton";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

/**
 * 1.管理绘制状态，移动、选择、绘制等
 * 2.包括绘制模式、绘制颜色等
 * 3. 处理绘制的要素数据、保存撤销、回退命令等
 */
export class DrawingManager extends Singleton {
  private _map: mapboxgl.Map | null = null;
  private _draw: MapboxDraw | null = null;

  protected constructor() {
    super();
  }

  public async init(map: mapboxgl.Map) {
    this._map = map;
    this._draw = new MapboxDraw({});
    this._map.addControl(this._draw, "top-right");
  }
  public destory() {}
}
