<script setup lang="tsx">
import { DrawModeEnum } from '@/core/draw_modes'
import { blockLayer } from '@/stores/LayersStore'
import { NButton, NColorPicker, NSpace } from 'naive-ui'
import { TableColumn } from 'naive-ui/es/data-table/src/interface'
import { reactive, ref } from 'vue'
import { Delete, Settings } from '@vicons/carbon'
import UndoRedoManager from '@/core/manager/UndoRedoManager'
import { RemoveFeatureAction } from '@/core/actions'
import { eventbus } from '@/utils/eventbus'
import { EventTypeEnum } from '@/core/enum/Event'

defineOptions({
  name: 'BlockLayer',
})

const DrawBlockHook = {
  state: reactive({
    drawMode: DrawModeEnum.POLYGON_MODE,
    drawing: false,
    properties:
      blockLayer.value?.getFeatureProperties() ??
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
    const self = DrawBlockHook
    self.state.drawing = true
    self.stopDraw = blockLayer.value?.drawBlock(self.state.drawMode, () => {
      self.state.drawing = false
    })
  },
  cancelDraw() {
    const self = DrawBlockHook
    self.stopDraw()
    self.state.drawing = false
  },
}

const BlockFeauresManager = {
  columns: [
    {
      title: 'Label',
      key: 'properties.index',
      render(rowData: any, rowIndex) {
        return rowData.properties.name
      },
    },
    {
      title: 'Base Height(m)',
      key: 'properties.base_height',
      render(rowData: any, rowIndex) {
        return (
          <n-input-number
            style="width: 90px"
            min={0.1}
            value={rowData.properties.height}
            onUpdateValue={(value: number) => {
              BlockFeauresManager.onChangeBaseHeight(rowData.properties.index, value)
            }}
            size="small"
          />
        )
      },
    },
    {
      title: 'Fill Height(m)',
      key: 'properties.height',
      render(rowData: any, rowIndex) {
        return (
          <n-input-number
            style="width: 90px"
            min={0.1}
            value={rowData.properties.height}
            onUpdateValue={(value: number) => {
              BlockFeauresManager.onChangeFillHeight(rowData.properties.index, value)
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
              BlockFeauresManager.onChangeColor(rowData.properties.index, value)
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
          <NSpace justify="center">
            <NButton
              text
              style="font-size:24px"
              onClick={() => {
                eventbus.emit(EventTypeEnum.SELECT_FEATURE, { feature: rowData })
              }}
            >
              <n-icon>
                <Settings />
              </n-icon>
            </NButton>
            <n-button
              text
              style="font-size: 24px"
              onClick={() => {
                window.$dialog.warning({
                  title: 'Delete block',
                  content: 'Are you sure you want to delete this block?',
                  positiveText: 'Yes',
                  negativeText: 'No',
                  onPositiveClick: () => {
                    UndoRedoManager.execute(new RemoveFeatureAction(blockLayer.value!, rowData))
                  },
                })
              }}
            >
              <n-icon>
                <Delete />
              </n-icon>
            </n-button>
          </NSpace>
        )
      },
    },
  ] as TableColumn[],

  onChangeColor(index: number, color: string) {
    blockLayer.value?.updateFeature(index, { color })
  },

  onChangeFillHeight(index: number, height: number) {
    blockLayer.value?.updateFeature(index, { height })
  },

  onChangeBaseHeight(index: number, height: number) {
    blockLayer.value?.updateFeature(index, { base_height: height })
  },

  removeAllBlock() {
    window.$dialog.warning({
      title: 'Delete All Blocks',
      content: 'Are you sure you want to delete all blocks?',
      positiveText: 'Yes',
      negativeText: 'No',
      onPositiveClick: () => {
        blockLayer.value?.removeAllFeatures()
      },
    })
  },
}
</script>
<template>
  <div class="ground-layer-container">
    <NCard title="Draw Block" size="small">
      <NFormItem label="Draw Mode:" label-placement="left">
        <n-radio-group v-model:value="DrawBlockHook.state.drawMode">
          <n-radio :value="DrawModeEnum.RECTANGLE_MODE"> Rectangle </n-radio>
          <n-radio :value="DrawModeEnum.POLYGON_MODE">Polygon</n-radio>
          <n-radio :value="DrawModeEnum.CIRCLE_MODE">Circle</n-radio>
        </n-radio-group>
      </NFormItem>
      <NFormItem label="Fill Color:" label-placement="left">
        <NColorPicker v-model:value="DrawBlockHook.state.properties.color" :show-alpha="false" />
      </NFormItem>
      <NFormItem label="Fill Height:" label-placement="left">
        <NSlider v-model:value="DrawBlockHook.state.properties.height" />
        <n-input-number
          :min="0.1"
          style="margin-left: 10px"
          v-model:value="DrawBlockHook.state.properties.height"
          size="small"
        />
      </NFormItem>
      <!-- <NFormItem label="Fill Base Height:" label-placement="left">
        <NSlider v-model:value="DrawBlockHook.state.properties.base_height" />
      </NFormItem> -->
      <NSpace>
        <NButton
          :disabled="DrawBlockHook.state.drawing"
          @click="DrawBlockHook.startDraw"
          type="primary"
          >Start Draw</NButton
        >
        <NButton v-if="DrawBlockHook.state.drawing" @click="DrawBlockHook.cancelDraw"
          >Cancel</NButton
        >
      </NSpace>
    </NCard>
    <NCard title="Features" size="small">
      <template #header-extra>
        <NButton size="small" type="error" @click="BlockFeauresManager.removeAllBlock">Delete All</NButton>
      </template>
      <NDataTable
        size="small"
        :data="blockLayer?.getFeatures()"
        :columns="BlockFeauresManager.columns"
        :pagination="{ pageSize: 10 }"
        :scroll-x="450"
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
