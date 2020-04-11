<template>
  <v-app>
    <v-navigation-drawer
      v-model="showDrawer"
      app
      clipped
    >
      <v-list
        dense
        nav
        class="mt-lg-8"
      >
        <v-list-item
          v-for="obj in testnetNodes"
          :key="obj.node_id"
          link
          @click="$router.push(`/nodes/${obj.node_id}`)"
        >
          <v-list-item-action v-if="false">
            <v-icon>{{ }}</v-icon>
          </v-list-item-action>

          <v-list-item-content>
            <v-list-item-title
              v-text="obj.node_name"
            />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <v-list
          expand
          nav
          class="mt-12"
        >
          <v-list-item
            v-for="item in navItems2"
            :key="item.title"
            @click="item.fct()"
          >
            <v-list-item-action v-if="item.icon">
              <v-icon color="warning darken-1">
                {{ item.icon }}
              </v-icon>
            </v-list-item-action>
            <v-list-item-title class="warning--text text--darken-1">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>
    <v-app-bar
      app
      clipped-left
      color="warning"
      dark
      hide-on-scroll
    >
      <v-btn
        fab
        color="primary"
        bottom
        left
        absolute
        @click="showDrawer = !showDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title class="align-center" style="margin-left: 60px;">
        {{ appBarTitle }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        class="mx-2"
        @click="$vuetify.theme.dark = !$vuetify.theme.dark"
      >
        <v-icon>
          mdi-theme-light-dark
        </v-icon>
      </v-btn>
      <v-btn
        icon
        class="mx-2"
        @click="$router.push('/')"
      >
        <v-icon>
          mdi-view-dashboard
        </v-icon>
      </v-btn>
      <v-menu
        bottom
        left
        offset-y
        origin="top right"
        transition="scale-transition"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            icon
            class="mx-2"
            v-on="on"
          >
            <v-badge
              color="primary"
              overlap
            >
              <template v-slot:badge>
                <span>{{ notifications.length }}</span>
              </template>
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(notif, i) in notifications"
            :key="`${i}${notif.title}`"
            @click="$router.push(notif.to)"
          >
            <v-list-item-title>
              {{ notif.title }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        icon
        class="mx-2"
        @click="$router.push('user')"
      >
        <v-icon>
          mdi-account
        </v-icon>
      </v-btn>
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
    <error-snackbar />
    <core-footer />
  </v-app>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from '@vue/composition-api'
import useAuthentication from '~/compositions/useAuthentication'




export default defineComponent({
  setup (_, { root: { $router }}) {

    const CoreFooter = () => import('~/components/core/Footer.vue')
    const ErrorSnackbar = () => import('~/components/core/ErrorSnackbar.vue')

    const { logout } = useAuthentication()

    const showDrawer = ref(null)


    const bottomItems = reactive([
      {
        title: 'Manage Nodes',
        icon: 'mdi-resistor-nodes',
        fct: () => $router.push('/nodes')
      },
      {
        title: 'Settings',
        icon: 'mdi-cog-outline',
        fct: () => $router.push('/')
      },
      {
        title: 'Logout',
        icon: 'mdi-logout',
        fct: logout
      }
    ])

    return {
      CoreFooter,
      ErrorSnackbar,
      bottomItems,
      showDrawer
    }
  }
})

//   data () {
//     return {
//       showDrawer: null,
//       notifications: [
//         {
//           title: 'some notif 1',
//           to: '/'
//         },
//         {
//           title: 'some notif 2',
//           to: '/'
//         },
//         {
//           title: 'some notif 3',
//           to: '/'
//         }
//       ],
//       navItems2: [
//         {
//           title: 'Manage Nodes',
//           icon: 'mdi-resistor-nodes',
//           fct: () => this.$router.push('/nodes')
//         },
//         {
//           title: 'Settings',
//           icon: 'mdi-cog-outline',
//           fct: () => this.$router.push('/')
//         },
//         {
//           title: 'Logout',
//           icon: 'mdi-logout',
//           fct: () => this.logout()
//         }
//       ]
//     }
//   },
//   computed: {
//     ...mapState({
//       appBarTitle: state => state.meta.appBarTitle,
//       testnetNodes: state => state.node.testnetNodeIDName
//     })
//   },
//   methods: {
//     async logout () {
//       await this.$store.dispatch('auth/logout')
//       this.$router.push('/')
//     }
//   }
// }
</script>
