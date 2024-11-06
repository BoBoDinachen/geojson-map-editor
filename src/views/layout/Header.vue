<script lang="ts" setup>
import { h, ref } from 'vue';
import { Undo,Redo,Settings,Save,ViewFilled } from "@vicons/carbon";
import ThemeSwitch from "@/views/components/ThemeSwitch.vue";
import SettingsModal from "../settings/index.vue";

const showSettingsModal = ref(false)

defineOptions({
  name: 'Header'
})
</script>
<template>
  <div class="container">
    <div class="logo">Map Editor</div>
    <div class="operate-items">
      <div class="left">
        <NDivider vertical></NDivider>
        <NSpace :size="12">
          <NButton :disabled="true" :render-icon="()=>h(Save)"> Save </NButton>
          <NButton :render-icon="()=>h(ViewFilled)"> Preview </NButton>
        </NSpace>
        <NDivider vertical></NDivider>
        <NSpace align="end">
          <NButton secondary strong :render-icon="()=>h(Undo)"></NButton>
          <NButton secondary strong :render-icon="()=>h(Redo)"></NButton>
          <span style="opacity: 0.4;font-size: 12px;"
            >Ctrl + Z / Ctrl + Shift + Z</span
          >
        </NSpace>
      </div>
      <div class="right">
        <NButton>Import</NButton>
        <NButton>Export</NButton>
        <ThemeSwitch></ThemeSwitch>
        <NButton
          :render-icon="()=>h(Settings)"
          @click="showSettingsModal = true"
          >Settings</NButton
        >
      </div>
    </div>
    <SettingsModal v-model:show="showSettingsModal"></SettingsModal>
  </div>
</template>
<style scoped>
.container{
    display: flex;
    justify-content: start;
    align-items: center;
    height: 60px;
    padding: 0 24px;
}
.logo{
    font-size: 24px;
    font-weight: 600;
}
.operate-items{
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex: 1;
    margin-left: 24px;
    height: 100%;
}
.operate-items .left{
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 12px;
}
.operate-items .right{
    display: flex;
    justify-content: end;
    align-items: center;
    gap: 12px;
}
</style>
