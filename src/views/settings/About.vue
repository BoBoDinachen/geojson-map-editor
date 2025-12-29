<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineOptions({
  name: 'About',
})
const updateLog = ref<any>(null)
const showLog = ref(false)

onMounted(async () => {
  const res = await fetch('/version_log.json')
  updateLog.value = await res.json()
})
</script>
<template>
  <NSpace vertical>
    <NCard>
      <NSpace vertical :size="30">
        <div class="logo-wrapper">
          <img src="/Logo.png" alt="" />
          <NSpace vertical>
            <h1>{{ `GeoJsonEditor V${updateLog?.currentVersion}` }}</h1>
            <NSpace align="center" :size="20">
              <NButton @click="showLog = true">View Log</NButton>
            </NSpace>
          </NSpace>
        </div>
      </NSpace>
    </NCard>
    <NModal v-model:show="showLog" style="width: 800px" closable preset="card" title="Update Log">
      <NScrollbar style="max-height: 500px">
        <NSpace vertical :size="0" v-for="item in updateLog?.updateLog">
          <NSpace align="center">
            <h3>V{{ item.version }}</h3>
            <NTag v-if="item.tag" round :type="item.tag === 'Latest' ? 'success' : 'info'">{{
              item.tag
            }}</NTag>
          </NSpace>
          <span style="color: #bdbdbd; font-size: 12px">{{ item.time }} - Feature and fix:</span>
          <ul>
            <li style="margin-bottom: 5px" v-for="log in item.logs">{{ log }}</li>
          </ul>
        </NSpace>
      </NScrollbar>
    </NModal>
  </NSpace>
</template>
<style lang="scss" scoped>
.logo-wrapper {
  display: flex;
  justify-content: flex-start;
  align-items: start;
  gap: 10px;

  img {
    width: 80px;
    height: 80px;
  }

  h1 {
    margin: unset;
  }
}
</style>
