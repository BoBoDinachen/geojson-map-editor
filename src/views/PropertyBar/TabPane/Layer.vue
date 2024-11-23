<script setup lang="ts">
import { SideMenusStore } from "@/stores/SideMenusStore";
import { LayerName } from "@/core/enum/Layer";
import BackgroundLayer from "../Layers/Background.vue";
import GroundLayer from "../Layers/Ground.vue";

defineOptions({
  name: "LayerPane",
});
</script>
<template>
  <div class="layer-container">
    <BackgroundLayer
      v-if="SideMenusStore.state.activeLayerName === LayerName.Background"
    />
    <GroundLayer
      v-if="SideMenusStore.state.activeLayerName === LayerName.Ground"
    ></GroundLayer>
  </div>
</template>
<style lang="scss">
.layer-container {
  padding: 10px;
}
</style>
