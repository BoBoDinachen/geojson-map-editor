<script lang="ts" setup>
import { Component, computed, h, onMounted, Ref, ShallowRef } from "vue";
import {
  Layers,
  ViewFilled,
  ViewOffFilled,
  Locked,
  Unlocked,
} from "@vicons/carbon";
import { backgroundLayer } from "@/stores/LayersStore";
import { eventbus } from "@/utils/eventbus";
import { EventTypeEnum } from "@/core/enum/Event";
import { LayerType } from "@/core/enum/Layer";
import { SideMenusStore } from "@/stores/SideMenusStore";

defineOptions({
  name: "Sidebar",
});
type LayerItem = {
  key: string;
  name: string;
  icon: Component;
  locked: boolean;
  visibility: boolean;
  instance?: ShallowRef<MapLayer | undefined>;
  toggleVisible: () => void;
};

const getLayers = (): Array<LayerItem> => {
  return [
    {
      key: LayerType.Label,
      name: "Labels",
      icon: Layers,
      locked: false,
      visibility: false,
      toggleVisible() {},
    },
    {
      key: LayerType.Wall,
      name: "Walls",
      icon: Layers,
      locked: false,
      visibility: false,
      toggleVisible() {},
    },
    {
      key: LayerType.Ground,
      name: "Ground",
      icon: Layers,
      locked: true,
      visibility: false,
      toggleVisible() {},
    },
    {
      key: LayerType.Background,
      name: "Background",
      icon: Layers,
      locked: true,
      instance: backgroundLayer,
      visibility: backgroundLayer.value?.visible || false,
      toggleVisible() {
        backgroundLayer.value?.toggleVisible();
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
              <NTooltip placement="bottom">
                <template #trigger>
                  <n-button
                    text
                    :color="layer.locked ? '#414855' : ''"
                    style="font-size: 24px"
                    :render-icon="() => h(layer.locked ? Locked : Unlocked)"
                  >
                  </n-button>
                </template>
                {{ layer.locked ? "Unlock" : "Lock" }}
              </NTooltip>
            </NSpace>
          </div>
        </NSpace>
      </NCollapseItem>
      <NCollapseItem title="Selected Features" name="2"> </NCollapseItem>
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
