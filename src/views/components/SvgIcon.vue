<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
const props = withDefaults(defineProps<{
  onClick?: (e: any) => void,
  name: string,
  size?: number
}>(),{
  size: 1.2
})
const iconStyle = computed(() => ({ width: `${props.size}em`, height: `${props.size}em` }))
const iconURL = ref()
const loadIcon = async ()=>{
  const path = new URL(`../../icons/svg/${props.name}.svg`,import.meta.url).href;
  console.log(path);

  iconURL.value = path;
}
onMounted(()=>{
  loadIcon()
})
</script>

<template>
  <img :src="iconURL" alt="" :style="iconStyle" @click="props.onClick" />
</template>

<style lang="css" scoped>
.svg-icon {
  width: v-bind('iconStyle.width');
  height: v-bind('iconStyle.height');
  overflow: hidden;
}
</style>
