import { Singleton } from "@/utils/Singleton";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  DrawRectangleMode,
  CircleMode,
  DrawPointMode,
  DrawPolygonMode,
  DrawModeEnum,
  SnapLineMode,
  MeasureLineMode,
} from "../draw_modes/index";

/**
 * 1.管理绘制状态，移动、选择、绘制等
 * 2.包括绘制模式、绘制颜色等
 * 3. 处理绘制的要素数据、保存撤销、回退命令等
 */
export class DrawingManager extends Singleton {
  private _map: mapboxgl.Map | null = null;
  private _draw: MapboxDraw | null = null;
  private _events: Array<(e: any) => void> = [];
  private _waitList: Map<(e: any) => void, number> = new Map();
  protected constructor() {
    super();
  }

  public async init(map: mapboxgl.Map) {
    this._map = map;
    this._draw = new MapboxDraw({
      modes: {
        ...MapboxDraw.modes,
        [DrawModeEnum.RECTANGLE_MODE]: DrawRectangleMode,
        [DrawModeEnum.CIRCLE_MODE]: CircleMode,
        [DrawModeEnum.POINT_MODE]: DrawPointMode,
        [DrawModeEnum.POLYGON_MODE]: DrawPolygonMode,
        [DrawModeEnum.SNAP_LINE_MODE]: SnapLineMode,
        [DrawModeEnum.MEASURE_LINE_MODE]: MeasureLineMode,
      },
      displayControlsDefault: false,
    });
    this._map.addControl(this._draw, "top-right");
  }

  public drawPlane(
    cb: (feature: GeoJSON.Feature) => void,
    stopCb: () => void,
    options: DrawCore.DrawPlaneOptions
  ) {
    options = Object.assign(
      {
        deleteAll: true,
        drawMode: DrawModeEnum.RECTANGLE_MODE,
      } as DrawCore.DrawPlaneOptions,
      options
    );
    this._draw?.changeMode(options.drawMode!);
    const event = (e) => {
      cb(e.features[0]);
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
    this._addEvent(event);
    this._map?.once("draw.create", event);
    // 长时间未绘制，自动停止绘制
    if (options.duration) {
      const timeout = setTimeout(() => {
        options.deleteAll && this._draw?.deleteAll();
        this._stopDraw(event);
        stopCb();
        console.log("长时间未绘制，自动停止绘制", options);
      }, options.duration);
      this._waitList.set(event, timeout);
    }
    return () => {
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
  }

  public drawPoint(
    cb: (feature: GeoJSON.Feature) => void,
    stopCb: () => void,
    options: DrawCore.DrawPointOptions
  ) {
    options = Object.assign(
      { duration: 20000, deleteAll: false } as DrawCore.DrawPointOptions,
      options
    );
    this._draw?.changeMode(DrawModeEnum.POINT_MODE);
    const event = (e) => {
      cb(e.features[0]);
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
    this._addEvent(event);
    this._map?.once("draw.create", event);
    // 长时间未绘制，自动停止绘制
    if (options.duration) {
      const timeout = setTimeout(() => {
        options.deleteAll && this._draw?.deleteAll();
        this._stopDraw(event);
        stopCb();
        console.log("长时间未绘制，自动停止绘制", options);
      }, options.duration);
      this._waitList.set(event, timeout);
    }
    return () => {
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
  }

  public drawSnapLine(
    cb: (feature: GeoJSON.Feature) => void,
    stopCb: () => void,
    options: DrawCore.DrawSnapLineOptions
  ) {
    options = Object.assign(
      {
        deleteAll: false,
        enableSnap: true,
      } as DrawCore.DrawSnapLineOptions,
      options
    );
    if (options.enableSnap) {
      this._draw?.changeMode(DrawModeEnum.SNAP_LINE_MODE, {
        snapThreshold: options.snapThreshold,
        bounds: options.bounds,
      });
    } else {
      this._draw?.changeMode("draw_line_string");
    }
    const event = (e) => {
      cb(e.features[0]);
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
    this._addEvent(event);
    this._map?.once("draw.create", event);
    // 长时间未绘制，自动停止绘制
    if (options.duration) {
      const timeout = setTimeout(() => {
        options.deleteAll && this._draw?.deleteAll();
        this._stopDraw(event);
        stopCb();
        console.log("长时间未绘制，自动停止绘制", options);
      }, options.duration);
      this._waitList.set(event, timeout);
    }
    return () => {
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
  }

  public drawMeasureLine(
    cb: (feature: GeoJSON.Feature) => void,
    stopCb: () => void,
    options: DrawCore.DrawMeasureLineOptions
  ) {
    options = Object.assign(
      {
        deleteAll: false,
      } as DrawCore.DrawMeasureLineOptions,
      options
    );

    this._draw?.changeMode(DrawModeEnum.MEASURE_LINE_MODE);
    const event = (e) => {
      cb(e.features[0]);
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
    this._addEvent(event);
    this._map?.once("draw.create", event);
    // 长时间未绘制，自动停止绘制
    if (options.duration) {
      const timeout = setTimeout(() => {
        options.deleteAll && this._draw?.deleteAll();
        this._stopDraw(event);
        stopCb();
        console.log("长时间未绘制，自动停止绘制", options);
      }, options.duration);
      this._waitList.set(event, timeout);
    }
    return () => {
      options.deleteAll && this._draw?.deleteAll();
      this._stopDraw(event);
      stopCb();
    };
  }

  private _stopDraw(event: (e: any) => void) {
    this._draw?.trash();
    this._offDrawEvent(event);
    const timeout = this._waitList.get(event);
    if (timeout) {
      clearTimeout(timeout);
      this._waitList.delete(event);
    }
  }

  public getDraw() {
    return this._draw;
  }

  private _addEvent(event: (e: any) => void) {
    const eventIndex = this._events.findIndex((e) => e === event);
    if (eventIndex === -1) {
      this._events.push(event);
    }
  }

  private _offDrawEvent(event: (e: any) => void) {
    this._map?.off("draw.create", event);
    const eventIndex = this._events.findIndex((e) => e === event);
    if (eventIndex !== -1) {
      this._events.splice(eventIndex, 1);
    }
  }

  private _offAllDrawEvent() {
    this._events.forEach((event) => {
      this._map?.off("draw.create", event);
    });
    this._events = [];
  }

  public destory() {
    this._draw?.trash();
    this._offAllDrawEvent();
  }
}
