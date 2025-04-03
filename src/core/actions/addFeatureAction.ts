import { toRaw } from "vue";
import { BlockLayer, GroundLayer, WallsLayer } from "../layers";
import { EditAction } from "../manager/UndoRedoManager";

export class AddFeatureAction implements EditAction {
  constructor(
    private layer: WallsLayer | GroundLayer | BlockLayer,
    private feature: any
  ) {}
  apply() {
    if (this.layer instanceof WallsLayer) {
      this.layer.addFeature(this.feature);
    } else if (this.layer instanceof BlockLayer) {
      this.layer.addFeature(this.feature);
    } else if (this.layer instanceof GroundLayer) {
      this.layer.addFeature(this.feature);
    }
    console.log("add feature: ", toRaw(this.feature));
  }
  undo() {
    if (this.layer instanceof WallsLayer) {
      this.layer.removeFeatureById(this.feature.id);
    } else if (this.layer instanceof BlockLayer) {
      this.layer.removeFeatureById(this.feature.id);
    } else if (this.layer instanceof GroundLayer) {
      this.layer.removeFeatureById(this.feature.id);
    }
  }
}
