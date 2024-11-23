import { Singleton } from "@/utils/Singleton";
import * as mapbox from "mapbox-gl";
import { LayerGroup } from "../enum/Group";
import { MapLayer } from "@/types/layer";

export class LayerManager extends Singleton {
  private _layers: Map<number, MapLayer> = new Map();
  private _map: mapbox.Map | null = null;

  public init(map: mapbox.Map) {
    this._map = map;
  }
  public addLayer(layer: MapLayer) {
    if (this._layers.has(layer.groupId)) {
      return;
    }
    this._layers.set(layer.groupId, layer);
    layer.onAdd(this._map);
    return this;
  }

  public removeLayer(groupId: LayerGroup): void {
    if (!this._layers.has(groupId)) {
      return;
    }
    const layer = this._layers.get(groupId)!;
    layer?.onRemove(this._map);
    this._layers.delete(groupId);
  }

  public getLayer<T>(groupId: number): T {
    return this._layers.get(groupId) as T;
  }

  public getLayers(): Array<MapLayer> {
    return Array.from(this._layers.values());
  }
}

const layerManager = LayerManager.getInstance<LayerManager>(); // init singleton

export default layerManager;
