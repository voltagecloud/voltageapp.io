<template lang="pug">
  v-app
    v-navigation-drawer(v-model='showDrawer' app='' clipped='')
      v-list.mt-lg-8(v-if='nodeStore.IDNames.length' dense nav)
        v-list-item(v-for='obj in nodeStore.IDNames' :key='obj.node_id' link='' @click='$router.push(`/node/${obj.node_id}`); showDrawer = false')
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
    v-app-bar(app clipped-left color='warning' dark style='padding-top: env(--safe-area-inset-top);')
      v-btn(icon @click='showDrawer = !showDrawer')
        v-icon mdi-menu
      v-img(:src='require("~/assets/logo/name-white.svg")' max-height='18' max-width='100' contain )
      v-spacer
      v-btn(text to='/')
        span(v-if='$vuetify.breakpoint.mdAndUp') Home&nbsp;
        v-icon mdi-home
      v-btn(text to='/create')
        span(v-if='$vuetify.breakpoint.mdAndUp') Create&nbsp;
        v-icon mdi-plus
      v-btn(text to='/purchase')
        span(v-if='$vuetify.breakpoint.mdAndUp') Purchase&nbsp;
        v-icon mdi-currency-usd-circle-outline
    v-content(:class='{background: $route.path != "/settings"}')
      nuxt
    error-snackbar
    core-footer

</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import useAuthentication from '~/compositions/useAuthentication'
import { layoutStore, nodeStore } from '~/store'

export default defineComponent({
  components: {
    CoreFooter: () => import('~/components/core/Footer.vue'),
    ErrorSnackbar: () => import('~/components/core/ErrorSnackbar.vue')
  },
  setup (_, { root: { $router } }) {
    const { logout } = useAuthentication()

    const showDrawer = computed({
      get: () => layoutStore.showDrawer,
      set: (v: boolean | null) => layoutStore.DRAWER(v)
    })

    const bottomItems = reactive([
      {
        title: 'Dashboards',
        icon: 'mdi-laptop',
        fct: () => $router.push('/dashboards')
      },
      {
        title: 'Exports',
        icon: 'mdi-file-export-outline',
        fct: () => $router.push('/exports')
      },
      {
        title: 'Settings',
        icon: 'mdi-cog-outline',
        fct: () => $router.push('/settings')
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
</script>
<style lang="scss" scoped>
main.v-content.background {
  background-image: url('~assets/pattern.png');
  background-repeat: repeat;
  background-size: 300px;
}
</style>
