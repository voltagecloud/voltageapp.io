<template lang="pug">
  v-container
    v-row
      v-col
        view-node
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    ViewNode: () => import('~/components/ViewNode.vue')
  },
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  setup () {

  }
})
</script>