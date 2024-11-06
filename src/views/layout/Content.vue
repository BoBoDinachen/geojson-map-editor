<script lang="ts" setup>
import SideBar from "@/views/sidebar/index.vue";
import DrawPanel from "@/views/draw-panel/index.vue";
import StatusBar from "@/views/statusbar/index.vue";
defineOptions({
  name: 'Content'
})
</script>
<template>
  <div :class="styles.container">
    <SideBar></SideBar>
    <DrawPanel></DrawPanel>
    <StatusBar></StatusBar>
  </div>
</template>
<style module="styles">
.container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
