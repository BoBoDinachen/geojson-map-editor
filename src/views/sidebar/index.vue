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
import { LayerName } from "@/core/enum/Layer";

defineOptions({
  name: "Sidebar",
});
type LayerItem = {
  key: string;
  name: string;
  icon: Component;
  locked: boolean;
  visibility: Ref<boolean>;
  instance?: ShallowRef<MapLayer | undefined>;
  toggleVisible: () => void;
};
const layers: Array<LayerItem> = [
  {
    key: "icon",
    name: "Icons",
    icon: Layers,
    locked: false,
    visibility: computed(() => false),
    toggleVisible() {},
  },
  {
    key: LayerName.Label,
    name: "Label",
    icon: Layers,
    locked: false,
    visibility: computed(() => false),
    toggleVisible() {},
  },
  {
    key: LayerName.Fill,
    name: "Fill",
    icon: Layers,
    locked: false,
    visibility: computed(() => false),
    toggleVisible() {},
  },
  {
    key: LayerName.Ground,
    name: "Ground",
    icon: Layers,
    locked: true,
    visibility: computed(() => false),
    toggleVisible() {},
  },
  {
    key: LayerName.Background,
    name: "Background",
    icon: Layers,
    locked: true,
    instance: backgroundLayer,
    visibility: computed(() => backgroundLayer.value?.visible ?? false),
    toggleVisible() {
      backgroundLayer.value?.toggleVisible();
    },
  },
];

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
            :class="styles['layer-item']"
            v-for="layer in layers"
            :key="layer.key"
          >
            <NSpace
              align="center"
              style="cursor: pointer; flex: 1"
              @click="
                () => {
                  eventbus.emit(EventTypeEnum.SELECT_LAYER, layer.key);
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
                  () => h(layer.visibility?.value ? ViewFilled : ViewOffFilled)
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
</style>
