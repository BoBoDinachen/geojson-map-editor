// custom mapbopx-gl-draw mode that extends draw_line_string
// shows a center point, radius line, and circle polygon while drawing
// forces draw.create on creation of second vertex
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import { LngLatLike, Marker } from "mapbox-gl";
import { DrawModeEnum } from ".";

function circleFromTwoVertexLineString(geojson) {
  const center = geojson.geometry.coordinates[0];
  const radiusInKm = turf.length(geojson);

  return turf.circle(center, radiusInKm);
}

type CircleMode = {
  radiusMarker: Marker | null;
} & MapboxDraw.DrawCustomMode;

export const CircleMode: CircleMode = {
  ...MapboxDraw.modes.draw_line_string,
  radiusMarker: null,
  onClick(state, e) {
    if (e.originalEvent.button === 2) {
      state.currentVertexPosition = 0;
      this.radiusMarker?.remove()
      this.deleteFeature(state.line.id);
      //@ts-ignore
      this.changeMode(DrawModeEnum.CIRCLE_MODE);
      return;
    }
    // this ends the drawing after the user creates a second point, triggering this.onStop
    if (state.currentVertexPosition === 1) {
      state.line.addCoordinate(0, e.lngLat.lng, e.lngLat.lat);
      this.radiusMarker?.remove();
      return this.changeMode("simple_select", { silent: true });
    }

    state.line.updateCoordinate(
      state.currentVertexPosition,
      e.lngLat.lng,
      e.lngLat.lat
    );
    if (state.direction === "forward") {
      state.currentVertexPosition += 1;
      state.line.updateCoordinate(
        state.currentVertexPosition,
        e.lngLat.lng,
        e.lngLat.lat
      );
    } else {
      state.line.addCoordinate(0, e.lngLat.lng, e.lngLat.lat);
    }

    const marker = new Marker({
      color: "#fff",
      element: document.createElement("div"),
      className: "text-shadow font-size-large",
      anchor: "center",
      offset: [0, 0],
    })
      .setLngLat(e.lngLat)
      .addTo(this.map as any);
    this.radiusMarker = marker;
    return null;
  },
  onMouseMove: function (state, e) {
    MapboxDraw.modes.draw_line_string.onMouseMove?.call(this, state, e);

    if (this.radiusMarker) {
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
      this.radiusMarker.setLngLat(center.geometry.coordinates as LngLatLike);
      this.radiusMarker.getElement().innerHTML = `${distance.toFixed(2)}m`;
    }
  },
  //   clickAnywhere: function (state, e) {},
  onStop: function (state) {
    this.activateUIButton();

    // check to see if we've deleted this feature
    if (this.getFeature(state.line.id) === undefined) return;

    // remove last added coordinate
    state.line.removeCoordinate("0");
    if (state.line.isValid()) {
      const lineGeoJson = state.line.toGeoJSON();
      const circleFeature = circleFromTwoVertexLineString(lineGeoJson);

      this.map.fire("draw.create", {
        features: [circleFeature],
      });
    } else {
      this.deleteFeature(state.line.id, { silent: true });
      this.changeMode("simple_select", {}, { silent: true });
    }
  },

  toDisplayFeatures: function (state, geojson: any, display) {
    // Only render the line if it has at least one real coordinate
    if (geojson.geometry.coordinates.length < 2) return null;

    display({
      type: "Feature",
      properties: {
        active: "true",
      },
      geometry: {
        type: "Point",
        coordinates: geojson.geometry.coordinates[0],
      },
    });

    // displays the line as it is drawn
    geojson.properties.active = "true";
    display(geojson);

    // const displayMeasurements = getDisplayMeasurements(geojson)

    // create custom feature for the current pointer position
    const currentVertex: GeoJSON.Feature = {
      type: "Feature",
      properties: {
        meta: "currentPosition",
        radius: `432432432`,
        parent: state.line.id,
      },
      geometry: {
        type: "Point",
        coordinates: geojson.geometry.coordinates[1],
      },
    };

    display(currentVertex);

    const circleFeature = circleFromTwoVertexLineString(geojson);
    circleFeature.id = "";
    circleFeature.properties = {
      active: "true",
    };
    display(circleFeature);

    return null;
  },
};
