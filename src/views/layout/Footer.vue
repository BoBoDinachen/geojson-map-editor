<script lang="ts" setup>
import { onMounted, ref } from 'vue'

defineOptions({
  name: 'Footer',
})
const updateLog = ref<any>(null)

onMounted(async () => {
  const res = await fetch('/version_log.json')
  updateLog.value = await res.json()
})
</script>
<template>
  <div class="container">{{ `GeoJson Editor v${updateLog?.currentVersion}` }}</div>
</template>
<style scoped>
.container {
  text-align: center;
  font-size: 14px;
  padding: 5px;
  color: #999;
}
</style>
