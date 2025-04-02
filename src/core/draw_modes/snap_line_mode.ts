import { DrawModeEnum } from "./index";
import MapboxDraw, {
  DrawCustomMode,
  DrawFeature,
} from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { GeoJSON, Position } from "geojson";
import { LngLatLike, Marker } from "mapbox-gl";

interface IState {
  bounds: Array<number[][]>;
  currentVertexPosition: number;
  direction: "forward" | "backwards";
  line: DrawFeature;
  drawPoint: number[];
  snapThreshold: number;
}

interface IOptions {
  snapThreshold: number; //吸附线阈值，单位像素
  bounds: Array<number[][]>;
}

interface ISnapLineMode extends DrawCustomMode {
  drawPointMarker: Marker | null;
  distanceMarkers: Map<number, Marker>;
}

export const SnapLineMode: ISnapLineMode = {
  drawPointMarker: null,
  distanceMarkers: new Map<number, Marker>(),
  onSetup(options: IOptions) {
    // console.log("onSetup", options)
    const marker = new Marker({
      color: "#fff",
      element: document.createElement("div"),
      className: "snap-point-marker",
      anchor: "center",
      offset: [0, 0],
    })
      .setLngLat([0, 0])
      .addTo(this.map as any);

    this.drawPointMarker = marker;

    const line = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    });

    const state: IState = {
      bounds: options.bounds || [],
      snapThreshold: options.snapThreshold || 20,
      currentVertexPosition: 0,
      direction: "forward",
      line,
      drawPoint: [],
    };

    this.addFeature(line);

    this.clearSelectedFeatures();
    return state;
  },
  onDrag(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onClick(state: IState, e: MapboxDraw.MapMouseEvent): void {
    // 判断鼠标右键
    if (e.originalEvent.button === 2) {
      state.currentVertexPosition = 0;
      this.deleteFeature(`${state.line.id}`, { silent: true });
      this.drawPointMarker?.remove();
      this.distanceMarkers.forEach((marker) => {
        marker.remove();
      });
      //@ts-ignore
      return this.changeMode(DrawModeEnum.SNAP_LINE_MODE, {
        snapThreshold: state.snapThreshold,
        bounds: state.bounds,
      });
    }
    const isDrawAtCoordinates = (
      drawPoint: number[],
      coordinates: number[]
    ) => {
      return drawPoint[0] === coordinates[0] && drawPoint[1] === coordinates[1];
    };
    if (
      (state.currentVertexPosition > 0 &&
        isDrawAtCoordinates(
          state.drawPoint,
          state.line.getCoordinate(`${state.currentVertexPosition - 1}`)
        )) ||
      (state.direction === "backwards" &&
        isDrawAtCoordinates(
          state.drawPoint,
          state.line.getCoordinate(`${state.currentVertexPosition + 1}`)
        ))
    ) {
      this.drawPointMarker?.remove();
      this.distanceMarkers.forEach((marker) => {
        marker.remove();
      });
      return this.changeMode("simple_select", { featureIds: [state.line.id] });
    }
    state.line.updateCoordinate(
      `${state.currentVertexPosition}`,
      state.drawPoint[0],
      state.drawPoint[1]
    );
    if (state.direction === "forward") {
      state.currentVertexPosition++;
      state.line.updateCoordinate(
        `${state.currentVertexPosition}`,
        state.drawPoint[0],
        state.drawPoint[1]
      );
      const marker = new Marker({
        color: "#fff",
        element: document.createElement("div"),
        className: "text-shadow font-size-large",
        anchor: "center",
        offset: [0, 0],
      })
        .setLngLat(e.lngLat)
        .addTo(this.map as any);
      this.distanceMarkers.set(state.currentVertexPosition, marker);
    } else {
      state.line.updateCoordinate("0", state.drawPoint[0], state.drawPoint[1]);
    }
  },
  onMouseMove(state: IState, e: MapboxDraw.MapMouseEvent): void {
    const mousePoint = [e.lngLat.lng, e.lngLat.lat];
    const mousePointMarker = this.drawPointMarker;

    // 移动的时候检查是否有 snap点
    let nearestSnapPoint: Position | null = null;
    let minDistance = Infinity;
    state.bounds.forEach((coordinates) => {
      const nearest = turf.nearestPointOnLine(
        turf.lineString(coordinates),
        mousePoint
      );
      const screenPos = this.map.project(
        nearest.geometry.coordinates as LngLatLike
      );
      const mousePos = this.map.project(mousePoint as LngLatLike);

      const distance = Math.hypot(
        screenPos.x - mousePos.x,
        screenPos.y - mousePos.y
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnapPoint = nearest.geometry.coordinates;
      }
    });

    if (nearestSnapPoint && minDistance < state.snapThreshold) {
      // 触发吸附
      mousePointMarker?.setLngLat(nearestSnapPoint as LngLatLike);
      state.drawPoint = [nearestSnapPoint[0], nearestSnapPoint[1]];
      state.line.updateCoordinate(
        `${state.currentVertexPosition}`,
        nearestSnapPoint[0],
        nearestSnapPoint[1]
      );
    } else {
      // 取消吸附
      mousePointMarker?.setLngLat(mousePoint as LngLatLike);
      state.drawPoint = [mousePoint[0], mousePoint[1]];
      state.line.updateCoordinate(
        `${state.currentVertexPosition}`,
        mousePoint[0],
        mousePoint[1]
      );
    }

    if (state.currentVertexPosition >= 1) {
      const start = state.line.getCoordinate(
        `${state.currentVertexPosition - 1}`
      );
      const end = state.line.getCoordinate(`${state.currentVertexPosition}`);
      const distance = turf.distance(start, end, { units: "meters" });
      //@ts-ignore
      const points = turf.points([
        state.line.getCoordinate(`${state.currentVertexPosition - 1}`),
        state.line.getCoordinate(`${state.currentVertexPosition}`),
      ]);
      const center = turf.center(points);

      const marker = this.distanceMarkers.get(state.currentVertexPosition);
      marker!.setLngLat(center.geometry.coordinates as LngLatLike);
      marker!.getElement().innerHTML = `${distance.toFixed(2)}m`;
    }
  },
  onMouseDown(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onMouseUp(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onMouseOut(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onKeyUp(state: any, e: KeyboardEvent): void {},
  onKeyDown(state: any, e: KeyboardEvent): void {},
  onTouchStart(state: any, e: MapboxDraw.MapTouchEvent): void {},
  onTouchMove(state: any, e: MapboxDraw.MapTouchEvent): void {},
  onTouchEnd(state: any, e: MapboxDraw.MapTouchEvent): void {},
  onTap(state: any, e: MapboxDraw.MapTouchEvent): void {},
  onStop(state: IState): void {
    // check to see if we've deleted this feature
    if (this.getFeature(`${state.line.id}`) === undefined) return;
    //@ts-ignore
    state.line.removeCoordinate(`${state.currentVertexPosition}`);

    if (state.line.isValid()) {
      this.map.fire(MapboxDraw.constants.events.CREATE, {
        features: [state.line.toGeoJSON()],
      });
    } else {
      this.deleteFeature(`${state.line.id}`, { silent: true });
      this.changeMode(
        MapboxDraw.constants.modes.SIMPLE_SELECT,
        {},
        { silent: true }
      );
      this.drawPointMarker?.remove();
      this.distanceMarkers.forEach((marker) => {
        marker.remove();
      });
    }
  },
  onTrash(state: any): void {
    this.deleteFeature(`${state.line.id}`, { silent: true });
    this.drawPointMarker?.remove();
    this.distanceMarkers.forEach((marker) => {
      marker.remove();
    });
    this.changeMode("simple_select");
  },
  onCombineFeature(state: any): void {},
  onUncombineFeature(state: any): void {},
  toDisplayFeatures(
    state: any,
    geojson: any,
    display: (geojson: GeoJSON) => void
  ): void {
    const isActiveLine = geojson.properties.id === state.line.id;
    geojson.properties.active = isActiveLine
      ? MapboxDraw.constants.activeStates.ACTIVE
      : MapboxDraw.constants.activeStates.INACTIVE;
    if (!isActiveLine) return display(geojson);
    // Only render the line if it has at least one real coordinate
    if (geojson.geometry.coordinates.length < 2) return;
    geojson.properties.meta = MapboxDraw.constants.meta.FEATURE;
    display(
      createVertex(
        state.line.id,
        geojson.geometry.coordinates[
          state.direction === "forward"
            ? geojson.geometry.coordinates.length - 2
            : 1
        ],
        `${
          state.direction === "forward"
            ? geojson.geometry.coordinates.length - 2
            : 1
        }`,
        false
      )
    );

    display(geojson);
  },
};

function createVertex(
  parentId: string,
  coordinates: number[],
  path: string,
  selected: boolean
) {
  return {
    type: MapboxDraw.constants.geojsonTypes.FEATURE,
    properties: {
      meta: MapboxDraw.constants.meta.VERTEX,
      parent: parentId,
      coord_path: path,
      active: selected
        ? MapboxDraw.constants.activeStates.ACTIVE
        : MapboxDraw.constants.activeStates.INACTIVE,
    },
    geometry: {
      type: MapboxDraw.constants.geojsonTypes.POINT,
      coordinates,
    },
  };
}
