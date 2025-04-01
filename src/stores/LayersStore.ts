import {
  WallsLayer,
  GroundLayer,
  BackgroundLayer,
  BlockLayer,
} from "@/core/layers/index";
import { shallowRef } from "vue";

const backgroundLayer = shallowRef<BackgroundLayer | null>(null);
const groundLayer = shallowRef<GroundLayer | null>(null);
const wallsLayer = shallowRef<WallsLayer | null>(null);
const blockLayer = shallowRef<BlockLayer | null>(null);

export { backgroundLayer, groundLayer, wallsLayer, blockLayer };
