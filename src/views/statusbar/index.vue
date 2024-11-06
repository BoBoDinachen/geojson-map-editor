<script lang="ts" setup>
defineOptions({
  name: 'StatusBar'
})
</script>
<template>
  <div :class="styles.conatiner">StatusBar</div>
</template>
<style module="styles">
.conatiner{
  padding: 10px;
  width: 300px;
  height: 100%;
  box-sizing: border-box;
  border: 1px solid var(--nl-border-color);
}
</style>
