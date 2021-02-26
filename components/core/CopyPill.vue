<template lang="pug">
  v-tooltip(
    top
    v-model="isCopied"
    :open-on-click="true"
    :open-on-hover="false"
  )
    template(v-slot:activator="{ on }")
      v-chip(@click="copyText" v-on="on" v-bind="$attrs")
        v-icon(v-if='hide') {{icon}}
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
    const hidden = ref(true)
    const icon = computed(() => hidden.value ? 'mdi-eye' : 'mdi-eye-off')

    function copyText () {
      hidden.value = !hidden.value
      context.emit('click')
      copy(props.text)
    }

    const renderText = computed(() => hidden.value && props.hide ? '•••••••' : props.text)

    return {
      isCopied,
      copyText,
      renderText,
      icon
    }
  }
})
</script>
