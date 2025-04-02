declare interface MapLayer {
  groupId: number;
  properties: any;
  onAdd: (map: mapbox.Map) => void;
  onRemove: (map: mapbox.Map) => void;
  toggleVisible(): void;
}

declare interface FeatureProperties {
  height: number;
  base_height: number;
  color: string;
  [key: string]: any;
}
