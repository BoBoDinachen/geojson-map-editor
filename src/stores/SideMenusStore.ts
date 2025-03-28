import { markRaw, reactive } from "vue";
import { Layers, Cube, ToolKit } from "@vicons/carbon";
import LayerPanel from "@/views/PropertyBar/TabPane/Layer.vue";
import FeaturePanel from "@/views/PropertyBar/TabPane/Feature.vue";
import { LayerType } from "@/core/enum/Layer";
import ToolsPanel from "@/views/PropertyBar/TabPane/Tools.vue";
import { eventbus } from "@/utils/eventbus";
import { EventTypeEnum } from "@/core/enum/Event";

export enum MenuKeyEnum {
  Layer = "layer",
  Feature = "feature",
  Tools = "tools",
}

export const SideMenusStore = reactive({
  menus: [
    {
      key: MenuKeyEnum.Layer,
      title: "Layer",
      icon: markRaw(Layers),
      component: markRaw(LayerPanel),
      props: {},
    },
    {
      key: MenuKeyEnum.Feature,
      title: "Feature",
      icon: markRaw(Cube),
      component: markRaw(FeaturePanel),
      props: {},
    },
    {
      key: MenuKeyEnum.Tools,
      title: "Tools",
      icon: markRaw(ToolKit),
      component: markRaw(ToolsPanel),
      props: {},
    },
  ],
  activeMenuKey: MenuKeyEnum.Layer,
  activeLayerType: LayerType.Background,
  toggleMenu(menuKey: MenuKeyEnum) {
    this.activeMenuKey = menuKey;
  },
  get activeMenu() {
    return this.menus.find((menu) => menu.key === this.activeMenuKey);
  },
  initListener() {
    eventbus.addListener(EventTypeEnum.SELECT_LAYER, (LayerType: string) => {
      console.log(`select layer: ${LayerType}`);
      this.toggleMenu(MenuKeyEnum.Layer);
      this.activeLayerType = LayerType;
    });
  },
  removeListener() {
    eventbus.removeAllListener(EventTypeEnum.SELECT_LAYER);
  },
});
