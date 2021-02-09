import { defineComponent, createElement, reactive, computed } from '@vue/composition-api'
import { authStore } from '~/store'
import { VBtn, VIcon } from 'vuetify/lib'

const h = createElement

export default defineComponent({
  components: {
    VNavigationDrawer: () => import('vuetify/lib').then(m => m.VNavigationDrawer),
    VApp: () => import('vuetify/lib').then(m => m.VApp),
    VContainer: () => import('vuetify/lib').then(m => m.VContainer),
    VRow: () => import('vuetify/lib').then(m => m.VRow),
    VCol: () => import('vuetify/lib').then(m => m.VCol),
    VList: () => import('vuetify/lib').then(m => m.VList),
    VListItem: () => import('vuetify/lib').then(m => m.VListItem),
    VSpacer: () => import('vuetify/lib').then(m => m.VIcon),
    VAppBar: () => import('vuetify/lib').then(m => m.VAppBar),
    VImg: () => import('vuetify/lib').then(m => m.VImg),
    VMenu: () => import('vuetify/lib').then(m => m.VMenu),
    VTabs: () => import('vuetify/lib').then(m => m.VTabs),
    VTab: () => import('vuetify/lib').then(m => m.VTab),
    VCard: () => import('vuetify/lib').then(m => m.VCard),
    VContent: () => import('vuetify/lib').then(m => m.VContent),
    ErrorSnackbar: () => import('~/components/core/ErrorSnackbar.vue'),
    CoreFooter: () => import('~/components/core/Footer.vue'),
  },
  setup: (_, ctx) => {
    const state = reactive({
      showDrawer: false
    })

    const tabs: { text: string; to?: string; href?: string; }[] = [
      { text: 'Nodes', to: '/' },
      // { text: 'BTCPay Server', to: '/btcpay' },
      { text: 'Documentation', href: 'https://docs.voltageapp.io' }
    ]

    // aws amplify typescript typings are incorrect smh jeff bezos
    // @ts-ignore
    const username = computed(() => authStore?.user?.attributes?.email || '')

    return () => <v-app>
      <v-navigation-drawer
        app
        clipped
        right
        value={state.showDrawer}
        onInput={(v: boolean) => { state.showDrawer = v }}
        class="d-md-none"
      >
        Navigation Drawer Inside
      </v-navigation-drawer>
      <v-app-bar app clipped-right color="warning" dark>
        <nuxt-link to="/">
          <v-img  src={require('~/assets/logo/name-white.svg')} max-height="18" max-width="100" contain />
        </nuxt-link>
        <v-tabs class="d-flex flex-grow-1 mx-6">
          {
            // @ts-ignore
            tabs.map(elem => <v-tab
            class="d-none d-md-flex mx-3"
            to={elem.to}
            text
            href={elem.href}
            target={elem.href ? '_blank' : ''}
          >{elem.text}</v-tab>)
          }
        </v-tabs>
        <v-menu
          offset-y
          scopedSlots={{
            //vuetify doesnt support tsx 
            // @ts-ignore
            activator: ({ attrs, on }: {attrs: any; on:any;}) => <VBtn text {...attrs} {...{ on }}>
              {username.value}
              <VIcon class="ml-3">mdi-account</VIcon>
            </VBtn>,
          }}
        >
          <v-card>TESTING</v-card>
        </v-menu>
      </v-app-bar>
      <v-content class={{background: ctx.root.$route.path !== 'settings'}}>
        <nuxt />
      </v-content>
      <error-snackbar />
      <core-footer />
    </v-app>
  }
})
