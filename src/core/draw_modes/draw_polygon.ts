import { modes, constants } from "@mapbox/mapbox-gl-draw";
import { LngLatLike, Marker } from "mapbox-gl";
import * as turf from "@turf/turf";

function isEventAtCoordinates(event, coordinates) {
  if (!event.lngLat) return false;
  return (
    event.lngLat.lng === coordinates[0] && event.lngLat.lat === coordinates[1]
  );
}

function isVertex(e) {
  const featureTarget = e.featureTarget;
  if (!featureTarget) return false;
  if (!featureTarget.properties) return false;
  return featureTarget.properties.meta === "vertex";
}

export const DrawPolygonMode: {
  markers: Map<number, Marker>;
} & MapboxDraw.DrawCustomMode = {
  ...modes.draw_polygon,
  markers: new Map<number, Marker>(),
  onClick(state: any, e: MapboxDraw.MapMouseEvent) {
    if (
      state.currentVertexPosition > 0 &&
      isEventAtCoordinates(
        e,
        state.polygon.coordinates[0][state.currentVertexPosition - 1]
      )
    ) {
      this.markers.forEach((marker) => {
        marker.remove();
      });
      return this.changeMode("simple_select", {
        featureIds: [state.polygon.id],
      });
    }

    this.updateUIClasses({ mouse: "add" });
    state.polygon.updateCoordinate(
      `0.${state.currentVertexPosition}`,
      e.lngLat.lng,
      e.lngLat.lat
    );
    state.currentVertexPosition++;
    state.polygon.updateCoordinate(
      `0.${state.currentVertexPosition}`,
      e.lngLat.lng,
      e.lngLat.lat
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
    this.markers.set(state.currentVertexPosition, marker);
  },
  onMouseMove(state: any, e: MapboxDraw.MapMouseEvent) {
    if (state.currentVertexPosition >= 1) {
      const start = state.polygon.getCoordinate(
        `0.${state.currentVertexPosition - 1}`
      );
      const end = state.polygon.getCoordinate(
        `0.${state.currentVertexPosition}`
      );

      const distance = turf.distance(start, end, { units: "meters" });
      //@ts-ignore
      const points = turf.points([
        state.polygon.getCoordinate(`0.${state.currentVertexPosition - 1}`),
        state.polygon.getCoordinate(`0.${state.currentVertexPosition}`),
      ]);
      const center = turf.center(points);

      const marker = this.markers.get(state.currentVertexPosition);
      marker!.setLngLat(center.geometry.coordinates as LngLatLike);
      marker!.getElement().innerHTML = `${distance.toFixed(2)}m`;
    }
    state.polygon.updateCoordinate(
      `0.${state.currentVertexPosition}`,
      e.lngLat.lng,
      e.lngLat.lat
    );
    if (isVertex(e)) {
      this.updateUIClasses({ mouse: constants.cursors.POINTER });
    }
  },
};
