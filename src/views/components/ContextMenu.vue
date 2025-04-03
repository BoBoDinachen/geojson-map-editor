<template>
  <ul v-if="isVisible" class="context-menu" :style="menuStyle" ref="menuRef">
    <li
      v-for="(item, index) in menuItems"
      :key="index"
      @click="handleClick(item)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { RemoveFeatureAction } from "@/core/actions/removeFeatureAction";
import { EventTypeEnum } from "@/core/enum/Event";
import { FeatureType } from "@/core/enum/Layer";
import UndoRedoManager from "@/core/manager/UndoRedoManager";
import { blockLayer, wallsLayer } from "@/stores/LayersStore";
import { eventbus } from "@/utils/eventbus";
import { ref, onMounted, onUnmounted, useTemplateRef } from "vue";

type MenuItem = {
  label: string;
  action?: () => void;
};

const isVisible = ref(false);
const menuStyle = ref({});
const menuItems = ref<MenuItem[]>([]);
const menuRef = useTemplateRef("menuRef");

const showMenu = (pos: any, data: any) => {
  const { x, y } = pos;
  const menuWidth = 150; // 预设菜单宽度
  const menuHeight = 100; // 预设菜单高度

  let posX = x;
  let posY = y;

  // 限制菜单不超出右边界
  if (x + menuWidth > window.innerWidth) {
    posX = window.innerWidth - menuWidth;
  }

  // 限制菜单不超出下边界
  if (y + menuHeight > window.innerHeight) {
    posY = window.innerHeight - menuHeight;
  }

  menuStyle.value = { top: `${posY}px`, left: `${posX}px` };
  menuItems.value = [
    {
      label: "Edit",
      action: () => {
        window.$message.info("Not Supported");
      },
    },
    {
      label: "Remove",
      action: () => {
        switch (data.type) {
          case FeatureType.Block:
            UndoRedoManager.execute(
              new RemoveFeatureAction(blockLayer.value!, data.feature)
            );
            // blockLayer.value?.removeFeatureById(data.featureId);
            break;
          case FeatureType.Wall:
            UndoRedoManager.execute(
              new RemoveFeatureAction(wallsLayer.value!, data.feature)
            );
            // wallsLayer.value?.removeFeatureById(data.featureId);
            break;
          default:
            break;
        }
        eventbus.emit(EventTypeEnum.ClearLayerSelectedState);
      },
    },
    {
      label: "Copy",
      action: () => {
        window.$message.info("Not Supported");
      },
    },
  ];
  isVisible.value = true;
};

const hideMenu = () => {
  isVisible.value = false;
};

// **点击菜单外部时隐藏菜单**
const handleClickOutside = (event: any) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    hideMenu();
  }
};

const handleClick = (item: MenuItem) => {
  item.action?.();
  hideMenu();
};

// **挂载/卸载全局点击事件**
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  eventbus.addListener(EventTypeEnum.OpenContextMenu, (payload: any) => {
    showMenu(payload.pos, payload.data);
  });
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  eventbus.removeAllListener(EventTypeEnum.OpenContextMenu);
});

defineExpose({ showMenu });
</script>

<style lang="css" scoped>
.context-menu {
  position: absolute;
  background: var(--nl-bg-color);
  list-style: none;
  padding: 5px;
  margin: 0;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  z-index: 1000;
}

.context-menu li {
  padding: 8px 20px;
  cursor: pointer;
  white-space: nowrap;
}

.context-menu li:hover {
  background: var(--nl-hover-color);
}
</style>
