import { reactive, ref, Ref } from "vue";
import * as mapbox from "mapbox-gl";
import { LayerGroup, FeatureType } from "../../enum/Layer";
import { DrawingManager } from "../../manager/DrawManager";
import { CustomLayer } from "../CustomLayer";
import { Feature } from "geojson";
import { getGroundStyles } from "./styles";
import { DrawModeEnum } from "@/core/draw_modes";
import { StorageHandler } from "@/storage-handler";

export class GroundLayer extends CustomLayer {
  id: string = "ground-layer";
  public groupId: number = LayerGroup.Ground;
  public visible: Ref<boolean, boolean> = ref(true);
  private _drawManager = DrawingManager.getInstance<DrawingManager>();
  private _features = ref<Array<Feature>>([]);
  private _groundsVisible = ref(true);
  private _feaureProperties = ref<FeatureProperties>({
    stroke: "#000000",
    "stroke-width": 1,
    "stroke-opacity": 1,
    fill: "#64e2b7",
    "fill-opacity": 1,
    height: 0.05,
    base_height: 0,
    color: "#232221",
  });

  constructor(params: any) {
    super(params);
  }
  onAdd(map: mapbox.Map) {
    this._map = map;
    const features = this._initFeatures();
    const styles = getGroundStyles();
    this._updateSourceData(features);
    styles.forEach((style) => {
      map.addLayer(style);
    });
    console.log("ground layer add");
  }
  onRemove(map: mapbox.Map) {}
  toggleVisible(): void {}

  drawGround(drawMode: DrawModeEnum, stopCb: () => void) {
    const onCreate = (feature: Feature) => {
      console.log(feature);
      feature.id = this._features.value.length + 1;
      feature.properties = {
        ...this._feaureProperties.value,
        index: this._features.value.length + 1,
        type: FeatureType.Ground,
      } as FeatureProperties;
      this._features.value.push(feature);
      this._updateSourceData(this._features.value);
    };

    const stopDraw = this._drawManager.drawPlane(onCreate, stopCb, {
      deleteAll: true,
      drawMode,
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

  public removeFeatureById(featureId: number) {
    const index = this._features.value.findIndex((f) => f.id === featureId);
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

  public setFeatures(features: Array<Feature>) {
    // filter features
    const filteredFeatures = features.filter((feature) => {
      //@ts-ignore
      return feature.properties.type === FeatureType.Ground;
    });
    this._features.value = filteredFeatures;
    this._updateSourceData(filteredFeatures);
  }

  public get groundsVisible() {
    return this._groundsVisible.value;
  }

  public set groundsVisible(value: boolean) {
    this._groundsVisible.value = value;
    getGroundStyles().forEach((layer) => {
      this._map?.setLayoutProperty(
        layer.id,
        "visibility",
        value ? "visible" : "none"
      );
    });
  }

  private _initFeatures() {
    const features = StorageHandler.getGroundFeatures();
    this._features.value = features;
    return features;
  }

  private _updateSourceData(features: Array<Feature>) {
    const source = this._map?.getSource(
      "ground-source"
    ) as mapbox.GeoJSONSource;
    StorageHandler.updateGroundFeatures(features);
    if (!source) {
      this._map?.addSource("ground-source", {
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
