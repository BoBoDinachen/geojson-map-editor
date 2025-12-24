import mapboxgl, { LngLatBoundsLike, LngLatLike, MapOptions } from 'mapbox-gl'
import { Utils } from '@/utils/index'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import * as THREE from 'three'
import editor from './Editor'
import { ControlKeyEnum, CoordDisplayControl, ViewModeControl } from './controls/index'
import { StorageHandler } from '@/storage-handler'
import * as turf from '@turf/turf'
import { backgroundLayer, groundLayer, wallsLayer, blockLayer } from '@/stores/LayersStore'
import { GroundLayer, WallsLayer, BackgroundLayer, BlockLayer } from './layers/index'
import { DrawingManager } from './manager/DrawManager'
import { eventbus } from '@/utils/eventbus'
import { EventTypeEnum } from './enum/Event'

interface ControlItem {
  key: string
  control: any
  position: mapboxgl.ControlPosition
}

export const MapOrigin = [113.9137900797507, 22.5387074495508] as LngLatLike

export type CustomMapOptions = {
  geocoderContainer: string
} & Partial<MapOptions>

export class MapRnderer {
  private _options = {
    maxZoom: 24,
    // mapbox://styles/mapbox/dark-v11
    style: {
      version: 8,
      glyphs: '/fonts/{fontstack}/{range}.pbf',
      sources: {},
      layers: [],
      zoom: 20,
      center: [0, 0],
      metadata: {},
    },
    geocoderContainer: '',
    container: '',
    center: MapOrigin,
    zoom: 18,
    antialias: true,
    doubleClickZoom: false,
    accessToken: ' ',
    // accessToken:
    //   "pk.eyJ1Ijoia2FuZ2JvNDkyNiIsImEiOiJjbHA5OGd1ZWEyOXA3MmtzMTZjeXlsYzkzIn0._hOucYQXZaXSzkcSO63SOA",
  } as CustomMapOptions

  private _controls: Array<ControlItem> = [
    {
      key: 'nav',
      control: new mapboxgl.NavigationControl(),
      position: 'bottom-right',
    },
    {
      key: 'scale',
      control: new mapboxgl.ScaleControl(),
      position: 'bottom-left',
    },
    // {
    //   key: "language",
    //   control: new MapboxLanguage({
    //     defaultLanguage: "zh-Hans",
    //   }),
    //   position: "top-right",
    // },
    {
      key: ControlKeyEnum.COORD_CONTROL,
      control: new CoordDisplayControl(),
      position: 'bottom-left',
    },
    {
      key: ControlKeyEnum.VIEW_MODE_CONTROL,
      control: new ViewModeControl(),
      position: 'top-right',
    },
  ]

  private _layers: Map<string, any> = new Map()

  private _map: mapboxgl.Map | null = null
  private _geocoder: HTMLElement | null = null
  private _center: number[] = [0, 0]

  constructor(options: CustomMapOptions) {
    this._options = Object.assign(this._options, options)
  }

  public async mount(containerId: string, options?: Partial<MapOptions>) {
    return new Promise(async (resolve, reject) => {
      if (this._map) {
        await this.destory()
      }

      if (options) {
        this._options = Object.assign(this._options, options)
      }

      this._map = new mapboxgl.Map({
        ...this._options,
        container: containerId,
      })

      this._map.on('error', (e: any) => {
        reject(e)
      })

      this._controls.forEach(({ control, position }) => {
        this._map?.addControl(control, position)
      })
      this._addResizeListener(containerId)
      await this._map.once('load')

      this._center = this._map.getCenter().toArray()
      
      await this._initCustomLayers()

      DrawingManager.getInstance<DrawingManager>().init(this._map)
      this._initMapBounds()
      this._setupGeocoder(this._options.geocoderContainer)

      resolve(this._map)
    })
  }

  public async destory() {
    this._controls.forEach(({ control }) => {
      this._map?.removeControl(control)
    })
    this._layers.forEach((_layer, id) => {
      //@ts-ignore
      this.mapInstance?.removeLayer(id)
    })
    eventbus.removeAllListener(EventTypeEnum.ClearLayerSelectedState)
    eventbus.removeAllListener(EventTypeEnum.DisableLayerSelect)
    eventbus.removeAllListener(EventTypeEnum.EnableLayerSelect)
    this._layers.clear()
    this._map?.remove()
  }

  private async _initCustomLayers() {
    backgroundLayer.value = new BackgroundLayer({ id: 'background-layer' })
    groundLayer.value = new GroundLayer({ id: 'ground-layer' })
    wallsLayer.value = new WallsLayer({ id: 'walls-layer' })
    blockLayer.value = new BlockLayer({ id: 'block-layer' })
    const layers = [backgroundLayer.value, groundLayer.value, wallsLayer.value, blockLayer.value]
    layers.forEach((layer) => {
      //@ts-ignore
      this.mapInstance?.addLayer(layer)
      this._layers.set(layer.id, layer)
    })
    await this.mapInstance?.once('styledata')
  }

  private _initMapBounds() {
    const features = StorageHandler.getAllFatures()
    if (features.length === 0) {
      this._map?.setZoom(20)
      return
    }
    const geosjon = {
      type: 'FeatureCollection',
      features: features,
    }
    //@ts-ignore
    const bounds = turf.bbox(geosjon) as LngLatBoundsLike
    this._map?.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    })
    console.log('map features:', features)

    //@ts-ignore
    const center = turf.center(geosjon)
    this._center = center.geometry.coordinates
  }

  public changeLanguage(language: 'cn' | 'es' = 'cn') {
    this._map?.setLayoutProperty('country-label', 'text-field', ['get', `name_${language}`])
  }

  public getGeocoder() {
    return this._geocoder
  }

  public get mapInstance() {
    return this._map
  }

  public getOptions() {
    return this._options
  }

  public getCenter() {
    return this._center
  }

  private _setupGeocoder(container: string) {
    try {
      const geocoder = new MapboxGeocoder({
        accessToken: this._options.accessToken!,
        //@ts-ignore
        localGeocoder: this._coordinatesGeocoder,
        //@ts-ignore
        mapboxgl: mapboxgl,
        placeholder: 'Seach for places',
        reverseGeocode: true,
      })
      //@ts-ignore
      this._geocoder = geocoder.onAdd(this._map!)

      const el = document.getElementById(container)
      if (el && this._geocoder) {
        el.innerHTML = ''
        el.appendChild(this._geocoder)
      }
    } catch (error: any) {
      window.$message.warning(error.message)
    }
  }

  private _coordinatesGeocoder = function (query: string) {
    // Match anything which looks like
    // decimal degrees coordinate pair.
    const matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i)
    if (!matches) {
      return null
    }

    function coordinateFeature(lng: number, lat: number) {
      return {
        center: [lng, lat],
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        place_name: 'Lat: ' + lat + ' Lng: ' + lng,
        place_type: ['coordinate'],
        properties: {},
        type: 'Feature',
      }
    }

    const coord1 = Number(matches[1])
    const coord2 = Number(matches[2])
    const geocodes: any[] = []

    if (coord1 < -90 || coord1 > 90) {
      // must be lng, lat
      geocodes.push(coordinateFeature(coord1, coord2))
    }

    if (coord2 < -90 || coord2 > 90) {
      // must be lat, lng
      geocodes.push(coordinateFeature(coord2, coord1))
    }

    if (geocodes.length === 0) {
      // else could be either lng, lat or lat, lng
      geocodes.push(coordinateFeature(coord1, coord2))
      geocodes.push(coordinateFeature(coord2, coord1))
    }

    return geocodes
  }

  private _addResizeListener(contianerId: string) {
    const containerEl = document.getElementById(contianerId)
    if (!containerEl) return

    const _self = this
    const resizeHandler = Utils.debounce(() => {
      console.log('map canvas resize')
      _self._map?.resize()
    }, 0)
    const resizeObserver = new ResizeObserver(resizeHandler)
    this._map?.once('load', () => {
      resizeObserver.observe(containerEl)
    })
    this._map?.once('remove', () => {
      resizeObserver.disconnect()
    })
  }
}
