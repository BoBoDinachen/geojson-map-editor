import { LayerSpecification } from 'mapbox-gl'
export const getGroundStyles = (): LayerSpecification[] => {
  return [
    // {
    //   id: "ground-outline",
    //   type: "line",
    //   source: "ground-source",
    //   paint: {
    //     "line-color": "#df2029",
    //     "line-width": 3,
    //     "line-opacity": 1,
    //   },
    //   layout: {},
    // },
    {
      id: 'ground-fill',
      type: 'fill-extrusion',
      source: 'ground-source',
      paint: {
        'fill-extrusion-color': ['get', 'color'],
        'fill-extrusion-base': ['get', 'base_height'],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-opacity': 1,
      },
      layout: {
        // "fill-sort-key": ["get", "index"],
      },
    },
    {
      id: 'ground-fill-text',
      type: 'symbol',
      source: 'ground-source',
      layout: {
        'text-field': 'Ground-{index}',
        'text-size': 16,
      },
      paint: {
        'text-color': '#fff',
        'text-halo-color': '#000',
        'text-halo-width': 1,
      },
    },
  ]
}
