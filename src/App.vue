<script setup lang="ts">
import { darkTheme, lightTheme,enUS,dateEnUS } from "naive-ui";
import Layout from "@/views/layout/index.vue";
import { ThemeManager } from "@/stores/ThemeManager";
import { onMounted } from "vue";

onMounted(()=>{
  ThemeManager.initTheme();
})
</script>
<template>
  <n-config-provider
    :theme="ThemeManager.isDarkTheme()?darkTheme:lightTheme"
    style="height: 100%;"
    :locale="enUS"
    :date-locale="dateEnUS"
    ><n-notification-provider placement="top-right" :max="3">
      <n-dialog-provider>
        <n-message-provider>
          <Layout></Layout>
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped></style>
