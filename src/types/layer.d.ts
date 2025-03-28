declare interface MapLayer {
  groupId: number;
  properties: any;
  onAdd: (map: mapbox.Map) => void;
  onRemove: (map: mapbox.Map) => void;
  toggleVisible(): void;
}

declare interface FeatureProperties {
  stroke: string;
  "stroke-width": number;
  "stroke-opacity": number;
  fill: string;
  "fill-opacity": number;
  height: number;
  base_height: number;
  color: string;
  [key: string]: any;
}
