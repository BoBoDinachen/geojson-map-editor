<script lang="ts" setup>
import { Component, h, onMounted, ShallowRef } from "vue";
import { Layers, ViewFilled, ViewOffFilled } from "@vicons/carbon";
import {
  backgroundLayer,
  blockLayer,
  groundLayer,
  wallsLayer,
} from "@/stores/LayersStore";
import { eventbus } from "@/utils/eventbus";
import { EventTypeEnum } from "@/core/enum/Event";
import { FeatureType } from "@/core/enum/Layer";
import { SideMenusStore } from "@/stores/SideMenusStore";

defineOptions({
  name: "Sidebar",
});
type LayerItem = {
  key: string;
  name: string;
  icon: Component;
  visibility: boolean;
  instance?: ShallowRef<MapLayer | null>;
  toggleVisible: () => void;
};

const getLayers = (): Array<LayerItem> => {
  return [
    {
      key: FeatureType.Wall,
      name: "Walls",
      icon: Layers,
      visibility: wallsLayer.value?.wallsVisible || false,
      toggleVisible() {
        if (wallsLayer.value) {
          wallsLayer.value.wallsVisible = !wallsLayer.value.wallsVisible;
        }
      },
    },
    {
      key: FeatureType.Block,
      name: "Blocks",
      icon: Layers,
      visibility: blockLayer.value?.blocksVisible || false,
      toggleVisible() {
        if (blockLayer.value) {
          blockLayer.value.blocksVisible = !blockLayer.value.blocksVisible;
        }
      },
    },
    {
      key: FeatureType.Ground,
      name: "Ground",
      icon: Layers,
      visibility: groundLayer.value?.groundsVisible || false,
      toggleVisible() {
        if (groundLayer.value) {
          groundLayer.value.groundsVisible = !groundLayer.value.groundsVisible;
        }
      },
    },
    {
      key: FeatureType.Background,
      name: "Background",
      icon: Layers,
      visibility: backgroundLayer.value?.showBaseMap || false,
      toggleVisible() {
        backgroundLayer.value?.changeShowBaseMap(
          !backgroundLayer.value?.showBaseMap
        );
      },
    },
  ];
};

onMounted(() => {
  // console.log(backgroundLayer.value, editor);
});
</script>
<template>
  <div :class="styles.container">
    <NCollapse :default-expanded-names="['1']">
      <NCollapseItem title="Layers" name="1">
        <NSpace vertical justify="start">
          <div
            v-for="layer in getLayers()"
            :key="layer.key"
            :class="[styles['layer-item']]"
            :style="{
              backgroundColor:
                SideMenusStore.activeLayerType == layer.key
                  ? 'var(--nl-hover-color)'
                  : '',
            }"
          >
            <NSpace
              align="center"
              style="cursor: pointer; flex: 1"
              @click="
                () => {
                  eventbus.emit(EventTypeEnum.SELECT_LAYER, layer.key);
                  SideMenusStore.activeLayerType = layer.key;
                }
              "
            >
              <NIcon :component="layer.icon" :size="20"></NIcon>
              <span>{{ layer.name }}</span>
            </NSpace>
            <NSpace>
              <n-button
                text
                style="font-size: 24px"
                :render-icon="
                  () => h(layer.visibility ? ViewFilled : ViewOffFilled)
                "
                @click="layer.toggleVisible()"
              >
              </n-button>
            </NSpace>
          </div>
        </NSpace>
      </NCollapseItem>
    </NCollapse>
  </div>
</template>
<style module="styles">
.container {
  width: 300px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
  border: 1px solid var(--nl-border-color);
}
.container .layer-item {
  display: flex;
  gap: 5px;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  box-sizing: border-box;
  border: 1px solid var(--nl-border-color);
}
.layer-active {
  background-color: var(--nl-hover-color);
}
</style>
