<script lang="ts" setup>
import { StorageHandler } from "@/storage-handler";
import { ref } from "vue";
import CountdownButton from "@/views/components/CountdownButton.vue";

defineOptions({
  name: "ExportModal",
});

const fileName = ref<string>(`new_map_${new Date().toLocaleDateString()}`);

const exportFile = () => {
  StorageHandler.exportMapFile(fileName.value);
  window.$message.success("Export Success");
};
</script>
<template>
  <n-modal
    class="custom-card"
    preset="card"
    title="Export File"
    size="huge"
    style="width: 500px"
    :bordered="false"
  >
    <NFormItem label="File Name:">
      <NInput v-model:value="fileName" placeholder="Please input file name" />
    </NFormItem>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="$emit('update:show', false)">Cancel</NButton>
        <CountdownButton :duration="3000" type="primary" @click="exportFile"
          >Confirm Export</CountdownButton
        >
      </NSpace>
    </template>
  </n-modal>
</template>
