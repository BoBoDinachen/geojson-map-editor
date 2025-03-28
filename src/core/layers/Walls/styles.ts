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
        "line-opacity": 1,
      },
      layout: {},
    },
    {
      id: "wall-fill",
      type: "fill-extrusion",
      source: "walls-source",
      paint: {
        "fill-extrusion-color": ["get", "color"],
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
        "symbol-placement":'line',
        "text-field": "Wall-{index}",
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
