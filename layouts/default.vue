<template lang="pug">
  v-app
    v-navigation-drawer(v-model='showDrawer' app='' clipped='')
      v-list.mt-lg-8(v-if='nodeStore.IDNames.length' dense nav)
        v-list-item(v-for='obj in nodeStore.IDNames' :key='obj.node_id' link='' @click='$router.push(`/node/${obj.node_id}`)')
          v-list-item-action(v-if='false')
            v-icon {{ }}
          v-list-item-content
            v-list-item-title(v-text='obj.node_name')
      v-container(v-else style='height: 100%;')
        v-row(align='center' justify='center' style='height: 100%;')
          v-col.text-center.grey--text.text--darken-1
            |You dont have any running nodes.&nbsp;
            nuxt-link(to='/create') Create one
      template(v-slot:append)
        v-list.mt-12(expand='' nav='')
          v-list-item(v-for='item in bottomItems' :key='item.title' @click='item.fct()')
            v-list-item-action(v-if='item.icon')
              v-icon(color='warning darken-1')
                | {{ item.icon }}
            v-list-item-title.warning--text.text--darken-1
              | {{ item.title }}
    v-app-bar(app='' clipped-left='' color='warning' dark='' hide-on-scroll='')
      v-btn(icon @click='showDrawer = !showDrawer')
        v-icon mdi-menu
      v-toolbar-title
        | {{ layoutStore.appBarTitle }}
      v-spacer
        //- v-btn.mx-2(icon='' @click='$vuetify.theme.dark = !$vuetify.theme.dark')
        //-   v-icon
        //-     | mdi-theme-light-dark
      v-btn(text to='/')
        template(v-if='$vuetify.breakpoint.mdAndUp') Home&nbsp;
        v-icon mdi-home
      v-btn(text to='/create')
        template(v-if='$vuetify.breakpoint.mdAndUp') Create&nbsp;
        v-icon mdi-plus
        //- v-menu(bottom='' left='' offset-y='' origin='top right' transition='scale-transition')
        //-   template(v-slot:activator='{ on, attrs }')
        //-     v-btn.mx-2(v-bind='attrs' icon='' v-on='on')
        //-       v-badge(color='primary' overlap='')
        //-         template(v-slot:badge='' v-if='notifications.length')
        //-           span {{ notifications.length }}
        //-         v-icon mdi-bell
        //-   v-list
        //-     v-list-item(v-for='(notif, i) in notifications' :key='`${i}${notif.title}`' @click='$router.push(notif.to)')
        //-       v-list-item-title
        //-         | {{ notif.title }}
      //- v-btn.mx-2(icon='' @click="$router.push('user')")
      //-   v-icon
      //-     | mdi-account
    v-content
      nuxt
    error-snackbar
      core-footer

</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from '@vue/composition-api'
import useAuthentication from '~/compositions/useAuthentication'
import { layoutStore, nodeStore } from '~/store'

export default defineComponent({
  components: {
    CoreFooter: () => import('~/components/core/Footer.vue'),
    ErrorSnackbar: () => import('~/components/core/ErrorSnackbar.vue')
  },
  setup (_, { root: { $router }}) {
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
        fct: async () => {
          await logout()
          $router.push('/login')
        }
      }
    ])

    return {
      bottomItems,
      showDrawer,
      nodeStore,
      layoutStore
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
