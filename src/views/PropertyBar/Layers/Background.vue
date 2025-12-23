<script setup lang="ts">
import { backgroundLayer } from '@/stores/LayersStore'
import { ref, onMounted, reactive, onUnmounted } from 'vue'
import { StorageHandler } from '@/storage-handler/index'
import editor from '@/core/Editor'
import { MapOptions } from 'mapbox-gl'
import { UploadFileInfo } from 'naive-ui'
import { getLngLatCoordinatesByCenter, loadImageWAndH } from '@/utils'

defineOptions({
  name: 'BackgroundLayer',
})

const isDisabled = ref(true)
const formData = reactive({
  baseMapUrl: 'mapbox://styles/mapbox/dark-v11',
  token:
    'pk.eyJ1Ijoia2FuZ2JvNDkyNiIsImEiOiJjbHA5OGd1ZWEyOXA3MmtzMTZjeXlsYzkzIn0._hOucYQXZaXSzkcSO63SOA',
  files: [],
})
const initFormData = () => {
  const config = StorageHandler.getBaseMapConfig()
  if (config) {
    formData.baseMapUrl = config.url
    formData.token = config.token
  }
}
const updateBaseMap = () => {
  StorageHandler.saveBaseMapConfig({
    url: formData.baseMapUrl,
    token: formData.token,
  })
  const options: Partial<MapOptions> = {
    accessToken: formData.token || ' ',
    style: formData.baseMapUrl || {
      version: 8,
      glyphs: '/fonts/{fontstack}/{range}.pbf',
      sources: {},
      layers: [],
      zoom: 20,
      center: [0, 0],
      metadata: {},
    },
  }
  editor.reloadMap(options)
}
async function onFileChange(options: {
  file: UploadFileInfo
  fileList: Array<UploadFileInfo>
  event?: Event
}) {
  console.log('onFileChange', options)
  const file = options.file.file!
  // 支持图片类型
  if (file.type == 'image/png' || file.type == 'image/jpeg' || file.type == 'image/jpg') {
    const url = URL.createObjectURL(new Blob([file!], { type: file?.type }))
    const { width: imageWidth, height: imageHeight } = await loadImageWAndH(url) // 为了计算新图片的高宽比
    const ratio = imageHeight / imageWidth
    const lngLatBounds = getLngLatCoordinatesByCenter(editor.mapRenderer!.getCenter(), 100, ratio)
    backgroundLayer.value?.addMapImageLayer(url, lngLatBounds)
  }
}

function removeImage() {
  formData.files = []
  backgroundLayer.value?.removeMapImageLayer()
}
onMounted(() => {
  initFormData()
})
onUnmounted(() => {
  formData.files = []
})
</script>
<template>
  <div class="background-layer-container">
    <NCard title="Display">
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
    <NCard title="Base Map style">
      <NFormItem label="Base Map URL:">
        <NInput
          v-model:value="formData.baseMapUrl"
          @update:value="
            () => {
              isDisabled = false
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
              isDisabled = false
            }
          "
        ></NInput>
      </NFormItem>
      <NSpace>
        <NButton @click="updateBaseMap" type="primary" :disabled="isDisabled">Update</NButton>
      </NSpace>
    </NCard>
    <NCard title="Image">
      <NSpace vertical>
        <NSpace>
          <n-upload
            v-model:file-list="formData.files"
            @change="onFileChange"
            accept=".png, .jpeg, .jpg, .geojson"
            :default-upload="false"
            :max="1"
            :show-file-list="false"
          >
            <n-button>Select Image</n-button>
          </n-upload>
          <NButton @click="removeImage">Remove Image</NButton>
        </NSpace>
        <NCheckbox
          :checked="backgroundLayer?.isEnableMoveMapImage"
          @update:checked="
            (v) => {
              v ? backgroundLayer?.enableMoveMapImage() : backgroundLayer?.disableMoveMapImage()
            }
          "
          >Move Image</NCheckbox
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
