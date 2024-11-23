<script lang="ts" setup>
import editor from "@/core/Editor";
import { EventTypeEnum } from "@/core/enum/Event";
import { MenuKeyEnum, SideMenusStore } from "@/stores/SideMenusStore";
import { eventbus } from "@/utils/eventbus";
import { onMounted, onUnmounted } from "vue";
defineOptions({
  name: "PropertyBar",
});
onMounted(() => {
  eventbus.addListener(EventTypeEnum.SELECT_LAYER, (layerName: string) => {
    console.log(`select layer: ${layerName}`);
    SideMenusStore.toggleMenu(MenuKeyEnum.Layer);
    SideMenusStore.state.activeLayerName = layerName;
  });
});
onUnmounted(() => {
  eventbus.removeAllListener(EventTypeEnum.SELECT_LAYER);
});
</script>
<template>
  <NCard
    class="container"
    :bordered="false"
    style="padding: 0"
    header-style="padding: 0"
    content-style="padding: 0"
  >
    <template #header>
      <div class="header">
        <h3 style="margin: 0">{{ SideMenusStore.activeMenu?.title }}</h3>
      </div>
    </template>
    <div class="main">
      <NScrollbar content-class="content-wrapper" style="height: 100%">
        <NSpin
          size="small"
          :show="editor.loading"
          description="Loading..."
          style="height: 100%"
        >
          <component
            v-bind="SideMenusStore.activeMenu?.props"
            :is="SideMenusStore.activeMenu?.component"
          />
        </NSpin>
      </NScrollbar>
      <div class="menus-wrapper">
        <div
          v-for="menuItem in SideMenusStore.menus"
          :class="[
            'menu-item',
            SideMenusStore.state.activeMenuKey === menuItem.key ? 'active' : '',
          ]"
          @click="
            () => {
              SideMenusStore.toggleMenu(menuItem.key);
            }
          "
          :key="menuItem.key"
        >
          <NButton
            class="menu-icon"
            text
            style="font-size: 24px"
            :type="
              SideMenusStore.state.activeMenuKey === menuItem.key
                ? 'primary'
                : undefined
            "
          >
            <NIcon :component="menuItem.icon"></NIcon>
          </NButton>
        </div>
      </div>
    </div>
  </NCard>
</template>
<style lang="scss">
.container {
  padding: 10px;
  /* width: 300px; */
  height: 100%;
  box-sizing: border-box;
  border: 1px solid var(--nl-border-color);
  .header {
    padding: 10px;
    border-bottom: 1px solid var(--nl-border-color);
  }
  .main {
    height: 100%;
    display: flex;
    overflow: hidden;
  }
  .content-wrapper {
    flex: 1;
    height: 100%;
    overflow: auto;
  }
  .menus-wrapper {
    width: 50px;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--nl-border-color);
    .menu-item {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      cursor: pointer;
      &:hover {
        background-color: var(--nl-hover-color);
      }
      &.active {
        background-color: var(--nl-hover-color);
      }
    }
  }
}
</style>
