<script lang="ts" setup>
import { h, ref, useTemplateRef } from "vue";
import { Undo, Redo, Settings, Save, ViewFilled } from "@vicons/carbon";
import ThemeSwitch from "@/views/components/ThemeSwitch.vue";
import SettingsModal from "../settings/index.vue";
import ExportModal from "./ExportModal.vue";
import * as turf from "@turf/turf";
import { UploadFileInfo, UploadInst } from "naive-ui";
import { wallsLayer, groundLayer } from "@/stores/LayersStore";
import editor from "@/core/Editor";
import { LngLatBoundsLike } from "mapbox-gl";

const showSettingsModal = ref(false);
const showExportModal = ref(false);
const uploadRef = useTemplateRef<UploadInst>("upload");

const handleImport = (uploadFile: UploadFileInfo) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const geojsonData = JSON.parse(String(e.target?.result)); // 解析 JSON
      console.log("GEOJSON 数据:", geojsonData);
      const newLngLatBounds = turf.bbox(geojsonData) as LngLatBoundsLike;
      wallsLayer.value?.setFeatures(geojsonData.features);
      groundLayer.value?.setFeatures(geojsonData.features);
      editor.map?.mapInstance?.fitBounds(newLngLatBounds, {
        padding: 50,
        duration: 1000,
      });
      window.$message.success("Import Success");
    } catch (error) {
      console.error("JSON 解析错误:", error);
    }
  };
  const blob = new Blob([uploadFile.file!], { type: "application/json" });
  reader.readAsText(blob);
};

defineOptions({
  name: "Header",
});
</script>
<template>
  <div class="container">
    <div class="logo">Map Editor</div>
    <div class="operate-items">
      <div class="left">
        <NDivider vertical></NDivider>
        <NSpace :size="12">
          <NButton :disabled="true" :render-icon="() => h(Save)">
            Save
          </NButton>
          <NButton :render-icon="() => h(ViewFilled)"> Preview </NButton>
        </NSpace>
        <NDivider vertical></NDivider>
        <NSpace align="end">
          <NButton secondary strong :render-icon="() => h(Undo)"></NButton>
          <NButton secondary strong :render-icon="() => h(Redo)"></NButton>
        </NSpace>
      </div>
      <div class="right">
        <NUpload
          ref="upload"
          name="file"
          accept=".geojson"
          @change="
            (e) => {
              handleImport(e.file);
            }
          "
          :show-file-list="false"
        >
          <NButton>Import</NButton>
        </NUpload>
        <NButton @click="showExportModal = true">Export</NButton>
        <ThemeSwitch></ThemeSwitch>
        <NButton
          :render-icon="() => h(Settings)"
          @click="showSettingsModal = true"
          >Settings</NButton
        >
      </div>
    </div>
    <SettingsModal v-model:show="showSettingsModal"></SettingsModal>
    <ExportModal v-model:show="showExportModal"></ExportModal>
  </div>
</template>
<style scoped>
.container {
  display: flex;
  justify-content: start;
  align-items: center;
  height: 60px;
  padding: 0 24px;
}
.logo {
  font-size: 24px;
  font-weight: 600;
}
.operate-items {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-left: 24px;
  height: 100%;
}
.operate-items .left {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 12px;
}
.operate-items .right {
  display: flex;
  justify-content: end;
  align-items: center;
  gap: 12px;
}
</style>
