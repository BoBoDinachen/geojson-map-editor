import { CustomLayer } from "./CustomLayer";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { TransformControls } from "./TransformControls.js";
import { MapControls } from "three/addons/controls/MapControls.js";
import { DragControls } from 'three/addons/controls/DragControls.js';
import editor from "../Editor";

export class ThreeLayer extends CustomLayer {
  protected _map: mapboxgl.Map | null;
  private _controls: DragControls | null = null;
  constructor() {
    super({ id: "three-layer" });
    this._map = null;
  }
  public onAdd(map: mapboxgl.Map, gl: WebGL2RenderingContext): void {
    this._map = map;
    // create two three.js lights to illuminate the model
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, -70, 100).normalize();
    editor.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(0, 70, 100).normalize();
    editor.scene.add(directionalLight2);

    // use the three.js GLTF loader to add the 3D model to the three.js scene
    const loader = new GLTFLoader();
    loader.load("/assets/models/Kimono_Female.gltf", (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.name = "Kimono_Female";
      console.log(model);

      editor.world.add(gltf.scene);
    });

    // 坐标轴辅助线
    const axesHelper = new THREE.AxesHelper(100);
    editor.scene.add(axesHelper);

    // 网格背景
    const size = 20;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions);
    editor.scene.add(gridHelper);

    // 灯光
    const ambientLight = new THREE.AmbientLight(0xffffff);
    editor.scene.add(ambientLight);
    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(1, 1, 1);
    editor.scene.add(light);

    // 添加只带边框的立方体
    // 创建立方体几何体
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // const wireframe = new THREE.WireframeGeometry(geometry);
    const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    cube.name = "Test1";
    cube.position.set(5, 1, 5);
    editor.world.add(cube);

    const cube2 = cube.clone();
    cube2.position.set(10, 1, 10);
    cube2.name = "Test2";
    editor.world.add(cube2);

    // this._controls = new MapControls(editor.camera, editor.renderer!.domElement);
    // this._controls.enableDamping = true;

    // 添加一个控制器
    // const domElement = editor.renderer?.domElement!; //editor.renderer!.domElement;

    // const transformControl = new TransformControls(
    //   editor.camera,
    //   map.getCanvas()
    // );
    // transformControl.attach(cube);
    // editor.scene.add(transformControl);

    // // 切换不同模式
    // window.addEventListener("keydown", (event) => {
    //   switch (event.key) {
    //     case "t": // 平移
    //       transformControl.setMode("translate");
    //       break;
    //     case "r": // 旋转
    //       transformControl.setMode("rotate");
    //       break;
    //     case "s": // 缩放
    //       transformControl.setMode("scale");
    //       break;
    //     case " ":
    //       transformControl.enabled = !transformControl.enabled;
    //       console.log(transformControl.enabled);
    //       break;
    //   }
    // });
    // // 阻止地图在拖动控制器时的默认行为
    // transformControl.addEventListener("dragging-changed", (event: any) => {
    //   if (event.value) {
    //     map.dragPan.disable();
    //     map.dragRotate.disable();
    //   } else {
    //     map.dragPan.enable();
    //     map.dragRotate.enable();
    //   }
    // });
  }
  public render(gl: WebGL2RenderingContext, matrix: number[]): void {
    this.update(gl,matrix);
  }
}
