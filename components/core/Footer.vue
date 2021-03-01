<template>
  <v-footer
    app
    padless
    elevation="3"
    style="padding-bottom: env(safe-area-inset-bottom);"
  >
    <v-container fluid>
      <v-row justify="start">
        <div class="px-4 font-weight-light warning--text text--darken-1" style="font-size: 14px;">
          Copyright &copy; {{year}} Voltage | <a href="https://getvoltage.io/terms.html" target="_blank">Terms</a>
          - <a href="https://getvoltage.io/privacy.html" target="_blank">Privacy</a>
          - <a href="https://getvoltage.io/#about" target="_blank">About</a>
        </div>
      </v-row>
    </v-container>
  </v-footer>
</template>
<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'

export default defineComponent({
  setup () {
    const year = computed(() => new Date().getFullYear())

    return {
      year
    }
  }
})
</script>
