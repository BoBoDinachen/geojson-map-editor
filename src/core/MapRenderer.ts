import mapboxgl, { LngLatLike, MapOptions } from "mapbox-gl";
import { Utils } from "@/utils/index";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import * as THREE from "three";
import editor from "./Editor";
import MapboxLanguage from "@mapbox/mapbox-gl-language";

interface ControlItem {
  control: any;
  position: mapboxgl.ControlPosition;
}

export const MapOrigin = [148.9819, -35.39847] as LngLatLike;

export class MapRnderer {
  private _options = {
    maxZoom: 30,
    style: "mapbox://styles/mapbox/dark-v11",
    container: "",
    center: MapOrigin,
    zoom:15,
    accessToken:
      "pk.eyJ1Ijoia2FuZ2JvNDkyNiIsImEiOiJjbHA5OGd1ZWEyOXA3MmtzMTZjeXlsYzkzIn0._hOucYQXZaXSzkcSO63SOA",
  } as MapOptions;

  private _controls: Array<ControlItem> = [
    {
      control: new mapboxgl.NavigationControl(),
      position: "bottom-right",
    },
    {
      control: new mapboxgl.ScaleControl(),
      position: "bottom-left",
    },
    {
      control: new MapboxLanguage({
        defaultLanguage: "zh-Hans",
      }),
      position: "top-right",
    },
  ];

  private _map: mapboxgl.Map | null = null;
  private _geocoder: HTMLElement | null = null;

  constructor(options: Partial<MapOptions>) {
    this._options = Object.assign(this._options, options);
  }

  public async mount(containerId: string) {
    if (this._map) {
      this._map.remove();
    }
    this._map = new mapboxgl.Map({
      ...this._options,
      container: containerId,
    });
    this._controls.forEach(({ control, position }) => {
      this._map?.addControl(control, position);
    });

    this._addResizeListener(containerId);
    await this._map.once("load");

    this.initThreeRenderer(this._map);
    this._setupGeocoder();

    return this._map;
  }

  public destory() {
    this._map?.remove();
  }

  public changeLanguage(language: "cn" | "es" = "cn") {
    this._map?.setLayoutProperty("country-label", "text-field", [
      "get",
      `name_${language}`,
    ]);
  }

  public getGeocoder() {
    return this._geocoder;
  }

  public get mapInstance() {
    return this._map;
  }

  private initThreeRenderer(map: mapboxgl.Map) {
    const canvas = map.getCanvas();

    const h = canvas.clientHeight;
    const w = canvas.clientWidth;
    editor.camera = new THREE.PerspectiveCamera(
      map.transform.fov,
      w / h,
      0.1,
      1e21
    );

    // use the Mapbox GL JS map canvas for three.js
    editor.renderer = new THREE.WebGLRenderer({
      canvas,
      context: canvas.getContext("webgl2")!,
      antialias: true,
    });
    editor.renderer.setPixelRatio(window.devicePixelRatio);
    editor.renderer.setSize(
      map.getCanvas().clientWidth,
      map.getCanvas().clientHeight
    );
    editor.renderer.autoClear = false;
  }
  private _setupGeocoder() {
    const geocoder = new MapboxGeocoder({
      accessToken: this._options.accessToken!,
      //@ts-ignore
      localGeocoder: this._coordinatesGeocoder,
      //@ts-ignore
      mapboxgl: mapboxgl,
      placeholder: "Seach for places",
      reverseGeocode: true,
    });
    //@ts-ignore
    const el = geocoder.onAdd(this._map!);
    this._geocoder = el;
    return el;
  }
  private _coordinatesGeocoder = function (query: string) {
    // Match anything which looks like
    // decimal degrees coordinate pair.
    const matches = query.match(
      /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
    );
    if (!matches) {
      return null;
    }

    function coordinateFeature(lng: number, lat: number) {
      return {
        center: [lng, lat],
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        place_name: "Lat: " + lat + " Lng: " + lng,
        place_type: ["coordinate"],
        properties: {},
        type: "Feature",
      };
    }

    const coord1 = Number(matches[1]);
    const coord2 = Number(matches[2]);
    const geocodes: any[] = [];

    if (coord1 < -90 || coord1 > 90) {
      // must be lng, lat
      geocodes.push(coordinateFeature(coord1, coord2));
    }

    if (coord2 < -90 || coord2 > 90) {
      // must be lat, lng
      geocodes.push(coordinateFeature(coord2, coord1));
    }

    if (geocodes.length === 0) {
      // else could be either lng, lat or lat, lng
      geocodes.push(coordinateFeature(coord1, coord2));
      geocodes.push(coordinateFeature(coord2, coord1));
    }

    return geocodes;
  };

  private _addResizeListener(contianerId: string) {
    const containerEl = document.getElementById(contianerId);
    if (!containerEl) return;

    const _self = this;
    const resizeHandler = Utils.debounce(() => {
      _self._map?.resize();
    }, 0);
    const resizeObserver = new ResizeObserver(resizeHandler);
    this._map?.on("load", () => {
      resizeObserver.observe(containerEl);
    });
    this._map?.on("remove", () => {
      resizeObserver.disconnect();
    });
  }
}
