<template lang="pug">
  v-tooltip(
    top
    v-model="isCopied"
    :open-on-click="true"
    :open-on-hover="false"
  )
    template(v-slot:activator="{ on }")
      v-chip(@click="copyText" v-on="on" v-bind="$attrs")
        | {{ text }}
    | Copied to clipboard!
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useClipboard from '~/compositions/useClipboard'

export default defineComponent({
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      required: true
    }
  },
  setup (props) {
    const { isCopied, copy } = useClipboard(1000)

    function copyText () {
      console.log({ copying: props.text })
      copy(props.text)
    }

    return {
      isCopied,
      copyText
    }
  }
})
</script>
