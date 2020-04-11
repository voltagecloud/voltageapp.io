<template>
  <v-snackbar
    v-model="error"
    :timeout="0"
    multi-line
    top
  >
    {{ error }}
    <v-btn
      color="red"
      text
      @click="error = ''"
    />
  </v-snackbar>
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { layoutStore } from '~/store'

export default defineComponent({
  setup () {
    const error = computed({
      get: () => layoutStore.error,
      set: () => layoutStore.SET_ERROR('')
    })

    return {
      error
    }
  }
})
</script>
