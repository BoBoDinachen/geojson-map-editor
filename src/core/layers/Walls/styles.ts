import { LayerSpecification } from "mapbox-gl";
export const getWallStyles = (): LayerSpecification[] => {
  return [
    {
      id: "wall-outline",
      type: "line",
      source: "walls-source",
      paint: {
        "line-color": "#df2029",
        "line-width": 3,
        "line-opacity": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          1,
          0,
        ],
      },
      layout: {},
    },
    {
      id: "wall-fill",
      type: "fill-extrusion",
      source: "walls-source",
      paint: {
        "fill-extrusion-color": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          "#ff9800",
          ["get", "color"],
        ],
        "fill-extrusion-base": ["get", "base_height"],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-opacity": 1,
      },
      layout: {},
    },
    {
      id: "wall-fill-text",
      type: "symbol",
      source: "walls-source",
      layout: {
        "symbol-placement": "line",
        "text-field": "Wall-{index}",
        "text-size": 16,
        "text-allow-overlap": true,
        "text-optional": true,
      },
      paint: {
        "text-color": "#fff",
        "text-halo-color": "#000",
        "text-halo-width": 1,
      },
    },
  ];
};
