import { defineComponent, createElement, PropType, computed, ref } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import { VTabs, VTab, VTabsItems, VTabItem, VSheet } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    LndConnect: () => import('~/components/connections/LNDConnect.tsx'),
    Manual: () => import('~/components/connections/Manual.vue'),
    Zap: () => import('~/components/connections/Zap.vue'),
    Zeus: () => import('~/components/connections/Zeus.vue'),
    Lncli: () => import('~/components/connections/Lncli.vue'),
    ThunderHub: () => import('~/components/connections/ThunderHub.vue'),
    Joule: () => import('~/components/connections/Joule.vue'),
    Btcpay: () => import('~/components/connections/BTCPay.vue'),
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
    VSheet
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props) => {
    const standardTabs = ['LNDConnect', 'Manual', 'Zap', 'LNCLI', 'Thunderhub', 'Joule', 'BTCPay Server']
    // determine if sphinx tab should display
    const tabs = computed(() => props.node.settings.sphinx ? [...standardTabs, 'Sphinx'] : [...standardTabs])
    // hold state of current tab
    const curTab = ref(0)

    return () => <v-sheet>
      <v-tabs v-model={curTab.value}>
        {tabs.value.map((name, i) => <v-tab key={i}>{name}</v-tab>)}
      </v-tabs>
      <v-tabs-items v-model={curTab.value}>
        <v-tab-item>
          <lnd-connect node={props.node}/>
        </v-tab-item>
        <v-tab-item>
          <manual />
        </v-tab-item>
        <v-tab-item>
          <zap />
        </v-tab-item>
        <v-tab-item>
          <zeus />
        </v-tab-item>
        <v-tab-item>
          <lncli />
        </v-tab-item>
        <v-tab-item>
          <thunder-hub />
        </v-tab-item>
        <v-tab-item>
          <joule />
        </v-tab-item>
        <v-tab-item>
          <btcpay />
        </v-tab-item>
      </v-tabs-items>
      <div class="font-weight-light text--darken-1 text-center align-center pa-md">
        <p>
          These codes contain sensitive data used to connect to your node. Guard them carefully
        </p>
        <p>
          If you are having trouble connecting please check your IP Whitelist settings and ensure your IP is allowed
        </p>
        <p>
          Helpful FAQ Links
        </p>
        <a href="https://getvoltage.io/faq.html#connect" target="_blank">
          How to connect to your node
        </a>
        <a href="https://getvoltage.io/faq.html#applications" target="_blank">
          Popular apps to connect to your node.
        </a>
      </div>
    </v-sheet>
  }
})
