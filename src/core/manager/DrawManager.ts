import { Singleton } from "@/utils/Singleton";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  SnapPolygonMode,
  SnapPointMode,
  SnapLineMode,
  SnapModeDrawStyles,
  SnapDirectSelect,
} from "mapbox-gl-draw-snap-mode";
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
    this._draw = new MapboxDraw({
      modes: {
        ...MapboxDraw.modes,
        draw_point: SnapPointMode,
        draw_polygon: SnapPolygonMode,
        draw_line_string: SnapLineMode,
        direct_select: SnapDirectSelect,
      },
      // Styling guides
      styles: SnapModeDrawStyles,
      userProperties: true,
      // Config snapping features
      //@ts-ignore
      snap: true,
      snapOptions: {
        snapPx: 15, // defaults to 15
        snapToMidPoints: true, // defaults to false
        snapVertexPriorityDistance: 0.0025, // defaults to 1.25
      },
      guides: false,
    });
    this._map.addControl(this._draw, "top-right");
  }
  public destory() {}
}
