<script lang="ts" setup>
import type { Component } from 'vue'
import General from './General.vue'
import Preview from './Preview.vue'
import About from './About.vue'
defineOptions({
  name: 'SettingsModal',
})
type Pane = {
  key: string
  tab: string
  component: Component
}
const panes: Array<Pane> = [
  {
    key: 'general',
    tab: 'General',
    component: General,
  },
  {
    key: 'about',
    tab: 'About',
    component: About,
  },
]
</script>
<template>
  <NModal preset="card" title="Settings" style="width: 800px;height: 400px;">
    <n-tabs type="line" animated placement="left" style="height: 100%;">
      <n-tab-pane :name="pane.key" :tab="pane.tab" v-for="pane in panes" :key="pane.key">
        <component :is="pane.component"></component>
      </n-tab-pane>
    </n-tabs>
  </NModal>
</template>
<style scoped></style>
