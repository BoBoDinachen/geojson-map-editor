<script setup lang="ts">
import { backgroundLayer } from "@/stores/LayersStore";
import { computed } from "vue";
import FormField from "@/views/components/FormField.vue";

defineOptions({
  name: "BackgroundLayer",
});
const properties = computed(() => backgroundLayer.value?.properties || {});
</script>
<template>
  <div>
    <h3>Background</h3>
    <NCard size="small">
      <div>
        <FormField
          :show-label="false"
          field-key="Properties"
          :value="properties"
          @update-value="(values) => {}"
        ></FormField>
      </div>
    </NCard>
  </div>
</template>
<style lang="scss"></style>
