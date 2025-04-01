<script setup lang="ts">
import { backgroundLayer } from "@/stores/LayersStore";
import { ref, onMounted, reactive } from "vue";
import { StorageHandler } from "@/storage-handler/index";
import editor from "@/core/Editor";
import { MapOptions } from "mapbox-gl";

defineOptions({
  name: "BackgroundLayer",
});

const isDisabled = ref(true);
const formData = reactive({
  baseMapUrl: "mapbox://styles/mapbox/dark-v11",
  token:
    "pk.eyJ1Ijoia2FuZ2JvNDkyNiIsImEiOiJjbHA5OGd1ZWEyOXA3MmtzMTZjeXlsYzkzIn0._hOucYQXZaXSzkcSO63SOA",
});
const initFormData = () => {
  const config = StorageHandler.getBaseMapConfig();
  if (config) {
    formData.baseMapUrl = config.url;
    formData.token = config.token;
  }
};
const updateBaseMap = () => {
  StorageHandler.saveBaseMapConfig({
    url: formData.baseMapUrl,
    token: formData.token,
  });
  const options: Partial<MapOptions> = {
    accessToken: formData.token || " ",
    style: formData.baseMapUrl || {
      version: 8,
      glyphs: "/fonts/{fontstack}/{range}.pbf",
      sources: {},
      layers: [],
      zoom: 20,
      center: [0, 0],
      metadata: {},
    },
  };
  editor.reloadMap(options);
};
onMounted(() => {
  initFormData();
});
</script>
<template>
  <div class="background-layer-container">
    <NCard title="Dispaly">
      <NSpace
        ><NCheckbox
          :checked="backgroundLayer?.showBaseMap"
          @update:checked="(v:boolean)=>backgroundLayer?.changeShowBaseMap(v)"
          >Show Base Map</NCheckbox
        >
        <NCheckbox
          :checked="backgroundLayer?.showGrid"
          @update:checked="(v:boolean)=>backgroundLayer?.changeShowGrid(v)"
          >Show Grid Background</NCheckbox
        ></NSpace
      >
    </NCard>
    <NCard title="Set Base Map">
      <NFormItem label="Base Map URL:">
        <NInput
          v-model:value="formData.baseMapUrl"
          @update:value="
            () => {
              isDisabled = false;
            }
          "
        ></NInput>
      </NFormItem>
      <NFormItem label="Token:">
        <NInput
          v-model:value="formData.token"
          type="textarea"
          @update:value="
            () => {
              isDisabled = false;
            }
          "
        ></NInput>
      </NFormItem>
      <NSpace>
        <NButton @click="updateBaseMap" type="primary" :disabled="isDisabled"
          >Update</NButton
        >
      </NSpace>
    </NCard>
  </div>
</template>
<style lang="scss" scoped>
.background-layer-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
