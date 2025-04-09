import * as mapbox from "mapbox-gl";
import { LayerGroup } from "../enum/Layer";
import { CustomLayer } from "./CustomLayer";
import * as THREE from "three";
import editor from "../Editor";
import { useStorageRef, StorageKey } from "@/storage-handler";

export class BackgroundLayer extends CustomLayer {
  public groupId: number = LayerGroup.Background;
  private _gridObject: THREE.Mesh | null = null;
  private _showGrid = useStorageRef(StorageKey.ShowGridBackground, true);
  private _showBaseMap = useStorageRef(StorageKey.ShowBaseMap, true);
  public onAdd(map: mapbox.Map) {
    this._map = map;
    const gridMesh = this._buildInfiniteGrid(
      undefined,
      undefined,
      0x9e9e9e,
      10000
    );
    this._gridObject = gridMesh;
    editor.world.add(gridMesh);
    this.changeShowBaseMap(this._showBaseMap.value);
    this.changeShowGrid(this._showGrid.value);
    console.log("background layer add");
  }
  public onRemove() {
    if (this._gridObject) {
      editor.world.remove(this._gridObject);
    }
  }

  public changeShowBaseMap(visible: boolean) {
    this._showBaseMap.value = visible;
    const layers = this._map?.getStyle()?.layers;
    layers?.forEach((layer) => {
      if (layer.source === "composite") {
        this._map?.setLayoutProperty(
          layer.id,
          "visibility",
          this._showBaseMap.value ? "visible" : "none"
        );
      }
    });
    console.log("map style:", this._map?.getStyle());
  }

  public get showGrid() {
    return this._showGrid.value;
  }

  public changeShowGrid(value: boolean) {
    this._showGrid.value = value;
    if (this._gridObject) {
      this._gridObject.visible = value;
    }
  }

  private _buildInfiniteGrid(
    size1 = 1,
    size2 = 10,
    color: THREE.Color | number = 0x444444,
    distance = 8000,
    axes = "xzy"
  ) {
    color = new THREE.Color(color);

    const planeAxes = axes.substring(0, 2);
    const geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 4,
      uniforms: {
        uSize1: {
          value: size1,
        },
        uSize2: {
          value: size2,
        },
        uColor: {
          value: color,
        },
        uDistance: {
          value: distance,
        },
      },
      transparent: true,
      vertexShader: `
       
       varying vec3 worldPosition;
       
       uniform float uDistance;
       
       void main() {
       
            vec3 pos = position.${axes} * uDistance;
            pos.${planeAxes} += cameraPosition.${planeAxes};
            
            worldPosition = pos;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
       
       }
       `,

      fragmentShader: `
       
       varying vec3 worldPosition;
       
       uniform float uSize1;
       uniform float uSize2;
       uniform vec3 uColor;
       uniform float uDistance;
        
        
        
        float getGrid(float size) {
        
            vec2 r = worldPosition.${planeAxes} / size;
            
            
            vec2 grid = abs(fract(r - 0.5) - 0.5) / fwidth(r);
            float line = min(grid.x, grid.y);
            
        
            return 1.0 - min(line, 1.0);
        }
        
       void main() {
       
            
              float d = 1.0 - min(distance(cameraPosition.${planeAxes}, worldPosition.${planeAxes}) / uDistance, 1.0);
            
              float g1 = getGrid(uSize1);
              float g2 = getGrid(uSize2);
              
              
              gl_FragColor = vec4(uColor.rgb, mix(g2, g1, g1) * pow(d, 3.0));
              gl_FragColor.a = mix(0.5 * gl_FragColor.a, gl_FragColor.a, g2);
            
              if ( gl_FragColor.a <= 0.0 ) discard;
            
       
       }
       
       `,

      extensions: {
        //@ts-ignore
        derivatives: true,
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;
    return mesh;
  }

  public get showBaseMap() {
    return this._showBaseMap.value;
  }

  public addFeature() {}
  public removeFeature() {}
  public getFeature() {}
  public updateFeature() {}
  public getFeatures() {}
}
