import { markRaw, reactive } from 'vue'
import { Layers, Cube, ToolKit } from '@vicons/carbon'
import LayerPanel from '@/views/sidebar-views/Layer.vue'
import FeaturePanel from '@/views/sidebar-views/Feature.vue'
import { FeatureType } from '@/core/enum/Layer'
import ToolsPanel from '@/views/sidebar-views/Tools.vue'
import { eventbus } from '@/utils/eventbus'
import { EventTypeEnum } from '@/core/enum/Event'
import { Utils } from '@/utils'
import { Feature } from 'geojson'

export enum MenuKeyEnum {
  Layer = 'layer',
  Feature = 'feature',
  Tools = 'tools',
}

export const SideMenusStore = reactive({
  menus: [
    {
      key: MenuKeyEnum.Layer,
      title: 'Background Layer',
      icon: markRaw(Layers),
      component: markRaw(LayerPanel),
      props: {},
    },
    {
      key: MenuKeyEnum.Feature,
      title: 'Feature',
      icon: markRaw(Cube),
      component: markRaw(FeaturePanel),
      props: {},
    },
    {
      key: MenuKeyEnum.Tools,
      title: 'Tools',
      icon: markRaw(ToolKit),
      component: markRaw(ToolsPanel),
      props: {},
    },
  ],
  activeMenuKey: MenuKeyEnum.Layer,
  activeLayerType: FeatureType.Background,
  toggleMenu(menuKey: MenuKeyEnum, title?: string, props?: any) {
    this.activeMenuKey = menuKey
    const menu = this.menus.find((menu) => menu.key === menuKey)!
    if (title) {
      menu.title = Utils.capitalizeFirstLetter(title)
    }
    if (props) {
      menu.props = props
    }
  },
  get activeMenu() {
    return this.menus.find((menu) => menu.key === this.activeMenuKey)
  },
  initListener() {
    eventbus.addListener(EventTypeEnum.SELECT_LAYER, (LayerType: string) => {
      console.log(`select layer: ${LayerType}`)
      this.toggleMenu(MenuKeyEnum.Layer, `${LayerType} Layer`)
      this.activeLayerType = LayerType
    })
    eventbus.addListener(EventTypeEnum.SELECT_FEATURE, (props: { feature: Feature }) => {
      console.log(`select feature: `, props.feature)
      this.toggleMenu(MenuKeyEnum.Feature, 'Feature', {
        feature: props.feature,
      })
    })
  },
  removeListener() {
    eventbus.removeAllListener(EventTypeEnum.SELECT_LAYER)
    eventbus.removeAllListener(EventTypeEnum.SELECT_FEATURE)
  },
})
