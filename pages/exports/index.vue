<template lang="pug">
  v-container
    v-row(justify='center')
      v-col(cols='12') hi

</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { exportsStore } from '~/store'

export default defineComponent({
  middleware: ['loadCognito', 'assertAuthed', 'loadUser'],
  async fetch () {
    // @ts-ignore
    const axios = this.$nuxt.context.$axios
    // @ts-ignore
    const res = await axios.get('/export')
    exportsStore.EXPORTS(res.data.exports)
  },
  setup (_, { root }) {
    console.log(root.$route.query)
  }
})
</script>