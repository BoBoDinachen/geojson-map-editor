<script lang="ts" setup>
import { Component, h } from 'vue';
import { Layers,ViewFilled,ViewOffFilled,Locked,Unlocked } from "@vicons/carbon";

defineOptions({
  name: 'Sidebar'
})
type LayerItem = {
  key: string
  name: string
  icon: Component
  visibility: boolean
  locked:boolean
}
const layers:Array<LayerItem> = [
  {
    key: 'icon',
    name: 'Icons',
    icon: Layers,
    visibility: true,
    locked:false
  },
  {
    key: 'label',
    name: 'Label',
    icon: Layers,
    visibility: true,
    locked:false
  },
  {
    key: 'fill',
    name: 'Fill',
    icon: Layers,
    visibility: true,
    locked:false
  },
  {
    key: 'ground',
    name: 'Ground',
    icon: Layers,
    visibility: true,
    locked:true
  },
  {
    key: 'background',
    name: 'Background',
    icon: Layers,
    visibility: true,
    locked:true
  }
]
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
            <NSpace align="center" style="cursor: pointer;">
              <NIcon :component="layer.icon"></NIcon>
              <span>{{ layer.name }}</span>
            </NSpace>
            <NSpace>
              <n-button
                text
                style="font-size: 24px"
                :render-icon="()=>h(layer.visibility?ViewFilled:ViewOffFilled)"
                :disabled="layer.locked"
              >
              </n-button>
              <NTooltip placement="bottom">
                <template #trigger>
                  <n-button
                    text
                    :color="layer.locked?'#414855':''"
                    style="font-size: 24px"
                    :render-icon="()=>h(layer.locked?Locked:Unlocked)"
                  >
                  </n-button>
                </template>
                {{ layer.locked ? 'Unlock' : 'Lock'}}
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
.container{
    width: 300px;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid var(--nl-border-color);
}
.container .layer-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    box-sizing: border-box;
    border: 1px solid var(--nl-border-color);
}
</style>
