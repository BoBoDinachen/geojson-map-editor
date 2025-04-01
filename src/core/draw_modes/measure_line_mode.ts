import MapboxDraw, {
  DrawCustomMode,
  DrawFeature,
} from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { GeoJSON } from "geojson";
import { LngLatLike, Marker } from "mapbox-gl";
import { DrawModeEnum } from "./index";

interface IState {
  currentVertexPosition: number;
  direction: "forward" | "backwards";
  line: DrawFeature;
}

interface IOptions {}

export const MeasureLineMode: {
  markers: Map<number, Marker>;
} & DrawCustomMode = {
  markers: new Map<number, Marker>(),
  onSetup(options: IOptions) {
    // console.log("onSetup", options)
    const line = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [],
      },
    });

    const state: IState = {
      currentVertexPosition: 0,
      direction: "forward",
      line,
    };

    this.addFeature(line);

    this.clearSelectedFeatures();
    return state;
  },
  onDrag(state: any, e: MapboxDraw.MapMouseEvent): void {
    console.log("onDrag", state);
  },
  onClick(state: IState, e: MapboxDraw.MapMouseEvent): void {
    // 判断鼠标右键
    if (e.originalEvent.button === 2) {
      this.deleteFeature(`${state.line.id}`, { silent: true });
      this.markers.forEach((marker) => {
        marker.remove();
      });
      //@ts-ignore
      return this.changeMode(DrawModeEnum.MEASURE_LINE_MODE);
    }
    const isEventAtCoordinates = (event: any, coordinates: number[]) => {
      if (!event.lngLat) return false;
      return (
        event.lngLat.lng === coordinates[0] &&
        event.lngLat.lat === coordinates[1]
      );
    };
    if (
      (state.currentVertexPosition > 0 &&
        isEventAtCoordinates(
          e,
          state.line.getCoordinate(`${state.currentVertexPosition - 1}`)
        )) ||
      (state.direction === "backwards" &&
        isEventAtCoordinates(
          e,
          state.line.getCoordinate(`${state.currentVertexPosition + 1}`)
        ))
    ) {
      this.markers.forEach((marker) => {
        marker.remove();
      });
      return this.changeMode("simple_select", { featureIds: [state.line.id] });
    }
    state.line.updateCoordinate(
      `${state.currentVertexPosition}`,
      e.lngLat.lng,
      e.lngLat.lat
    );
    if (state.direction === "forward") {
      state.currentVertexPosition++;
      const marker = new Marker({
        color: "#fff",
        element: document.createElement("div"),
        className: "text-shadow font-size-large",
        anchor: "center",
        offset: [0, 0],
      })
        .setLngLat(e.lngLat)
        .addTo(this.map as any);
      this.markers.set(state.currentVertexPosition, marker);
      state.line.updateCoordinate(
        `${state.currentVertexPosition}`,
        e.lngLat.lng,
        e.lngLat.lat
      );
    } else {
      state.line.updateCoordinate("0", e.lngLat.lng, e.lngLat.lat);
    }
  },
  onMouseMove(state: IState, e: MapboxDraw.MapMouseEvent): void {
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

      const marker = this.markers.get(state.currentVertexPosition);
      marker!.setLngLat(center.geometry.coordinates as LngLatLike);
      marker!.getElement().innerHTML = `${distance.toFixed(2)}m`;
      //   console.log("distance:", distance)
    }
    state.line.updateCoordinate(
      `${state.currentVertexPosition}`,
      e.lngLat.lng,
      e.lngLat.lat
    );
  },
  onMouseDown(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onMouseUp(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onMouseOut(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onKeyUp(state: any, e: KeyboardEvent): void {
    console.log("onKeyUp:", e);
  },
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
      this.markers.forEach((marker) => {
        marker.remove();
      });
      this.changeMode(
        MapboxDraw.constants.modes.SIMPLE_SELECT,
        {},
        { silent: true }
      );
    }
  },
  onTrash(state: any): void {
    // console.log("onTrash", state)
    this.deleteFeature(`${state.line.id}`, { silent: true });
    this.markers.forEach((marker) => {
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
