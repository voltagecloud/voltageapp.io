<template>
  <v-footer
    app
    padless
    elevation="3"
  >
    <v-container fluid>
      <v-row justify="start">
        <div class="px-4 font-weight-light warning--text text--darken-1">
          Copyright &copy; 2020 Voltage | <a href="https://getvoltage.io/terms.html" target="_blank">Terms</a>
          - <a href="https://getvoltage.io/privacy.html" target="_blank">Privacy</a>
        </div>
      </v-row>
    </v-container>
  </v-footer>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  setup () {

  }
})
</script>
