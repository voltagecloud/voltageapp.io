<template lang="pug">
  v-card(color='info')
    v-card-title.font-weight-light.warning--text.text--darken-1
      | Creating {{ displayNetwork }} Node {{ isTrial }}
    v-form(ref='form' v-model='valid' lazy-validation='' @submit.prevent='createNode')
      v-container
        v-row(justify='center')
          v-col(cols='12')
            v-text-field(v-model='nodeName' label='Node Name' outlined color='highlight' background-color='secondary' :rules='[required]' required='')
          v-col.px-10(cols='12' md='10')
            v-row(justify='space-between')
              v-switch(v-model='settings.autopilot' label='Autopilot' color='highlight' inset)
              v-switch(v-model='settings.grpc' label='GRPC' color='highlight' inset)
              v-switch(v-model='settings.rest' label='REST' color='highlight' inset)
              v-switch(v-model='settings.tor' label='Tor' color='highlight' inset)
              v-switch(v-model="settings.keysend" label="Keysend" color="highlight" inset)
          v-col(cols='12')
            v-combobox(v-model='settings.whitelist' chips='' label='Whitelist' multiple='' outlined='' color='highlight' background-color='secondary' :rules='[validIP]')
              template(v-slot:selection='{ attrs, item, select, selected }')
                v-chip(v-bind='attrs' :input-value='selected' close='' @click='select' @click:close='remove(item)')
                  | {{ item }}
          v-col(cols='12')
            v-btn.px-4.warning--text(block='' type='submit' color='secondary' large='' :loading='loading' :disabled='!valid')
              | Create Node
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useNodeApi from '~/compositions/useNodeApi'
import { createStore, layoutStore } from '~/store'

export default defineComponent({
  name: 'CreateNode',
  setup (_ , {root}) {
    const { valid, settings, required, form, validIP } = useFormValidation()
    const { generateSeed, loading } = useNodeApi(root.$nuxt.context)

    async function createNode () {
      if (form.value.validate()) {
        createStore.SETTINGS(settings.value)
        await generateSeed(nodeName.value, createStore.network, createStore.trial)
      }
    }
    function remove (item) {
      settings.value.whitelist = settings.value.whitelist.filter(elem => elem !== item)
    }

    const nodeName = ref(createStore.nodeName.value)

    const displayNetwork = computed(() => {
      const n = createStore.network
      return n.charAt(0).toUpperCase() + n.slice(1) 
    })

    const isTrial = computed(() => createStore.trial ? '(trial)' : '')

    return {
      valid,
      settings,
      required,
      nodeName,
      form,
      loading,
      createNode,
      remove,
      displayNetwork,
      isTrial,
      validIP
    }
  }
  // data () {
  //   return {
  //     valid: true,
  //     nodeName: '',
  //     // defaults populated on create hook
  //     settings: {},
  //     loading: false,
  //     rules: {
  //       exists: v => v.length > 0 || 'Required Field'
  //     }
  //   }
  // },
  // computed: {
  //   network () {
  //     const network = this.$store.state.create.network
  //     return network.charAt(0).toUpperCase() + network.slice(1)
  //   }
  // },
  // created () {
  //   this.nodeName = `${this.$store.state.create.nodeName}`
  //   this.settings = Object.assign({}, this.$store.state.create.settings)
  // },
  // methods: {
  //   async createNode () {
  //     if (this.$refs.form.validate()) {
  //       this.loading = true
  //       this.$store.commit('create/NODE_NAME', this.nodeName)
  //       this.$store.commit('create/SETTINGS', this.settings)
  //       await this.$store.dispatch('create/generateSeed')
  //       this.loading = false
  //     }
  //   },
  //   remove (item) {
  //     this.settings.whitelist = this.settings.whitelist.filter(elem => elem !== item)
  //   }
  // }
})
</script>
