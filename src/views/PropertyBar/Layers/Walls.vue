<script setup lang="tsx">
import { reactive, ref } from "vue";
import { groundLayer, wallsLayer } from "@/stores/LayersStore";
import { NInputNumber, NColorPicker, NSpace, NButton } from "naive-ui";
import { TableColumn } from "naive-ui/es/data-table/src/interface";
import { Delete } from "@vicons/carbon";

defineOptions({
  name: "WallsLayer",
});
const DrawWallsManager = {
  state: reactive({
    drawing: false,
    enableSnap: true,
    snapThreshold: 10, // 单位像素
    width: 0.3, //单位m
  }),
  properties:
    wallsLayer.value?.getFeatureProperties() ??
    ({
      height: 0.1,
      color: "#64e2b7",
    } as FeatureProperties),
  stopDraw: null as any,
  startDraw() {
    const self = DrawWallsManager;
    self.state.drawing = true;
    self.stopDraw = wallsLayer.value?.drawWall(
      {
        enableSnap: self.state.enableSnap,
        snapThreshold: self.state.snapThreshold,
        width: self.state.width,
      },
      () => {
        self.state.drawing = false;
      }
    );
  },
  cancelDraw() {
    const self = DrawWallsManager;
    self.stopDraw();
    self.state.drawing = false;
  },
};
const WallFeauresManager = {
  columns: [
    {
      title: "Label",
      key: "properties.index",
      render(rowData: any, rowIndex) {
        return `Wall-${rowData.properties.index}`;
      },
    },
    {
      title: "Height (m)",
      key: "properties.height",
      render(rowData: any, rowIndex) {
        return (
          <NInputNumber
            style="width: 90px"
            min={0.1}
            value={rowData.properties.height}
            updateValueOnInput={false}
            onUpdateValue={(value: number) => {
              WallFeauresManager.onChangeFillHeight(
                rowData.properties.index,
                value
              );
            }}
            size="small"
          />
        );
      },
    },
    {
      title: "Width (m)",
      key: "properties.width",
      render(rowData: any, rowIndex) {
        return (
          <NInputNumber
            style="width: 90px"
            min={0.1}
            value={rowData.properties.width}
            updateValueOnInput={false}
            onUpdateValue={(value: number) => {
              WallFeauresManager.onChangeWidth(rowData.properties.index, value);
            }}
            size="small"
          />
        );
      },
    },
    {
      title: "Color",
      key: "properties.color",
      render(rowData: any, rowIndex) {
        return (
          <NColorPicker
            show-alpha={false}
            value={rowData.properties.color}
            onUpdateValue={(value: string) => {
              WallFeauresManager.onChangeColor(rowData.properties.index, value);
            }}
          />
        );
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render(rowData: any, rowIndex) {
        return (
          <n-button
            text
            style="font-size: 24px"
            onClick={() => {
              window.$dialog.warning({
                title: "Delete Wall",
                content: "Are you sure you want to delete this wall?",
                positiveText: "Yes",
                negativeText: "No",
                onPositiveClick: () => {
                  wallsLayer.value?.removeFeature(rowData.properties.index);
                },
              });
            }}
          >
            <n-icon>
              <Delete />
            </n-icon>
          </n-button>
        );
      },
    },
  ] as TableColumn[],

  onChangeColor(index: number, color: string) {
    wallsLayer.value?.updateFeature(index, { color });
  },

  onChangeWidth(index: number, width: number) {
    wallsLayer.value?.updateWallWidth(index, width);
  },

  onChangeFillHeight(index: number, height: number) {
    wallsLayer.value?.updateFeature(index, { height });
  },

  removeAllWall() {
    window.$dialog.warning({
      title: "Delete All Walls",
      content: "Are you sure you want to delete all walls?",
      positiveText: "Yes",
      negativeText: "No",
      onPositiveClick: () => {
        wallsLayer.value?.removeAllFeatures();
      },
    });
  },
};
</script>
<template>
  <div class="walls-layer-container">
    <NCard title="Layer Style" size="small">
      <NFormItem
        label="Wall Opacity:"
        label-placement="left"
        :label-width="100"
        label-align="left"
      >
        <NSlider
          :min="0"
          :max="1"
          :step="0.1"
          :value="wallsLayer?.getOpacity()"
          @update:value="
            (v) => {
              wallsLayer?.changeWallsOpacity(v);
            }
          "
        ></NSlider>
      </NFormItem>
    </NCard>
    <NCard title="Draw Settings" size="small">
      <NFormItem
        label="Wall Width (m):"
        label-placement="left"
        :label-width="125"
        label-align="left"
      >
        <NSlider v-model:value="DrawWallsManager.state.width"></NSlider>
        <NInputNumber
          v-model:value="DrawWallsManager.state.width"
          placeholder=""
          style="margin-left: 10px"
          size="small"
        ></NInputNumber>
      </NFormItem>
      <NFormItem
        label="Wall Height (m):"
        label-placement="left"
        :label-width="125"
        label-align="left"
      >
        <NSlider v-model:value="DrawWallsManager.properties.height"></NSlider>
        <NInputNumber
          v-model:value="DrawWallsManager.properties.height"
          placeholder=""
          style="margin-left: 10px"
          size="small"
        ></NInputNumber>
      </NFormItem>
      <NFormItem
        label="Color:"
        label-placement="left"
        :label-width="100"
        label-align="left"
      >
        <NColorPicker
          v-model:value="DrawWallsManager.properties.color"
          :show-alpha="false"
        ></NColorPicker>
      </NFormItem>
      <NFormItem
        label="Enable Snap:"
        label-placement="left"
        :label-width="100"
        label-align="left"
      >
        <NSwitch v-model:value="DrawWallsManager.state.enableSnap"></NSwitch>
      </NFormItem>
      <NFormItem
        label="Snap Threshold (px):"
        label-placement="left"
        :label-width="150"
        label-align="left"
      >
        <NSlider v-model:value="DrawWallsManager.state.snapThreshold"></NSlider>
      </NFormItem>
      <NSpace>
        <NButton
          :disabled="DrawWallsManager.state.drawing"
          @click="DrawWallsManager.startDraw"
          type="primary"
          >Start Draw</NButton
        >
        <NButton
          @click="DrawWallsManager.cancelDraw"
          v-if="DrawWallsManager.state.drawing"
          >Cancel</NButton
        >
      </NSpace>
    </NCard>
    <NCard title="Wall Features" size="small">
      <template #header-extra>
        <NButton size="small" @click="WallFeauresManager.removeAllWall"
          >Delete All</NButton
        >
      </template>
      <NDataTable
        size="small"
        :data="wallsLayer?.getFeatures()"
        :columns="WallFeauresManager.columns"
        :pagination="{ pageSize: 10 }"
        :scroll-x="400"
      />
    </NCard>
  </div>
</template>
<style scoped lang="scss">
.walls-layer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
