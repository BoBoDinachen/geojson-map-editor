<script lang="tsx" setup>
import { Component, h, markRaw, onMounted, reactive, ref } from "vue";
import editor from "@/core/Editor";
import {
  Area,
  Move,
  SelectWindow,
  AreaCustom,
  CircleDash,
  Workspace as WallIcon,
  Bookmark as MarkerIcon,
} from "@vicons/carbon";
import { NButton, NDivider, NIcon, NSpace, NText } from "naive-ui";
import { blockLayer, wallsLayer } from "@/stores/LayersStore";
import { DrawModeEnum } from "@/core/draw_modes";
import { eventbus } from "@/utils/eventbus";
import { EventTypeEnum } from "@/core/enum/Event";

defineOptions({
  name: "Toolbar",
});

interface Action {
  key: string;
  tip: string;
  icon: Component;
  children?: Array<{
    label: string;
    value: string;
    tip: string;
    icon: Component;
    click: Function;
  }>;
  click: Function;
}

const currentAction = ref("move");
let stopDrawBlock: Function | undefined;
let stopDrawWall: Function | undefined;

const actions: Array<Action> = reactive([
  {
    key: "move",
    tip: "Move View",
    icon: markRaw(Move),
    click: () => {
      currentAction.value = "move";
      stopDrawBlock && stopDrawBlock();
      stopDrawWall && stopDrawWall();
      eventbus.emit(EventTypeEnum.DisableLayerSelect);
    },
  },
  {
    key: "select",
    tip: "Select Feature",
    icon: markRaw(SelectWindow),
    click: () => {
      currentAction.value = "select";
      stopDrawBlock && stopDrawBlock();
      stopDrawWall && stopDrawWall();
      eventbus.emit(EventTypeEnum.EnableLayerSelect);
    },
  },
  {
    key: "draw-fill",
    tip: "Draw Fill Feature",
    icon: markRaw(Area),
    click: (option: any) => {
      currentAction.value = "draw-fill";
      eventbus.emit(EventTypeEnum.DisableLayerSelect);
    },
    children: [
      {
        label: "Rectangle",
        value: "draw-fill-rectangle",
        tip: "Draw Rectangle",
        icon: markRaw(Area),
        click: () => {
          stopDrawBlock && stopDrawBlock();
          stopDrawBlock = blockLayer.value?.drawBlock(
            DrawModeEnum.RECTANGLE_MODE,
            () => {}
          );
        },
      },
      {
        label: "Polygon",
        value: "draw-fill-polygon",
        tip: "Draw Polygon",
        icon: markRaw(AreaCustom),
        click: () => {
          stopDrawBlock && stopDrawBlock();
          stopDrawBlock = blockLayer.value?.drawBlock(
            DrawModeEnum.POLYGON_MODE,
            () => {}
          );
        },
      },
      {
        label: "Circle",
        value: "draw-fill-circle",
        tip: "Draw Circle",
        icon: markRaw(CircleDash),
        click: () => {
          stopDrawBlock && stopDrawBlock();
          stopDrawBlock = blockLayer.value?.drawBlock(
            DrawModeEnum.CIRCLE_MODE,
            () => {}
          );
        },
      },
    ],
  },
  {
    key: "draw-wall",
    tip: "Draw wall",
    icon: markRaw(WallIcon),
    click: () => {
      currentAction.value = "draw-wall";
      stopDrawWall && stopDrawWall();
      stopDrawWall = wallsLayer.value?.drawWall(
        {
          enableSnap: true,
          snapThreshold: 10,
          width: 0.3,
        },
        () => {}
      );
    },
  },
  {
    key: "draw-marker",
    tip: "Add marker",
    icon: markRaw(MarkerIcon),
    click: () => {
      currentAction.value = "draw-marker";
    },
  },
]);
const renderOptionsLabel = (option: any) => {
  return (
    <NSpace>
      <NIcon component={option.icon}></NIcon>
      <NText>{option.label}</NText>
    </NSpace>
  );
};
onMounted(() => {});
</script>
<template>
  <div class="toolbar">
    <NSpace
      style="
        background-color: var(--nl-bg-color);
        padding: 5px;
        box-sizing: border-box;
        border-radius: 5px;
      "
      :size="0"
    >
      <div
        style="display: flex; align-items: center"
        v-for="action in actions"
        :key="action.key"
      >
        <n-popselect
          v-if="action.children"
          :options="action.children"
          trigger="hover"
          :render-label="renderOptionsLabel"
          @update:value="(_,option:any)=>{
            currentAction = action.key
            action.icon = option.icon
            option.click()
          }"
        >
          <NButton
            size="small"
            :type="currentAction === action.key ? 'primary' : 'default'"
            :quaternary="currentAction !== action.key"
            :render-icon="() => h(action.icon)"
            @click="action.click()"
          ></NButton>
        </n-popselect>
        <NTooltip v-else placement="bottom" :show-arrow="false">
          <template #trigger>
            <NButton
              size="small"
              :type="currentAction === action.key ? 'primary' : 'default'"
              :quaternary="currentAction !== action.key"
              :render-icon="() => h(action.icon)"
              @click="action.click()"
            ></NButton>
          </template>
          {{ action.tip }}
        </NTooltip>
        <NDivider vertical></NDivider>
      </div>
    </NSpace>
  </div>
</template>
<style scoped>
.toolbar {
  position: absolute;
  height: 45px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
