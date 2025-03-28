<script setup lang="ts">
import { ButtonProps, NButton } from "naive-ui";
import { onMounted, ref } from "vue";
defineOptions({
  name: "CountdownButton",
});

const props = withDefaults(
  defineProps<{
    duration?: number;
  }>(),
  {
    buttonProps: () => ({}),
    duration: 3000,
  }
);

const emits = defineEmits<{
  (e: "click"): void;
  (e: "finish"): void;
}>();

const seconds = ref(props.duration / 1000);
const disabled = ref(false);
const timer = ref();

function startTimer() {
  timer.value = setInterval(() => {
    seconds.value--;
    if (seconds.value < 0) {
      clearInterval(timer.value);
      disabled.value = false;
      seconds.value = props.duration / 1000;
      emits("finish");
    }
  }, 1000);
}

function handleExecute(e) {
  emits("click");
  disabled.value = true;
  startTimer();
}

onMounted(() => {});
</script>
<template>
  <NButton :disabled="disabled" @click.stop="handleExecute">
    <slot></slot>
    <span v-show="disabled">{{ ` (${seconds})` }}</span>
  </NButton>
</template>

<style lang="scss" scoped></style>
