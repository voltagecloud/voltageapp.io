<template lang="pug">
  v-tooltip(
    top
    v-model="isCopied"
    :open-on-click="true"
    :open-on-hover="false"
  )
    template(v-slot:activator="{ on }")
      v-chip(@click="copyText" v-on="on" v-bind="$attrs")
        | {{ renderText }}
    | Copied to clipboard!
</template>
<script lang="ts">
import { defineComponent, computed, ref } from '@vue/composition-api'
import useClipboard from '~/compositions/useClipboard'

export default defineComponent({
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      required: true
    },
    hide: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  setup (props, context) {
    const { isCopied, copy } = useClipboard(1000)

    function copyText () {
      context.emit('click')
      copy(props.text)
    }

    const renderText = computed(() => props.hide ? '••••••••••' : props.text)

    return {
      isCopied,
      copyText,
      renderText,
    }
  }
})
</script>
