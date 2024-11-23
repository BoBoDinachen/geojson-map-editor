import { reactive } from "vue";
import { Layers, Cube, Chemistry } from "@vicons/carbon";
import LayerPane from "@/views/PropertyBar/TabPane/Layer.vue";
import FeaturePane from "@/views/PropertyBar/TabPane/Feature.vue";
import { LayerName } from "@/core/enum/Layer";

export enum MenuKeyEnum {
  Layer = "layer",
  Feature = "feature",
}

export const SideMenusStore = {
  menus: [
    {
      key: MenuKeyEnum.Layer,
      title: "Layer",
      icon: Layers,
      component: LayerPane,
      props: {},
    },
    {
      key: MenuKeyEnum.Feature,
      title: "Feature",
      icon: Cube,
      component: FeaturePane,
      props: {},
    },
  ],
  state: reactive({
    activeMenuKey: MenuKeyEnum.Layer,
    activeLayerName: LayerName.Background,
  }),
  toggleMenu(menuKey: MenuKeyEnum) {
    this.state.activeMenuKey = menuKey;
  },
  get activeMenu() {
    return this.menus.find((menu) => menu.key === this.state.activeMenuKey);
  },
};
