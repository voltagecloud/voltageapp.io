<template>
  <v-app>
    <v-content>
      <v-container id="align-container">
        <v-row
          justify="start"
          justify-lg="start"
          align="center"
          style="height: 100%;"
        >
          <v-container fluid>
            <v-row justify="center">
              <v-img
                :src="require('~/assets/logo/logo-orange.svg')"
                max-height="100"
                max-width="100"
                class="mb-12"
              />
              <nuxt />
            </v-row>
          </v-container>
        </v-row>
      </v-container>
    </v-content>
    <core-footer />
  </v-app>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    CoreFooter: () => import('~/components/core/Footer.vue')
  }
})
</script>
<style scoped lang="scss">
#align-container {
  height: calc(100vh - 100px);
}
</style>
