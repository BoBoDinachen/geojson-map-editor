import { reactive, ref, Ref } from "vue";
import * as mapbox from "mapbox-gl";
import { LayerGroup, FeatureType } from "../../enum/Layer";
import { DrawingManager } from "../../manager/DrawManager";
import { CustomLayer } from "../CustomLayer";
import { Feature } from "geojson";
import { getBlockStyles } from "./styles";
import { DrawModeEnum } from "@/core/draw_modes";
import { StorageHandler } from "@/storage-handler";
import { eventbus } from "@/utils/eventbus";
import { EventTypeEnum } from "@/core/enum/Event";

export class BlockLayer extends CustomLayer {
  id: string = "block-layer";
  public groupId: number = LayerGroup.Block;
  public visible: Ref<boolean, boolean> = ref(true);
  private _selectEnabled = false;
  private _drawManager = DrawingManager.getInstance<DrawingManager>();
  private _features = ref<Array<Feature>>([]);
  private _blocksVisible = ref(true);
  private _feaureProperties = ref<FeatureProperties>({
    stroke: "#000000",
    "stroke-width": 1,
    "stroke-opacity": 1,
    fill: "#64e2b7",
    "fill-opacity": 1,
    height: 5,
    base_height: 0,
    color: "#606060",
  });

  constructor(params: any) {
    super(params);
  }
  onAdd(map: mapbox.Map) {
    this._map = map;
    const features = this._initFeatures();
    const styles = getBlockStyles();
    this._updateSourceData(features);
    styles.forEach((style) => {
      map.addLayer(style);
    });
    this._addLayerEventListener();
    console.log("block layer add");
  }
  onRemove(map: mapbox.Map) {}
  toggleVisible(): void {}

  drawBlock(drawMode: DrawModeEnum, stopCb: () => void) {
    const onCreate = (feature: Feature) => {
      console.log(feature);
      feature.id = this._features.value.length + 1;
      feature.properties = {
        ...this._feaureProperties.value,
        index: this._features.value.length + 1,
        type: FeatureType.Block,
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
      return feature.properties.type === FeatureType.Block;
    });
    this._features.value = filteredFeatures;
    this._updateSourceData(filteredFeatures);
  }

  public disableSelect() {
    this._selectEnabled = false;
  }

  public enableSelect() {
    this._selectEnabled = true;
  }

  public get blocksVisible() {
    return this._blocksVisible.value;
  }

  public set blocksVisible(value: boolean) {
    this._blocksVisible.value = value;
    getBlockStyles().forEach((layer) => {
      this._map?.setLayoutProperty(
        layer.id,
        "visibility",
        value ? "visible" : "none"
      );
    });
  }

  private _initFeatures() {
    const features = StorageHandler.getBlockFeatures();
    this._features.value = features;
    return features;
  }

  private _updateSourceData(features: Array<Feature>) {
    const source = this._map?.getSource("block-source") as mapbox.GeoJSONSource;
    StorageHandler.updateBlockFeatures(features);
    if (!source) {
      this._map?.addSource("block-source", {
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

  private _addLayerEventListener() {
    eventbus.addListener(
      EventTypeEnum.DisableLayerSelect,
      (options?: { exclude: string[] }) => {
        if (options && options.exclude?.includes("blocks")) return;
        this.disableSelect();
        eventbus.emit(EventTypeEnum.SELECT_FEATURE, { feature: null });
        this.getFeatures().forEach((feature) => {
          changeSelectedState(feature.id!, false);
        });
      }
    );
    eventbus.addListener(
      EventTypeEnum.EnableLayerSelect,
      (options?: { include: string[] }) => {
        if (options && !options.include?.includes("blocks")) return;
        this.enableSelect();
      }
    );
    eventbus.addListener(EventTypeEnum.ClearLayerSelectedState, () => {
      this.getFeatures().forEach((feature) => {
        changeSelectedState(feature.id!, false);
      });
    });

    let hoveredFeatureId: any = null;

    const isBlockFeature = (feature: any) => {
      return feature.properties!["type"] == FeatureType.Block;
    };

    const changeHoverState = (featureId: number, isHover: boolean) => {
      this._map?.setFeatureState(
        { source: "block-source", id: featureId },
        { hover: isHover }
      );
    };

    const changeSelectedState = (
      featureId: number | string,
      isSelected: boolean
    ) => {
      this._map?.setFeatureState(
        { source: "block-source", id: featureId },
        { selected: isSelected }
      );
    };

    this._map?.on("click", [`block-fill`], (e) => {
      if (e.defaultPrevented) return;
      if (!this._selectEnabled) return;
      // 获取点击位置的特征信息
      if (!e.features) return;
      const feature = e.features[0];
      eventbus.emit(EventTypeEnum.ClearLayerSelectedState);
      if (isBlockFeature(feature)) {
        console.log("block feature clicked", feature);
        eventbus.emit(EventTypeEnum.SELECT_FEATURE, { feature });
        changeSelectedState(feature.id!, true);
      } else {
      }
    });
    this._map?.on("contextmenu", [`block-fill`], (e) => {
      if (e.defaultPrevented) return;
      if (!this._selectEnabled) return;
      eventbus.emit(EventTypeEnum.OpenContextMenu, {
        pos: e.point,
        data: {
          type: FeatureType.Block,
          featureId: hoveredFeatureId,
        },
      });
    });
    this._map?.on("mousemove", [`block-fill`], (e) => {
      if (e.defaultPrevented) return;
      if (!this._selectEnabled) return;
      if (e.features!.length > 0) {
        this._map!.getCanvas().style.cursor = "pointer";
        this._map?.dragRotate.disable();
        const feature = e.features![0];
        if (hoveredFeatureId !== null) {
          if (isBlockFeature(feature)) {
            changeHoverState(hoveredFeatureId, false);
          }
        }
        hoveredFeatureId = feature.id!;
        if (isBlockFeature(feature)) {
          changeHoverState(hoveredFeatureId, true);
        }
      }
    });
    this._map?.on("mouseenter", [`block-fill`], (e) => {
      if (e.defaultPrevented) return;
      if (!this._selectEnabled) return;
    });
    this._map?.on("mouseleave", [`block-fill`], (e) => {
      if (e.defaultPrevented) return;
      if (!this._selectEnabled) return;
      if (hoveredFeatureId !== null) {
        this._map!.getCanvas().style.cursor = "";
        changeHoverState(hoveredFeatureId, false);
      }
      hoveredFeatureId = null;
      this._map?.dragRotate.enable();
    });
  }
}
