<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { FeatureType } from '@/core/enum/Layer'
import { blockLayer, groundLayer, wallsLayer } from '@/stores/LayersStore'
import { eventbus } from '@/utils/eventbus'
import { EventTypeEnum } from '@/core/enum/Event'

defineOptions({
  name: 'FeaturePanel',
})

const props = defineProps<{
  feature: any
}>()

const formData = ref(props.feature?.properties)
const enableEdit = ref(false)

watch(
  () => props.feature,
  (newVal, oldVal) => {
    disableDrawFeature()
    formData.value = newVal?.properties
  }
)

const title = computed(() => {
  return props.feature?.properties['name'] ?? 'Unknown'
})

const changeFeatureProps = (key: string, value: any) => {
  const featureIndex = props.feature.properties['index']
  formData.value[key] = value
  switch (props.feature.properties['type']) {
    case FeatureType.Ground:
      blockLayer.value?.updateFeature(featureIndex, {
        [key]: value,
      })
      break
    case FeatureType.Block:
      blockLayer.value?.updateFeature(featureIndex, {
        [key]: value,
      })
      break
    case FeatureType.Wall:
      if (key === 'width') {
        wallsLayer.value?.updateWallWidth(featureIndex, value)
      } else {
        wallsLayer.value?.updateFeature(featureIndex, {
          [key]: value,
        })
      }
      break
    default:
      break
  }
}

function enableDrawFeature() {
  const featureType = props.feature.properties['type']
  enableEdit.value = true
  switch (featureType) {
    case FeatureType.Ground:
      groundLayer.value?.enableEditGround(props.feature.id)
      break
    case FeatureType.Block:
      blockLayer.value?.enableEditBlock(props.feature.id)
      break
    case FeatureType.Wall:
      wallsLayer.value?.enableEditWalls(props.feature.id)
      break
    default:
      break
  }
}

function disableDrawFeature() {
  enableEdit.value = false
  groundLayer.value?.stopDraw()
  blockLayer.value?.stopDraw()
  wallsLayer.value?.stopDraw()
}

const handleRemoveFeature = () => {
  window.$dialog.warning({
    title: 'Remove Feature',
    content: 'Are you sure you want to remove this feature?',
    positiveText: 'Yes',
    negativeText: 'No',
    onPositiveClick: () => {
      switch (props.feature.properties['type']) {
        case FeatureType.Block:
          blockLayer.value?.removeFeatureById(props.feature.id)
          break
        case FeatureType.Wall:
          wallsLayer.value?.removeFeatureById(props.feature.id)
          break
        default:
          break
      }
      eventbus.emit(EventTypeEnum.SELECT_FEATURE, { feature: null })
    },
  })
}

onMounted(() => {})
onUnmounted(() => {
  disableDrawFeature()
})
</script>
<template>
  <div class="feature-container">
    <n-empty v-if="!feature" description="No Selected Feature"> </n-empty>
    <NCard v-else :title="title" size="small">
      <n-form-item label="Feature Type" label-placement="left">
        <n-tag type="info">{{ props.feature.properties['type'] }}</n-tag>
      </n-form-item>
      <NFormItem label="Feature Name">
        <n-input
          :value="formData.name ?? ''"
          @update:value="
            (v) => {
              changeFeatureProps('name', v)
            }
          "
        ></n-input>
      </NFormItem>
      <n-form-item
        v-if="feature.properties.type === FeatureType.Block"
        label="Base Height (m)"
        label-placement="left"
      >
        <n-input-number
          :value="formData.base_height"
          @update:value="
            (v) => {
              changeFeatureProps('base_height', v)
            }
          "
        ></n-input-number>
      </n-form-item>
      <n-form-item label="Fill Height (m)" label-placement="left">
        <n-input-number
          :value="formData.height"
          @update:value="
            (v) => {
              changeFeatureProps('height', v)
            }
          "
        ></n-input-number>
      </n-form-item>
      <n-form-item
        v-if="feature.properties.type === FeatureType.Wall"
        label="Wall Width (m)"
        label-placement="left"
      >
        <n-input-number
          :value="formData.width"
          @update:value="
            (v) => {
              changeFeatureProps('width', v)
            }
          "
        ></n-input-number>
      </n-form-item>
      <n-form-item label="Fill Color" label-placement="left">
        <NColorPicker
          :value="formData.color"
          @update:value="
            (v) => {
              changeFeatureProps('color', v)
            }
          "
          :show-alpha="false"
        ></NColorPicker>
      </n-form-item>
      <n-form-item label="Enable Draw" label-placement="left">
        <NSwitch
          :value="enableEdit"
          @update:value="
            (v) => {
              v ? enableDrawFeature() : disableDrawFeature()
            }
          "
        ></NSwitch>
      </n-form-item>
      <template #action>
        <NButton type="error" @click="handleRemoveFeature">Remove</NButton>
      </template>
    </NCard>
    <!-- <div>{{ feature }}</div> -->
  </div>
</template>
<style lang="scss">
.feature-container {
  height: 100%;
  padding: 20px;
}
</style>
