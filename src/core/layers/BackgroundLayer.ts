import * as mapbox from "mapbox-gl";
import { reactive } from "vue";
import { LayerGroup } from "../enum/Layer";
import { CustomLayer } from "./CustomLayer";
export class BackgroundLayer extends CustomLayer {
  public groupId: number = LayerGroup.Background;
  public properties = reactive({
    visible: true,
    baseMapUrl: "mapbox://styles/mapbox/dark-v11",
    token:
      "pk.eyJ1Ijoia2FuZ2JvNDkyNiIsImEiOiJjbHA5OGd1ZWEyOXA3MmtzMTZjeXlsYzkzIn0._hOucYQXZaXSzkcSO63SOA",
  });
  public onAdd(map: mapbox.Map) {
    this._map = map;
  }
  public onRemove() {}

  public changeStyle(style: string) {
    this._map?.setStyle(style);
  }

  public toggleVisible() {
    this.properties.visible = !this.properties.visible;
    const layers = this._map?.getStyle()?.layers;
    layers?.forEach((layer) => {
      if (layer.source === "composite") {
        this._map?.setLayoutProperty(
          layer.id,
          "visibility",
          this.properties.visible ? "visible" : "none"
        );
      }
    });
    console.log("map style:", this._map?.getStyle());
  }

  /**
   * 向地图中添加一个栅格瓦片图层
   * @param map
   * @param url 瓦片url
   * @param sourceId 数据源id，保证唯一性即可
   * @param layerId 图层id，保证唯一性即可
   */
  private _addRasterTileLayer(
    map: mapbox.Map,
    url: string,
    sourceId: string,
    layerId: string
  ) {
    map.addSource(sourceId, {
      type: "raster",
      tiles: [url],
      tileSize: 256,
    });
    map.addLayer({
      id: layerId,
      type: "raster",
      source: sourceId,
    });
  }

  public get visible() {
    return this.properties.visible;
  }

  public addFeature() {}
  public removeFeature() {}
  public getFeature() {}
  public updateFeature() {}
  public getFeatures() {}
}
