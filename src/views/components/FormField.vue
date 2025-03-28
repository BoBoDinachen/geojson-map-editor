<script setup lang="ts">
import { computed, ref, watch } from "vue";
import FormField from "./FormField.vue";

defineOptions({
  name: "FormField",
});
const props = defineProps<{
  showLabel?: boolean;
  disabled?: boolean;
  fieldKey: string | number;
  value: any;
}>();
const emits = defineEmits<{
  (event: "update-value", value: any): void;
}>();

const localValue = ref(props.value);
const isObject = computed(() => {
  return (
    typeof localValue.value === "object" &&
    !Array.isArray(localValue.value) &&
    localValue.value !== null
  );
});
const isArray = computed(() => {
  return Array.isArray(localValue.value);
});
const isBoolean = computed(() => {
  return typeof localValue.value === "boolean";
});
const isNumber = computed(() => {
  return typeof localValue.value === "number";
});
const isString = computed(() => {
  return typeof localValue.value === "string";
});

const updateValue = () => {
  emits("update-value", localValue.value);
};
const updateNestedValue = (key, value) => {
  if (isObject.value) {
    localValue.value = { ...localValue.value, [key]: value };
  } else if (isArray.value) {
    const newArray = [...localValue.value];
    newArray[key] = value;
    localValue.value = newArray;
  }
  updateValue();
};
watch(
  () => props.value,
  (newValue) => {
    localValue.value = newValue;
  }
);
</script>
<template>
  <div v-if="isObject" class="field-item">
    <h2 v-if="showLabel" style="margin-top: 0">{{ fieldKey }}</h2>
    <div v-for="(value, key) in localValue" :key="key">
      <FormField
        :disabled
        :field-key="key"
        :value="value"
        @update-value="updateNestedValue(key, $event)"
      />
    </div>
  </div>
  <div v-else-if="isBoolean" class="field-item">
    <NSpace justify="space-between" align="center">
      <label>{{ fieldKey }}</label>
      <n-checkbox
        :disabled
        v-model:checked="localValue"
        @update:checked="updateValue"
      >
      </n-checkbox>
    </NSpace>
  </div>
  <div v-else-if="isNumber" class="field-item">
    <NSpace justify="space-between" align="center">
      <label>{{ fieldKey }}</label>
      <n-input-number
        :disabled
        :show-button="false"
        v-model:value="localValue"
        size="small"
        @input="updateValue"
      />
    </NSpace>
  </div>
  <div v-else-if="isString" class="field-item">
    <NSpace justify="space-between" align="center">
      <label>{{ fieldKey }}</label>
      <n-input
        :disabled
        v-model:value="localValue"
        style="min-width: 150px;max-width: 100%;"
        size="small"
        @input="updateValue"
        autosize
      />
    </NSpace>
  </div>
</template>

<style lang="scss" scoped>
label {
  margin-right: 10px;
  font-size: 16px;
}

.field-item {
  margin-bottom: 15px;
}
</style>
