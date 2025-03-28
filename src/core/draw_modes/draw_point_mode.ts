import MapboxDraw, {
  DrawCustomMode,
  DrawFeature,
  constants,
} from "@mapbox/mapbox-gl-draw";
import { GeoJSON, Position } from "geojson";
import { LngLatLike, Marker } from "mapbox-gl";

interface IState {
  point: DrawFeature;
}

interface IOptions {}

interface IDrawPointMode extends DrawCustomMode {
  drawPointMarker: Marker | null;
}

export const DrawPointMode: IDrawPointMode = {
  drawPointMarker: null,
  onSetup(options: IOptions) {
    // console.log("onSetup", options)
    const marker = new Marker({
      color: "#fff",
      element: document.createElement("div"),
      className: "font-size-large text-shadow",
      anchor: "center",
      offset: [0, 40],
    })
      .setLngLat([0, 0])
      .addTo(this.map as any);

    this.drawPointMarker = marker;

    const point = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: [],
      },
    });

    this.addFeature(point);

    this.clearSelectedFeatures();
    this.updateUIClasses({ mouse: constants.cursors.ADD });

    this.setActionableState({
      trash: true,
      combineFeatures: false,
      uncombineFeatures: false,
    });

    return {
      point,
    };
  },
  onDrag(state: any, e: MapboxDraw.MapMouseEvent): void {},
  onClick(state: IState, e: MapboxDraw.MapMouseEvent): void {
    this.updateUIClasses({ mouse: constants.cursors.MOVE });
    state.point.updateCoordinate("", e.lngLat.lng, e.lngLat.lat);
    this.map.fire(constants.events.CREATE, {
      features: [state.point.toGeoJSON()],
    });
    this.changeMode(constants.modes.SIMPLE_SELECT, {
      featureIds: [state.point.id],
    });
  },
  onMouseMove(state: IState, e: MapboxDraw.MapMouseEvent): void {
    if (this.drawPointMarker) {
      this.drawPointMarker.setLngLat(e.lngLat);
      this.drawPointMarker.getElement().innerHTML = `${e.lngLat.lng},${e.lngLat.lat}`;
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
  onTap(state: any, e: MapboxDraw.MapTouchEvent): void {
    console.log("onTap", e);

    this.updateUIClasses({ mouse: constants.cursors.MOVE });
    state.point.updateCoordinate("", e.lngLat.lng, e.lngLat.lat);
    this.map.fire(constants.events.CREATE, {
      features: [state.point.toGeoJSON()],
    });
    this.changeMode(constants.modes.SIMPLE_SELECT, {
      featureIds: [state.point.id],
    });
  },
  onStop(state: IState): void {
    this.activateUIButton();
    if (!state.point.getCoordinates().length) {
      this.deleteFeature(String(state.point.id), { silent: true });
    }
    this.drawPointMarker?.remove();
  },
  onTrash(state: IState): void {
    this.drawPointMarker?.remove();
    this.deleteFeature(String(state.point.id), { silent: true });
    this.changeMode(constants.modes.SIMPLE_SELECT);
  },
  onCombineFeature(state: any): void {},
  onUncombineFeature(state: any): void {},
  toDisplayFeatures(
    state: any,
    geojson: any,
    display: (geojson: GeoJSON) => void
  ): void {
    // Never render the point we're drawing
    const isActivePoint = geojson.properties.id === state.point.id;
    geojson.properties.active = isActivePoint
      ? constants.activeStates.ACTIVE
      : constants.activeStates.INACTIVE;
    if (!isActivePoint) return display(geojson);
  },
};
