import { MapLayer } from "@/types/layer";
import { ref, Ref } from "vue";
import * as mapbox from "mapbox-gl";
import { LayerGroup } from "../enum/Group";
import { DrawingManager } from "../manager/DrawManager";

export class GroundLayer implements MapLayer {
  public groupId: number = LayerGroup.Ground;
  public visible: Ref<boolean, boolean> = ref(true);
  private _drawManager = DrawingManager.getInstance<DrawingManager>()
  constructor() {}
  onAdd(map: mapbox.Map) {}
  onRemove(map: mapbox.Map) {}
  toggleVisible(): void {}

  drawBounds(cb: (bounds: mapbox.LngLatBoundsLike) => void) {
    // TODO: implement
  }
}
