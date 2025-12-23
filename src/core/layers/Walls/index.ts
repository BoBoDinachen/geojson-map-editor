import { ref, Ref, toRaw } from 'vue'
import * as mapbox from 'mapbox-gl'
import { LayerGroup, FeatureType } from '../../enum/Layer'
import { DrawingManager } from '../../manager/DrawManager'
import { CustomLayer } from '../CustomLayer'
import { Feature } from 'geojson'
import { getWallStyles } from './styles'
import { StorageHandler } from '@/storage-handler'
import { groundLayer, blockLayer } from '@/stores/LayersStore'
import { generatePolygonFromPolyline } from '@/utils/geometry'
import { eventbus } from '@/utils/eventbus'
import { EventTypeEnum } from '@/core/enum/Event'
import UndoRedoManager from '@/core/manager/UndoRedoManager'
import { AddFeatureAction } from '@/core/actions'

export class WallsLayer extends CustomLayer {
  id: string = 'walls-layer'
  public groupId: number = LayerGroup.Wall
  public visible: Ref<boolean, boolean> = ref(true)
  private _drawManager = DrawingManager.getInstance<DrawingManager>()
  private _selectEnabled = false
  private _features = ref<Array<Feature>>([])
  private _opacity = ref(1)
  private _wallsVisible = ref(true)
  private _feaureProperties = ref<FeatureProperties>({
    height: 3.2,
    base_height: 0,
    color: '#606060',
  })

  private _selectedFeatureId: any = null
  private _hoveredFeatureId: any = null

  constructor(params: any) {
    super(params)
  }
  onAdd(map: mapbox.Map) {
    this._map = map
    const styles = getWallStyles()
    const features = this._initFeatures()
    this._updateSourceData(features)
    styles.forEach((style) => {
      map.addLayer(style)
    })
    this._addLayerEventListener()
    console.log('walls layer add')
  }
  onRemove(map: mapbox.Map) {}
  toggleVisible(): void {}

  drawWall(
    options: { enableSnap: boolean; snapThreshold: number; width: number },
    stopCb: () => void
  ) {
    const onCreate = (lineFeature: Feature) => {
      if (lineFeature.geometry.type !== 'LineString') {
        return
      }
      const { polygon } = generatePolygonFromPolyline(
        //@ts-ignore
        lineFeature.geometry.coordinates,
        options.width
      )
      const polygonFeature: Feature = {
        id: this._features.value.length + 1,
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygon],
        },
        properties: {
          ...this._feaureProperties.value,
          index: this._features.value.length + 1,
          type: FeatureType.Wall,
          //@ts-ignore
          lineString: lineFeature.geometry.coordinates,
          width: options.width,
        } as FeatureProperties,
      } as Feature
      UndoRedoManager.execute(new AddFeatureAction(this, polygonFeature))
    }
    const snapBounds: Array<number[][]> = []
    this.getFeatures().forEach((feature) => {
      //@ts-ignore
      snapBounds.push(toRaw(feature.geometry.coordinates[0]))
    })
    groundLayer.value?.getFeatures().forEach((feature) => {
      //@ts-ignore
      snapBounds.push(toRaw(feature.geometry.coordinates[0]))
    })
    blockLayer.value?.getFeatures().forEach((feature) => {
      //@ts-ignore
      snapBounds.push(toRaw(feature.geometry.coordinates[0]))
    })
    console.log('snapBounds:', snapBounds)
    // 过滤掉
    const stopDraw = this._drawManager.drawSnapLine(onCreate, stopCb, {
      deleteAll: true,
      enableSnap: options.enableSnap,
      snapThreshold: options.snapThreshold,
      bounds: snapBounds.filter((item) => Array.isArray(item)),
    })

    return stopDraw
  }

  public getFeatureById(featureId: number) {
    return this._features.value.find((f) => f.id === featureId)
  }

  public getFeatures() {
    return this._features.value
  }

  public getFeatureProperties() {
    return this._feaureProperties.value
  }

  public addFeature(feature: Feature) {
    this._features.value.push(feature)
    this._features.value.forEach((feature, index) => {
      feature.properties!.index = index + 1
      feature.id = index + 1
    })
    this._updateSourceData(this._features.value)
  }

  public removeFeature(featureIndex: number) {
    const index = this._features.value.findIndex((f) => f.properties?.index === featureIndex)
    if (index > -1) {
      this._features.value.splice(index, 1)
      this._features.value.forEach((feature, index) => {
        feature.properties!.index = index + 1
        feature.id = index + 1
      })
      this._updateSourceData(this._features.value)
    }
  }

  public removeFeatureById(featureId: number) {
    const index = this._features.value.findIndex((f) => f.id === featureId)
    if (index > -1) {
      this._features.value.splice(index, 1)
      this._features.value.forEach((feature, index) => {
        feature.properties!.index = index + 1
        feature.id = index + 1
      })
      this._updateSourceData(this._features.value)
    }
  }

  public removeAllFeatures() {
    this._features.value = []
    this._updateSourceData(this._features.value)
  }

  public updateFeature(featureIndex: number, properties: Partial<FeatureProperties>) {
    const index = this._features.value.findIndex((f) => f.properties?.index === featureIndex)
    if (index > -1) {
      this._features.value[index].properties = Object.assign(
        this._features.value[index].properties!,
        properties
      ) as FeatureProperties
      this._updateSourceData(this._features.value)
    }
  }

  public updateWallWidth(featureIndex: number, width: number) {
    const index = this._features.value.findIndex((f) => f.properties?.index === featureIndex)
    const line = this._features.value[index].properties?.lineString
    const { polygon } = generatePolygonFromPolyline(line, width)
    //@ts-ignore
    this._features.value[index].geometry.coordinates = [polygon]
    this._features.value[index].properties!.width = width
    this._updateSourceData(this._features.value)
  }

  public changeWallsOpacity(opacity: number) {
    this._opacity.value = opacity
    this._map?.setPaintProperty('wall-fill', 'fill-extrusion-opacity', opacity)
  }

  public getOpacity() {
    return this._opacity.value
  }

  public setFeatures(features: Array<Feature>) {
    // filter features
    const filteredFeatures = features.filter((feature) => {
      //@ts-ignore
      return feature.properties.type === FeatureType.Wall
    })
    this._features.value = filteredFeatures
    this._updateSourceData(filteredFeatures)
  }

  public disableSelect() {
    this._selectEnabled = false
  }

  public enableSelect() {
    this._selectEnabled = true
  }

  public get wallsVisible() {
    return this._wallsVisible.value
  }

  public set wallsVisible(value: boolean) {
    this._wallsVisible.value = value
    getWallStyles().forEach((layer) => {
      this._map?.setLayoutProperty(layer.id, 'visibility', value ? 'visible' : 'none')
    })
  }

  private _changeSelectedState = (featureId: number | string, isSelected: boolean) => {
    this._map?.setFeatureState({ source: 'walls-source', id: featureId }, { selected: isSelected })
  }

  public clearSelectState() {
    const hasSelected = this.getFeatures().some((feature) => {
      const state = this._map?.getFeatureState({
        source: 'walls-source',
        id: feature.id!,
      })
      return state?.selected ?? false
    })
    if (hasSelected) {
      this._selectedFeatureId = null
      this.getFeatures().forEach((feature) => {
        this._changeSelectedState(feature.id!, false)
      })
      eventbus.emit(EventTypeEnum.SELECT_FEATURE, { feature: null })
    }
  }

  private _initFeatures() {
    const features = StorageHandler.getWallFeatures()
    this._features.value = features
    return features
  }

  private _updateSourceData(features: Array<Feature>) {
    const source = this._map?.getSource('walls-source') as mapbox.GeoJSONSource
    StorageHandler.updateWallFeatures(features)
    if (!source) {
      this._map?.addSource('walls-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: features,
        },
      })
      return
    }
    source.setData({
      type: 'FeatureCollection',
      features: features,
    })
  }

  private _addLayerEventListener() {
    eventbus.addListener(EventTypeEnum.DisableLayerSelect, (options?: { exclude: string[] }) => {
      if (options && options.exclude?.includes('walls')) return
      this.disableSelect()
      this.clearSelectState()
    })
    eventbus.addListener(EventTypeEnum.EnableLayerSelect, (options?: { include: string[] }) => {
      if (options && !options.include?.includes('walls')) return
      this.enableSelect()
    })
    eventbus.addListener(EventTypeEnum.ClearLayerSelectedState, () => {
      this.clearSelectState()
    })

    const isBlockFeature = (feature: any) => {
      return feature.properties!['type'] == FeatureType.Wall
    }

    const changeHoverState = (featureId: number | string, isHover: boolean) => {
      this._map?.setFeatureState({ source: 'walls-source', id: featureId }, { hover: isHover })
    }

    this._map?.on('click', [`wall-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
      // 获取点击位置的特征信息
      if (!e.features) return
      const feature = e.features[0]
      eventbus.emit(EventTypeEnum.ClearLayerSelectedState)
      if (isBlockFeature(feature)) {
        console.log('wall feature clicked', feature)
        eventbus.emit(EventTypeEnum.SELECT_FEATURE, { feature })
        this._selectedFeatureId = feature.id!
        this._changeSelectedState(feature.id!, true)
      } else {
      }
    })

    this._map?.on('contextmenu', [`wall-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
      if (this._selectedFeatureId && this._selectedFeatureId !== this._hoveredFeatureId) {
        return
      }
      eventbus.emit(EventTypeEnum.OpenContextMenu, {
        pos: e.point,
        data: {
          type: FeatureType.Wall,
          feature: this.getFeatureById(this._hoveredFeatureId),
          featureId: this._hoveredFeatureId,
        },
      })
    })

    this._map?.on('mousemove', [`wall-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
      if (e.features!.length > 0) {
        this._map!.getCanvas().style.cursor = 'pointer'
        this._map?.dragRotate.disable()
        const feature = e.features![0]
        if (this._hoveredFeatureId !== null) {
          if (isBlockFeature(feature)) {
            changeHoverState(this._hoveredFeatureId, false)
          }
        }
        this._hoveredFeatureId = feature.id!
        if (isBlockFeature(feature)) {
          changeHoverState(this._hoveredFeatureId, true)
        }
      }
    })
    this._map?.on('mouseenter', [`wall-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
    })
    this._map?.on('mouseleave', [`wall-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
      if (this._hoveredFeatureId !== null) {
        this._map!.getCanvas().style.cursor = ''
        this._map?.dragRotate.enable()
        changeHoverState(this._hoveredFeatureId, false)
      }
      this._hoveredFeatureId = null
    })
  }
}
