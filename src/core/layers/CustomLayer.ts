import mapboxgl, { LngLat, LngLatLike } from 'mapbox-gl'
import * as THREE from 'three'
import editor from '@/core/Editor'
import { MapOrigin } from '@/core/MapRenderer'
import { MapEventManager } from '../manager/MapEventManager'

export class CustomLayer extends MapEventManager {
  public id: string
  public type: string
  public renderingMode: string // '3d' | '2d'
  constructor(parameters: { id: string; type?: string; renderingMode?: string }) {
    super()
    this.id = parameters.id
    this.type = parameters.type || 'custom' // 'custom'
    this.renderingMode = parameters.renderingMode || '3d' // '3d' | '2d'
  }

  public onAdd(map: mapboxgl.Map, gl: WebGL2RenderingContext) {}

  public onRemove(map: mapboxgl.Map) {}

  public render(gl: WebGL2RenderingContext, matrix: number[]) {
    this.update(gl, matrix)
  }

  // 处理threejs的矩阵变换
  protected update(gl: WebGL2RenderingContext, matrix: number[]) {
    if (!this._map) {
      this._map = editor?.mapInstance!
    }

    const worldRotate = [Math.PI / 2, 0, 0]

    const worldOriginAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      MapOrigin as LngLatLike,
      0
    )

    const worldTransform = {
      translateX: worldOriginAsMercatorCoordinate.x,
      translateY: worldOriginAsMercatorCoordinate.y,
      translateZ: worldOriginAsMercatorCoordinate.z,
      rotateX: worldRotate[0],
      rotateY: worldRotate[1],
      rotateZ: worldRotate[2],
      /* Since the 3D model is in real world meters, a scale transform needs to be
       * applied since the CustomLayerInterface expects units in MercatorCoordinates.
       */
      scale: worldOriginAsMercatorCoordinate.meterInMercatorCoordinateUnits(),
    }
    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      worldTransform.rotateX
    )
    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      worldTransform.rotateY
    )
    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      worldTransform.rotateZ
    )

    const m = new THREE.Matrix4().fromArray(matrix)
    const l = new THREE.Matrix4()
      // 这里是移动相机的中心点
      .makeTranslation(
        worldTransform.translateX,
        worldTransform.translateY,
        worldTransform.translateZ
      )
      .scale(new THREE.Vector3(worldTransform.scale, -worldTransform.scale, worldTransform.scale))
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ)

    // const center = MercatorCoordinate.fromLngLat(MapOrigin, 0);
    // const { x, y, z } = center;
    // const s = center.meterInMercatorCoordinateUnits();

    // const scale = new THREE.Matrix4().makeScale(s, s, -s);
    // const rotation = new THREE.Matrix4().multiplyMatrices(
    //   new THREE.Matrix4().makeRotationX(-0.5 * Math.PI),
    //   new THREE.Matrix4().makeRotationY(Math.PI)
    // );

    // const cameraTransform = new THREE.Matrix4()
    //   .multiplyMatrices(scale, rotation)
    //   .setPosition(x, y, z);

    editor.camera.projectionMatrix = m.multiply(l)
    editor.renderer?.resetState()
    editor.renderer?.render(editor.scene, editor.camera)
    this._map?.triggerRepaint()
  }
}
