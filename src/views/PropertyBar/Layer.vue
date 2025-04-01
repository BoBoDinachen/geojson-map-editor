<script setup lang="ts">
import { SideMenusStore } from "@/stores/SideMenusStore";
import { FeatureType } from "@/core/enum/Layer";
import BackgroundLayer from "./Layers/Background.vue";
import GroundLayer from "./Layers/Ground.vue";
import WallsLayer from "./Layers/Walls.vue";
import BlockLayer from "./Layers/Block.vue";

defineOptions({
  name: "LayerPane",
});
</script>
<template>
  <div class="layer-container">
    <BackgroundLayer
      v-if="SideMenusStore.activeLayerType === FeatureType.Background"
    />
    <GroundLayer
      v-if="SideMenusStore.activeLayerType === FeatureType.Ground"
    ></GroundLayer>
    <WallsLayer
      v-if="SideMenusStore.activeLayerType === FeatureType.Wall"
    ></WallsLayer>
    <BlockLayer
      v-if="SideMenusStore.activeLayerType === FeatureType.Block"
    ></BlockLayer>
  </div>
</template>
<style lang="scss">
.layer-container {
  padding: 10px;
  height: 100%;
  overflow: hidden;
}
</style>
