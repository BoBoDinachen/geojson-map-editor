<script setup lang="ts">
import editor from "@/core/Editor";
import { Utils } from "@/utils";
import { onMounted, onUnmounted, reactive } from "vue";
defineOptions({
  name: "ToolsPanel",
});

const CoordinatePickupHook = {
  state: reactive({
    drawing: false,
  }),
  stopDraw: null as any,
  drawPoint() {
    const self = CoordinatePickupHook;
    const drawInstance = editor.getDrawManager();
    self.state.drawing = true;
    self.stopDraw = drawInstance?.drawPoint(
      (feature) => {
        console.log(feature);
        //@ts-ignore
        const coordinates = feature.geometry.coordinates;
        Utils.copyToClipboard(`${coordinates[0]},${coordinates[1]}`);
        self.state.drawing = false;
      },
      () => {
        self.state.drawing = false;
      },
      {
        duration: 10000,
        deleteAll: true,
      }
    );
  },
  cancel() {
    const self = CoordinatePickupHook;
    self.state.drawing = false;
    self.stopDraw && self.stopDraw();
  },
};

const MeasureDistanceManager = {
  state: reactive({
    isDrawing: false,
  }),
  stopDraw: null as any,
  start() {
    const self = MeasureDistanceManager;
    const drawInstance = editor.getDrawManager();
    self.state.isDrawing = true;
    self.stopDraw = drawInstance?.drawMeasureLine(
      (feature) => {},
      () => {
        self.state.isDrawing = false;
      },
      {}
    );
  },
  cancel() {
    const self = MeasureDistanceManager;
    self.state.isDrawing = false;
    self.stopDraw && self.stopDraw();
  },
};
onMounted(() => {});
onUnmounted(() => {
  CoordinatePickupHook.cancel();
  MeasureDistanceManager.cancel();
});
</script>
<template>
  <div class="tools-panel">
    <NCard title="Coordinate Pickup" size="small">
      <NSpace vertical>
        <NSpace>
          <NButton
            :disabled="CoordinatePickupHook.state.drawing"
            size="small"
            type="primary"
            @click="CoordinatePickupHook.drawPoint"
            >Mark Point</NButton
          >
          <NButton
            v-if="CoordinatePickupHook.state.drawing"
            @click="CoordinatePickupHook.cancel"
            size="small"
            >Cancel</NButton
          >
        </NSpace>
      </NSpace>
    </NCard>
    <NCard size="small">
      <NSpace>
        <NButton
          size="small"
          type="primary"
          :disabled="MeasureDistanceManager.state.isDrawing"
          @click="MeasureDistanceManager.start"
          >Measure Distance</NButton
        >
        <NButton
          size="small"
          v-if="MeasureDistanceManager.state.isDrawing"
          @click="MeasureDistanceManager.cancel"
          >Cancel</NButton
        >
      </NSpace>
    </NCard>
  </div>
</template>
<style lang="scss">
.tools-panel {
  height: 100%;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>
