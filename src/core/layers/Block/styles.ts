import { LayerSpecification } from "mapbox-gl";
export const getBlockStyles = (): LayerSpecification[] => {
  return [
    {
      id: "block-outline",
      type: "line",
      source: "block-source",
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
      id: "block-fill",
      type: "fill-extrusion",
      source: "block-source",
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
      id: "block-fill-text",
      type: "symbol",
      source: "block-source",
      layout: {
        "text-field": "Block-{index}",
        "text-size": 16,
      },
      paint: {
        "text-color": "#fff",
        "text-halo-color": "#000",
        "text-halo-width": 1,
      },
    },
  ];
};
