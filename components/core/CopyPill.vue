<template lang="pug">
  v-tooltip(
    top
    v-model="show"
    :open-on-click="true"
    :open-on-hover="false"
  )
    template(v-slot:activator="{ on }")
      v-chip(@click="copy" v-on="on" v-bind="$attrs")
        | {{ text }}
    | Copied to clipboard!
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'

export default defineComponent({
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup ({ text }) {
    const show = ref(false)

    function copy () {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setTimeout(() => {
        show.value = false
      }, 1000)
    }

    return {
      copy,
      show
    }
  }
})
</script>