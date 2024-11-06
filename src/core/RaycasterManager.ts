import { Singleton } from "@/utils/Singleton";
import { Point } from "mapbox-gl";
import * as THREE from "three";

export class RaycasterManager extends Singleton {
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private objects: THREE.Object3D[] = [];
  private INTERSECTED: THREE.Object3D | null = null;
  private map!: mapboxgl.Map;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.Camera;
  private world!: THREE.Group;

  constructor() {
    super();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
  }

  public init(
    map: mapboxgl.Map,
    renderer: THREE.WebGLRenderer,
    camera: THREE.Camera,
    world: THREE.Group
  ) {
    this.map = map;
    this.renderer = renderer;
    this.camera = camera;
    this.world = world;
    map.on("click", (e) => {
      const intersects = this.queryRenderedFeatures(e.point);
      console.log(intersects);
    });
    // window.addEventListener("pointermove", (e) => {
    //   // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
    //   this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    //   this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    // });
  }

  queryRenderedFeatures(point: THREE.Vector2 | Point) {
    let mouse = new THREE.Vector2();
    // // scale mouse pixel position to a percentage of the screen's width and height
    mouse.x = (point.x / this.map.transform.width) * 2 - 1;
    mouse.y = - (point.y / this.map.transform.height) * 2 + 1;

    const camInverseProjection = this.camera.projectionMatrix.invert();
    const cameraPosition = new THREE.Vector3().applyMatrix4(
      camInverseProjection
    );
    const mousePosition = new THREE.Vector3(mouse.x, mouse.y, 1).applyMatrix4(
      camInverseProjection
    );
    const viewDirection = mousePosition.clone().sub(cameraPosition).normalize();

    this.raycaster.set(cameraPosition, viewDirection);

    // calculate objects intersecting the picking ray
    let intersects = this.raycaster.intersectObjects(this.world.children, false);

    const objects: THREE.Object3D[] = [];
    intersects.forEach((intersect) => {
      objects.push(intersect.object);
    })


    return intersects;
  }
}
