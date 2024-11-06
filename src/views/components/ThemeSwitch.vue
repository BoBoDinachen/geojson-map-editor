<script lang="ts" setup>
import { h } from 'vue';
import { Moon,Sun } from "@vicons/carbon";
import { ThemeManager,Theme } from "@/stores/ThemeManager";
defineOptions({
  name: 'ThemeSwitch'
})
const renderIcon = ()=>{
    return h(ThemeManager.isDarkTheme()? Moon : Sun);
}
</script>
<template>
  <n-button  @click="()=>{ThemeManager.toogleTheme()}" :render-icon="renderIcon"> </n-button>
</template>
<style scoped></style>
