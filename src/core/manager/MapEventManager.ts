import { DrawEventType } from '@mapbox/mapbox-gl-draw'
import { MapEventType } from 'mapbox-gl'

type EventCallback = (...args: any[]) => void

export class MapEventManager {
  protected _map!: mapboxgl.Map
  protected events = new Map<
    string,
    {
      type: DrawEventType | MapEventType
      mode: 'on' | 'once'
      target: string | string[] | undefined
      handler: EventCallback
    }
  >()
  constructor() {}

  init(map: mapboxgl.Map) {
    this._map = map
  }

  public addMapEventListener(
    key: string,
    options: {
      type: DrawEventType | MapEventType
      mode: 'on' | 'once'
      target?: string | string[]
      handler: (e: any) => void
    }
  ) {
    const { type, mode, target, handler } = options
    this.events.set(key, {
      type: type,
      mode: mode,
      handler: handler,
      target: target,
    })
    if (options.mode == 'once') {
      target ? this._map.once(type, target, handler) : this._map.once(type, handler)
    } else {
      target ? this._map.on(type, target, handler) : this._map.on(type, handler)
    }
    return () => {
      this.removeMapEventListener(key)
    }
  }

  public removeMapEventListener(key: string) {
    const event = this.events.get(key)
    if (event) {
      event.target
        ? this._map.off(event.type, event.target, event.handler)
        : this._map.off(event.type, event.handler)
      this.events.delete(key)
    }
  }

  public removeAllMapEventListener() {
    this.events.forEach((_, key) => {
      this.removeMapEventListener(key)
    })
  }

  public destroy() {
    this.removeAllMapEventListener()
  }
}
