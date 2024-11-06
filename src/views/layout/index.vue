<script lang="ts" setup>
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import Content from "./Content.vue";
import { useDialog, useMessage, useNotification } from "naive-ui"

defineOptions({
  name: 'Layout'
})
// 挂载信息框显示方法到window上面
window.$message = useMessage()
window.$notification = useNotification()
window.$dialog = useDialog()

</script>
<template>
  <n-layout
    content-style="display: flex;flex-direction: column;height: 100%"
    style="height: 100%;"
  >
    <n-layout-header>
      <Header></Header>
    </n-layout-header>
    <n-layout-content content-style="flex: 1">
      <Content></Content>
    </n-layout-content>
    <n-layout-footer>
      <Footer></Footer>
    </n-layout-footer>
  </n-layout>
</template>
<style scoped></style>
