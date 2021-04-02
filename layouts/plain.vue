<template lang="pug">
  v-app
    v-main
      v-container.align-container
        v-row(justify='start' justify-lg='start' align='center' style='height: 100%;')
          v-container(fluid='')
            v-row(justify='center')
              v-img.mb-12(:src="require('~/assets/logo/logo-orange.svg')" max-height='100' max-width='100')
              nuxt
    core-footer
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  middleware: ['assertUnAuthed'],
  components: {
    CoreFooter: () => import('~/components/core/Footer.vue')
  }
})
</script>
<style lang="scss" scoped>
main.v-main{
  background-image: url('~assets/pattern.png');
  background-repeat: repeat;
  background-size: 300px;
}
</style>
