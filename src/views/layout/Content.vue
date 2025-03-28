<script lang="ts" setup>
import SideBar from "@/views/sidebar/index.vue";
import Editor from "@/views/Editor/index.vue";
import PropertyBar from "@/views/PropertyBar/index.vue";
defineOptions({
  name: "Content",
});
</script>
<template>
  <div :class="styles.container" id="main-container">
    <SideBar></SideBar>
    <n-split
      direction="horizontal"
      style="height: 100%"
      :default-size="0.65"
      :max="0.75"
      :min="0.25"
    >
      <template #1> <Editor></Editor> </template>
      <template #2> <PropertyBar></PropertyBar> </template>
    </n-split>
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
