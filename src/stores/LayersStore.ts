import { BackgroundLayer } from "@/core/layers/BackgroundLayer";
import { GroundLayer } from "@/core/layers/Ground";
import { WallsLayer } from "@/core/layers/Walls";
import { shallowRef } from "vue";

const backgroundLayer = shallowRef<BackgroundLayer>();
const groundLayer = shallowRef<GroundLayer>();
const wallsLayer = shallowRef<WallsLayer>();

export { backgroundLayer, groundLayer, wallsLayer };
