<script lang="tsx" setup>
import { Component, h, markRaw, onMounted, reactive, ref } from 'vue';
import editor from "@/core/Editor";
import { Area,Move,SelectWindow,AreaCustom,CircleDash,Workspace as WallIcon,Bookmark as MarkerIcon } from "@vicons/carbon";
import { NButton, NDivider, NIcon, NSpace, NText } from 'naive-ui';
defineOptions({
  name: 'Toolbar'
})
const currentAction = ref('select')
interface Action {
  key: string,
  tip: string,
  icon: Component,
  children?: Array<{
    label: string,
    value: string,
    tip: string,
    icon: Component
    click: Function
  }>,
  click: Function
}
const actions:Array<Action> = reactive([
  {
    key: 'move',
    tip: 'Move Feature',
    icon: markRaw(Move),
    click: () => {
      currentAction.value = 'move'
    }
  },
  {
    key: 'select',
    tip: 'Select Feature',
    icon: markRaw(SelectWindow),
    click: () => {
      currentAction.value = 'select'
    }
  },
  {
    key: 'draw-fill',
    tip: 'Draw Fill Feature',
    icon: markRaw(Area),
    click: () => {
      currentAction.value = 'draw-fill'
    },
    children: [
      {
        label: 'Rectangle',
        value: 'draw-fill-rectangle',
        tip: 'Draw Rectangle',
        icon: markRaw(Area),
        click: () =>{
          window.$message.info("draw-fill-rectangle");
        }
      },
      {
        label: 'Polygon',
        value: 'draw-fill-polygon',
        tip: 'Draw Polygon',
        icon: markRaw(AreaCustom),
        click: () =>{
          window.$message.info("draw-fill-polygon");
        }
      },
      {
        label: 'Circle',
        value: 'draw-fill-circle',
        tip: 'Draw Circle',
        icon: markRaw(CircleDash),
        click: () =>{
          window.$message.info("draw-fill-circle");
        }
      }
    ],
  },
  {
    key: 'draw-wall',
    tip: 'Draw wall',
    icon: markRaw(WallIcon),
    click: () => {
      currentAction.value = 'draw-wall'
    }
  },
  {
    key: 'draw-marker',
    tip: 'Add marker',
    icon: markRaw(MarkerIcon),
    click: () => {
      currentAction.value = 'draw-marker'
    }
  },
])
const renderOptionsLabel = (option:any)=>{
  return <NSpace>
    <NIcon component={option.icon}></NIcon>
    <NText>{option.label}</NText>
  </NSpace>
}
onMounted(()=>{
})
</script>
<template>
  <div class="toolbar">
    <NSpace
      style="background-color: var(--nl-bg-color);padding: 5px;box-sizing: border-box;border-radius: 5px;"
      :size="0"
    >
      <div
        style="display: flex;align-items: center;"
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
            :type="currentAction === action.key ? 'primary':'default'"
            :quaternary="currentAction !== action.key"
            :render-icon="()=>h(action.icon)"
            @click="action.click()"
          ></NButton>
        </n-popselect>
        <NTooltip v-else placement="bottom" :show-arrow="false">
          <template #trigger>
            <NButton
              size="small"
              :type="currentAction === action.key ? 'primary':'default'"
              :quaternary="currentAction !== action.key"
              :render-icon="()=>h(action.icon)"
              @click="action.click()"
            ></NButton>
          </template>
          {{action.tip}}
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
