import { ref, Ref } from 'vue'
import * as mapbox from 'mapbox-gl'
import { LayerGroup, FeatureType } from '../../enum/Layer'
import { DrawingManager } from '../../manager/DrawManager'
import { CustomLayer } from '../CustomLayer'
import { Feature } from 'geojson'
import { getBlockStyles } from './styles'
import { DrawModeEnum } from '@/core/draw_modes'
import { StorageHandler } from '@/storage-handler'
import { eventbus } from '@/utils/eventbus'
import { EventTypeEnum } from '@/core/enum/Event'
import UndoRedoManager from '@/core/manager/UndoRedoManager'
import { AddFeatureAction } from '@/core/actions'
import editor from '@/core/Editor'

export class BlockLayer extends CustomLayer {
  id: string = 'block-layer'
  public groupId: number = LayerGroup.Block
  public visible: Ref<boolean, boolean> = ref(true)
  private _selectEnabled = false
  private _drawManager = DrawingManager.getInstance<DrawingManager>()
  private _features = ref<Array<Feature>>([])
  private _blocksVisible = ref(true)
  private _feaureProperties = ref<FeatureProperties>({
    height: 3,
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
    const features = this._initFeatures()
    const styles = getBlockStyles()
    this._updateSourceData(features)
    styles.forEach((style) => {
      map.addLayer(style)
    })
    this._addLayerEventListener()
    console.log('block layer add')
  }
  onRemove(map: mapbox.Map) {}
  toggleVisible(): void {}

  drawBlock(drawMode: DrawModeEnum, stopCb: () => void) {
    const onCreate = (feature: Feature) => {
      if (feature.geometry.type !== 'Polygon') {
        return
      }
      const index = this._features.value.length + 1
      feature.id = index
      feature.properties = {
        ...this._feaureProperties.value,
        index,
        type: FeatureType.Block,
        name: `Block-${index}`,
      } as FeatureProperties
      UndoRedoManager.execute(new AddFeatureAction(this, feature))
    }

    const stopDraw = this._drawManager.drawPlane(onCreate, stopCb, {
      deleteAll: true,
      drawMode,
    })

    return stopDraw
  }

  enableEditBlock(featureId: number) {
    const feature = this.getFeatureById(featureId)!
    const drawInstance = editor.getDrawInstance()
    drawInstance?.add(feature)
    //@ts-ignore
    drawInstance?.changeMode('direct_select', {
      featureId,
    })
    this.addMapEventListener('enableEditBlock', {
      type: 'draw.update',
      mode: 'on',
      handler: (e) => {
        const feature = e.features[0]
        const coordinates = feature.geometry.coordinates[0] as Array<[number, number]>
        this.updateFeatureCoordinates(featureId, coordinates)
      },
    })
  }

  stopDraw() {
    const drawInstance = editor.getDrawInstance()
    drawInstance?.deleteAll()
    drawInstance?.trash()
    this.removeMapEventListener('enableEditBlock')
  }

  public updateFeatureCoordinates(featureIndex: number, coordinates: Array<[number, number]>) {
    const index = this._features.value.findIndex((f) => f.properties?.index === featureIndex)
    if (index > -1) {
      //@ts-ignore
      this._features.value[index].geometry.coordinates = [coordinates]
      this._updateSourceData(this._features.value)
    }
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

  public setFeatures(features: Array<Feature>) {
    // filter features
    const filteredFeatures = features.filter((feature) => {
      //@ts-ignore
      return feature.properties.type === FeatureType.Block
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

  public get blocksVisible() {
    return this._blocksVisible.value
  }

  public set blocksVisible(value: boolean) {
    this._blocksVisible.value = value
    getBlockStyles().forEach((layer) => {
      this._map?.setLayoutProperty(layer.id, 'visibility', value ? 'visible' : 'none')
    })
  }

  private _changeSelectedState = (featureId: number | string, isSelected: boolean) => {
    this._map?.setFeatureState({ source: 'block-source', id: featureId }, { selected: isSelected })
  }

  public clearSelectState() {
    const hasSelected = this.getFeatures().some((feature) => {
      const state = this._map?.getFeatureState({
        source: 'block-source',
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
    const features = StorageHandler.getBlockFeatures()
    this._features.value = features
    return features
  }

  private _updateSourceData(features: Array<Feature>) {
    const source = this._map?.getSource('block-source') as mapbox.GeoJSONSource
    StorageHandler.updateBlockFeatures(features)
    if (!source) {
      this._map?.addSource('block-source', {
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
      if (options && options.exclude?.includes('blocks')) return
      this.disableSelect()
      this.clearSelectState()
    })
    eventbus.addListener(EventTypeEnum.EnableLayerSelect, (options?: { include: string[] }) => {
      if (options && !options.include?.includes('blocks')) return
      this.enableSelect()
    })
    eventbus.addListener(EventTypeEnum.ClearLayerSelectedState, () => {
      this.clearSelectState()
    })

    const isBlockFeature = (feature: any) => {
      return feature.properties!['type'] == FeatureType.Block
    }

    const changeHoverState = (featureId: number, isHover: boolean) => {
      this._map?.setFeatureState({ source: 'block-source', id: featureId }, { hover: isHover })
    }

    this._map?.on('click', [`block-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
      // 获取点击位置的特征信息
      if (!e.features) return
      const feature = e.features[0]
      eventbus.emit(EventTypeEnum.ClearLayerSelectedState)
      if (isBlockFeature(feature)) {
        console.log('block feature clicked', feature)
        eventbus.emit(EventTypeEnum.SELECT_FEATURE, { feature })
        this._selectedFeatureId = feature.id!
        this._changeSelectedState(feature.id!, true)
      } else {
      }
    })
    this._map?.on('contextmenu', [`block-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
      if (this._selectedFeatureId && this._selectedFeatureId !== this._hoveredFeatureId) {
        return
      }
      eventbus.emit(EventTypeEnum.OpenContextMenu, {
        pos: e.point,
        data: {
          type: FeatureType.Block,
          feature: this.getFeatureById(this._hoveredFeatureId),
          featureId: this._hoveredFeatureId,
        },
      })
    })
    this._map?.on('mousemove', [`block-fill`], (e) => {
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
    this._map?.on('mouseenter', [`block-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
    })
    this._map?.on('mouseleave', [`block-fill`], (e) => {
      if (e.defaultPrevented) return
      if (!this._selectEnabled) return
      if (this._hoveredFeatureId !== null) {
        this._map!.getCanvas().style.cursor = ''
        changeHoverState(this._hoveredFeatureId, false)
      }
      this._hoveredFeatureId = null
      this._map?.dragRotate.enable()
    })
  }
}
