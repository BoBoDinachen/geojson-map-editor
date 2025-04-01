<script lang="ts" setup>
import Toolbar from "@/views/toolbar/index.vue";
import editor from "@/core/Editor";
import { onMounted, onUnmounted, useTemplateRef } from "vue";
import ContextMenu from "@/views/components/ContextMenu.vue";
defineOptions({
  name: "DrawPanel",
});
const contextMenuRef = useTemplateRef("contextMenuRef");

const openContextMenu = (event) => {
    // contextMenuRef.value?.showMenu(event, [
    //   { label: "编辑", action: () => console.log("编辑") },
    //   { label: "删除", action: () => console.log("删除") },
    //   { label: "刷新", action: () => console.log("刷新") },
    // ]);
};

onMounted(() => {
  editor.init({});
});
onUnmounted(() => {
  editor.destory();
});
</script>
<template>
  <div class="draw-panel">
    <n-spin
      style="flex: 1; width: 100%; height: 100%"
      :show="editor.loading"
      content-style="width:100%;height:100%;"
    >
      <div id="map-search"></div>
      <div id="map-container" @contextmenu.prevent="openContextMenu"></div>
    </n-spin>
    <Toolbar v-if="!editor.loading"></Toolbar>
    <ContextMenu ref="contextMenuRef" />
  </div>
</template>
<style scoped>
.draw-panel {
  position: relative;
  flex: 1;
  height: 100%;
  background-color: #282c34;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#map-container {
  width: 100%;
  height: 100%;
  position: relative;
}
#map-search {
  position: absolute;
  width: 120px;
  height: 50px;
  top: 10px;
  left: 10px;
}
</style>
