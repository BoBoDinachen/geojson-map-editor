<script setup lang="ts">
import { SideMenusStore } from "@/stores/SideMenusStore";
import { LayerType } from "@/core/enum/Layer";
import BackgroundLayer from "../Layers/Background.vue";
import GroundLayer from "../Layers/Ground.vue";
import WallsLayer from "../Layers/Walls.vue";

defineOptions({
  name: "LayerPane",
});
</script>
<template>
  <div class="layer-container">
    <BackgroundLayer
      v-if="SideMenusStore.activeLayerType === LayerType.Background"
    />
    <GroundLayer
      v-if="SideMenusStore.activeLayerType === LayerType.Ground"
    ></GroundLayer>
    <WallsLayer
      v-if="SideMenusStore.activeLayerType === LayerType.Wall"
    ></WallsLayer>
  </div>
</template>
<style lang="scss">
.layer-container {
  padding: 10px;
  height: 100%;
  overflow: hidden;
}
</style>
