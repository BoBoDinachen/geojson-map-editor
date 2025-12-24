<script setup lang="tsx">
import { DrawModeEnum } from '@/core/draw_modes'
import { groundLayer } from '@/stores/LayersStore'
import { NButton, NColorPicker, NInputNumber, NSlider, NSpace } from 'naive-ui'
import { TableColumn } from 'naive-ui/es/data-table/src/interface'
import { reactive, ref } from 'vue'
import { Delete } from '@vicons/carbon'
import UndoRedoManager from '@/core/manager/UndoRedoManager'
import { RemoveFeatureAction } from '@/core/actions/index'

defineOptions({
  name: 'GroundLayer',
})

const DrawGroundHook = {
  state: reactive({
    drawMode: DrawModeEnum.POLYGON_MODE,
    drawing: false,
    properties:
      groundLayer.value?.getFeatureProperties() ??
      ({
        stroke: '#000000',
        'stroke-width': 1,
        'stroke-opacity': 1,
        fill: '#64e2b7',
        'fill-opacity': 1,
        height: 0.1,
        base_height: 0,
        color: '#64e2b7',
      } as FeatureProperties),
  }),
  stopDraw: null as any,
  startDraw() {
    const self = DrawGroundHook
    self.state.drawing = true
    self.stopDraw = groundLayer.value?.drawGround(self.state.drawMode, () => {
      self.state.drawing = false
    })
  },
  cancelDraw() {
    const self = DrawGroundHook
    self.stopDraw()
    self.state.drawing = false
  },
}

const GroundFeauresManager = {
  columns: [
    {
      title: 'Label',
      key: 'properties.index',
      render(rowData: any, rowIndex) {
        return `Ground-${rowData.properties.index}`
      },
    },
    {
      title: 'Fill Height(m)',
      key: 'properties.height',
      render(rowData: any, rowIndex) {
        return (
          <n-input-number
            style="width: 90px"
            min={0.01}
            step={0.1}
            value={rowData.properties.height}
            onUpdateValue={(value: number) => {
              GroundFeauresManager.onChangeFillHeight(rowData.properties.index, value)
            }}
            size="small"
          />
        )
      },
    },
    {
      title: 'Color',
      key: 'properties.color',
      render(rowData: any, rowIndex) {
        return (
          <NColorPicker
            show-alpha={false}
            value={rowData.properties.color}
            onUpdateValue={(value: string) => {
              GroundFeauresManager.onChangeColor(rowData.properties.index, value)
            }}
          />
        )
      },
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render(rowData: any, rowIndex) {
        return (
          <n-button
            text
            style="font-size: 24px"
            onClick={() => {
              window.$dialog.warning({
                title: 'Delete Wall',
                content: 'Are you sure you want to delete this wall?',
                positiveText: 'Yes',
                negativeText: 'No',
                onPositiveClick: () => {
                  UndoRedoManager.execute(new RemoveFeatureAction(groundLayer.value!, rowData))
                },
              })
            }}
          >
            <n-icon>
              <Delete />
            </n-icon>
          </n-button>
        )
      },
    },
  ] as TableColumn[],

  onChangeOpacity(index: number, opacity: number) {
    groundLayer.value?.updateFeature(index, { opacity })
  },
  onChangeColor(index: number, color: string) {
    groundLayer.value?.updateFeature(index, { color })
  },

  onChangeFillHeight(index: number, height: number) {
    groundLayer.value?.updateFeature(index, { height })
  },

  removeAllGround() {
    window.$dialog.warning({
      title: 'Delete All grounds',
      content: 'Are you sure you want to delete all grounds?',
      positiveText: 'Yes',
      negativeText: 'No',
      onPositiveClick: () => {
        groundLayer.value?.removeAllFeatures()
      },
    })
  },
}
</script>
<template>
  <div class="ground-layer-container">
    <NCard title="Draw Ground" size="small">
      <NFormItem label="Draw Mode:" label-placement="left">
        <n-radio-group v-model:value="DrawGroundHook.state.drawMode">
          <n-radio :value="DrawModeEnum.RECTANGLE_MODE"> Rectangle </n-radio>
          <n-radio :value="DrawModeEnum.POLYGON_MODE">Polygon</n-radio>
          <n-radio :value="DrawModeEnum.CIRCLE_MODE">Circle</n-radio>
        </n-radio-group>
      </NFormItem>
      <NFormItem label="Fill Color:" label-placement="left">
        <NColorPicker v-model:value="DrawGroundHook.state.properties.color" :show-alpha="false" />
      </NFormItem>
      <NSpace>
        <NButton
          :disabled="DrawGroundHook.state.drawing"
          @click="DrawGroundHook.startDraw"
          type="primary"
          >Start Draw</NButton
        >
        <NButton v-if="DrawGroundHook.state.drawing" @click="DrawGroundHook.cancelDraw"
          >Cancel</NButton
        >
      </NSpace>
    </NCard>
    <NCard title="Features" size="small">
      <template #header-extra>
        <NButton size="small" @click="GroundFeauresManager.removeAllGround">Delete All</NButton>
      </template>
      <NDataTable
        size="small"
        :data="groundLayer?.getFeatures()"
        :columns="GroundFeauresManager.columns"
        :pagination="{ pageSize: 10 }"
        :scroll-x="350"
      />
    </NCard>
  </div>
</template>
<style lang="scss" scoped>
.ground-layer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
