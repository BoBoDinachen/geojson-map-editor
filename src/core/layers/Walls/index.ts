import { reactive, ref, Ref } from "vue";
import * as mapbox from "mapbox-gl";
import { LayerGroup, LayerType } from "../../enum/Layer";
import { DrawingManager } from "../../manager/DrawManager";
import { CustomLayer } from "../CustomLayer";
import { Feature } from "geojson";
import { getWallStyles } from "./styles";
import { DrawModeEnum } from "@/core/draw_modes";
import { StorageHandler } from "@/storage-handler";
import { groundLayer } from "@/stores/LayersStore";
import { generatePolygonFromPolyline } from "@/utils/geometry";

export class WallsLayer extends CustomLayer {
  id: string = "walls-layer";
  public groupId: number = LayerGroup.Wall;
  public visible: Ref<boolean, boolean> = ref(true);
  private _drawManager = DrawingManager.getInstance<DrawingManager>();

  private _features = ref<Array<Feature>>([]);
  private _opacity = ref(1);
  private _feaureProperties = ref<FeatureProperties>({
    stroke: "#000000",
    "stroke-width": 1,
    "stroke-opacity": 1,
    fill: "#64e2b7",
    "fill-opacity": 1,
    height: 8,
    base_height: 0,
    color: "#606060",
  });

  constructor(params: any) {
    super(params);
  }
  onAdd(map: mapbox.Map) {
    this._map = map;
    const styles = getWallStyles();
    const features = this._initFeatures();
    this._updateSourceData(features);
    styles.forEach((style) => {
      map.addLayer(style);
    });
    console.log("walls layer add", map);
  }
  onRemove(map: mapbox.Map) {}
  toggleVisible(): void {}

  drawWall(
    options: { enableSnap: boolean; snapThreshold: number; width: number },
    stopCb: () => void
  ) {
    const onCreate = (lineFeature: Feature) => {
      console.log(lineFeature);
      const { polygon } = generatePolygonFromPolyline(
        //@ts-ignore
        lineFeature.geometry.coordinates,
        options.width
      );
      const polygonFeature: Feature = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [polygon],
        },
        properties: {
          ...this._feaureProperties.value,
          index: this._features.value.length + 1,
          type: LayerType.Wall,
          //@ts-ignore
          lineString: lineFeature.geometry.coordinates,
          width: options.width,
        } as FeatureProperties,
      } as Feature;
      console.log("generatePolygonFromPolyline:", polygonFeature);
      this._features.value.push(polygonFeature);
      this._updateSourceData(this._features.value);
    };
    const snapBounds =
      groundLayer.value?.getFeatures().map((feature) => {
        //@ts-ignore
        return feature.geometry.coordinates[0];
      }) || [];
    this.getFeatures().forEach((feature) => {
      //@ts-ignore
      snapBounds.push(feature.geometry.coordinates[0]);
    });
    const stopDraw = this._drawManager.drawSnapLine(onCreate, stopCb, {
      deleteAll: true,
      enableSnap: options.enableSnap,
      snapThreshold: options.snapThreshold,
      bounds: snapBounds,
    });

    return stopDraw;
  }

  public getFeatures() {
    return this._features.value;
  }

  public getFeatureProperties() {
    return this._feaureProperties.value;
  }

  public removeFeature(featureIndex: number) {
    const index = this._features.value.findIndex(
      (f) => f.properties?.index === featureIndex
    );
    if (index > -1) {
      this._features.value.splice(index, 1);
      this._features.value.forEach((feature, index) => {
        feature.properties!.index = index + 1;
      });
      this._updateSourceData(this._features.value);
    }
  }

  public removeAllFeatures() {
    this._features.value = [];
    this._updateSourceData(this._features.value);
  }

  public updateFeature(
    featureIndex: number,
    properties: Partial<FeatureProperties>
  ) {
    const index = this._features.value.findIndex(
      (f) => f.properties?.index === featureIndex
    );
    if (index > -1) {
      this._features.value[index].properties = Object.assign(
        this._features.value[index].properties!,
        properties
      ) as FeatureProperties;
      this._updateSourceData(this._features.value);
    }
  }

  public updateWallWidth(featureIndex: number, width: number) {
    const index = this._features.value.findIndex(
      (f) => f.properties?.index === featureIndex
    );
    const line = this._features.value[index].properties?.lineString;
    const { polygon } = generatePolygonFromPolyline(line, width);
    //@ts-ignore
    this._features.value[index].geometry.coordinates = [polygon];
    this._features.value[index].properties!.width = width;
    this._updateSourceData(this._features.value);
  }

  public changeWallsOpacity(opacity: number) {
    this._opacity.value = opacity;
    this._map?.setPaintProperty("wall-fill", "fill-extrusion-opacity", opacity);
  }

  public getOpacity() {
    return this._opacity.value;
  }

  public setFeatures(features: Array<Feature>) {
    // filter features
    const filteredFeatures = features.filter((feature) => {
      //@ts-ignore
      return feature.properties.type === LayerType.Wall;
    });
    this._features.value = filteredFeatures;
    this._updateSourceData(filteredFeatures);
  }

  private _initFeatures() {
    const features = StorageHandler.getWallFeatures();
    this._features.value = features;
    return features;
  }

  private _updateSourceData(features: Array<Feature>) {
    const source = this._map?.getSource("walls-source") as mapbox.GeoJSONSource;
    StorageHandler.updateWallFeatures(features);
    if (!source) {
      this._map?.addSource("walls-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features,
        },
      });
      return;
    }
    source.setData({
      type: "FeatureCollection",
      features: features,
    });
  }
}
