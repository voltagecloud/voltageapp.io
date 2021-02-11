import { defineComponent, createElement, reactive, computed } from '@vue/composition-api'
import useAuthentication from '~/compositions/useAuthentication'
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
    VListItemAction: () => import('vuetify/lib').then(m => m.VListItemAction),
    VListItemTitle: () => import('vuetify/lib').then(m => m.VListItemTitle),
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


    const isBig = computed(() => ctx.root.$vuetify.breakpoint.mdAndUp)

    const { logout } = useAuthentication()
    const bottomItems = reactive([
      {
        title: 'Dashboards',
        icon: 'mdi-laptop',
        fct: () => ctx.root.$router.push('/dashboards')
      },
      {
        title: 'Exports',
        icon: 'mdi-file-export-outline',
        fct: () => ctx.root.$router.push('/exports')
      },
      {
        title: 'Settings',
        icon: 'mdi-cog-outline',
        fct: () => ctx.root.$router.push('/settings')
      },
      {
        title: 'Logout',
        icon: 'mdi-logout',
        fct: async () => {
          await logout()
          ctx.root.$router.push('/login')
        }
      }
    ])

    return () => {
      const btnContent = () => (<div>
        {username.value}
        <VIcon class="ml-3">mdi-account</VIcon>
      </div>)

      const list = () => (<div>
        <v-list>
          {bottomItems.map(e => <v-list-item key={e.title} onClick={e.fct}>
            <v-list-item-action>
              <VIcon color="warning darken-1">{e.icon}</VIcon>
            </v-list-item-action>
            <v-list-item-title class="warning--text text--darken-1">
              {e.title}
            </v-list-item-title>
          </v-list-item>)}
        </v-list>
      </div>)

      return <v-app>
      <v-navigation-drawer
        app
        clipped
        right
        value={state.showDrawer && !isBig.value}
        onInput={(v: boolean) => { state.showDrawer = v }}
        disable-resize-watcher
        class=""
      >
        {list()}
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
        { isBig.value
          ? <v-menu
              offset-y
              scopedSlots={{activator: ({ attrs, on }: {attrs: any; on:any;}) => <VBtn key="sm" text {...attrs} {...{ on }}>
                {btnContent()}
              </VBtn>}}
            >
              <v-card>{list()}</v-card>
            </v-menu>
          : <VBtn onClick={() => { state.showDrawer = true }} text key="lg">
            {btnContent()}
          </VBtn>
        }
        
      </v-app-bar>
      <v-content class={{background: ctx.root.$route.path !== 'settings'}}>
        <nuxt />
      </v-content>
      <error-snackbar />
      <core-footer />
    </v-app>}
  }
})
