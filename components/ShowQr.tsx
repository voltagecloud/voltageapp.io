import { defineComponent, createElement, PropType, computed, ref } from '@vue/composition-api'
import { Node } from '~/types/apiResponse'
import { VTabs, VTab, VTabsItems, VTabItem, VSheet, VContainer } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    LndConnect: () => import('~/components/connections/LNDConnect.tsx'),
    Manual: () => import('~/components/connections/Manual.tsx'),
    Zap: () => import('~/components/connections/Zap.tsx'),
    Zeus: () => import('~/components/connections/Zeus.tsx'),
    Lncli: () => import('~/components/connections/Lncli.tsx'),
    ThunderHub: () => import('~/components/connections/ThunderHub.vue'),
    Joule: () => import('~/components/connections/Joule.vue'),
    Btcpay: () => import('~/components/connections/BTCPay.vue'),
    VTabs,
    VTab,
    VTabsItems,
    VTabItem,
    VSheet,
    VContainer
  },
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true
    }
  },
  setup: (props) => {
    const standardTabs = ['LNDConnect', 'Manual', 'Zap', 'Zeus', 'LNCLI', 'Thunderhub', 'Joule', 'BTCPay Server']
    // determine if sphinx tab should display
    const tabs = computed(() => props.node.settings.sphinx ? [...standardTabs, 'Sphinx'] : [...standardTabs])
    // hold state of current tab
    const curTab = ref(0)

    return () => <v-sheet>
      <v-tabs
        value={curTab.value}
        onChange={(val: number) => curTab.value = val} 
        background-color="highlight"
        color="primary"
        centered
        dark
        grow
        show-arrows
      >
        {tabs.value.map((name, i) => <v-tab key={i}>{name}</v-tab>)}
      </v-tabs>
      <v-tabs-items v-model={curTab.value}>
        <v-tab-item>
          <lnd-connect node={props.node}/>
        </v-tab-item>
        <v-tab-item>
          <manual node={props.node} />
        </v-tab-item>
        <v-tab-item>
          <zap node={props.node} />
        </v-tab-item>
        <v-tab-item>
          <zeus node={props.node} />
        </v-tab-item>
        <v-tab-item>
          <lncli node={props.node} />
        </v-tab-item>
        <v-tab-item>
          <thunder-hub node={props.node} />
        </v-tab-item>
        <v-tab-item>
          <joule node={props.node} />
        </v-tab-item>
        <v-tab-item>
          <btcpay node={props.node} />
        </v-tab-item>
      </v-tabs-items>
      <v-container class="font-weight-light text--darken-1 text-center align-center">
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
      </v-container>
    </v-sheet>
  }
})
