<script lang="ts" setup>
import SettingsManager from "@/stores/SettingsManager";
import type { Component } from "vue";
import Editor from "./Editor.vue";
import General from "./General.vue";
import Preview from "./Preview.vue";
defineOptions({
  name: 'SettingsModal'
})
type Pane = {
  key: string
  tab: string
  component: Component
}
const panes:Array<Pane> = [
  {
    key: 'general',
    tab: 'General',
    component: General
  },
  {
    key: 'edit',
    tab: 'Editor',
    component: Editor
  },
  {
    key: 'preview',
    tab: 'Preview',
    component: Preview
  }
]
</script>
<template>
  <NModal preset="card" title="Settings" style="width: 800px">
    <n-tabs type="line" animated placement="left">
      <n-tab-pane
        :name="pane.key"
        :tab="pane.tab"
        v-for="pane in panes"
        :key="pane.key"
      >
        <component :is="pane.component"></component>
      </n-tab-pane>
    </n-tabs>
  </NModal>
</template>
<style scoped></style>
