<template>
  <v-card
    color="info"
  >
    <v-card-title
      class="font-weight-light warning--text text--darken-1"
    >
      Creating {{ displayNetwork }} Node
    </v-card-title>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
      @submit.prevent="createNode"
    >
      <v-container>
        <v-row justify="center">
          <v-col cols="12">
            <v-text-field
              v-model="nodeName"
              label="Node Name"
              outlined
              color="highlight"
              background-color="secondary"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col cols="12" class="px-10" md="10">
            <v-row justify="space-between">
              <v-switch
                v-model="settings.autopilot"
                label="Autopilot"
                color="highlight"
                inset
              />
              <v-switch
                v-model="settings.grpc"
                label="GRPC"
                color="highlight"
                inset
              />
              <v-switch
                v-model="settings.rest"
                label="REST"
                color="highlight"
                inset
              />
              <v-switch
                v-model="settings.tor"
                label="Tor"
                color="highlight"
                inset
              />
            </v-row>
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="settings.whitelist"
              chips
              label="Whitelist"
              multiple
              outlined
              color="highlight"
              background-color="secondary"
            >
              <template v-slot:selection="{ attrs, item, select, selected }">
                <v-chip
                  v-bind="attrs"
                  :input-value="selected"
                  close
                  @click="select"
                  @click:close="remove(item)"
                >
                  {{ item }}
                </v-chip>
              </template>
            </v-combobox>
          </v-col>
          <v-col cols="12">
            <v-btn
              block
              type="submit"
              color="secondary"
              class="px-4 warning--text"
              large
              :loading="loading"
              :disabled="!valid"
            >
              Create Node
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useNodeApi from '~/compositions/useNodeApi'
import { createStore } from '~/store'

export default defineComponent({
  name: 'CreateNode',
  setup (_ , {root}) {
    const { valid, settings, required, nodeName, form } = useFormValidation()
    const { generateSeed, loading } = useNodeApi(root.$nuxt.context)

    async function createNode () {
      if (form.value.validate()) {
        createStore.SETTINGS(settings.value)
        await generateSeed(nodeName.value, createStore.network)
      }
    }
    function remove (item) {
      settings.value.whitelist = settings.value.whitelist.filter(elem => elem !== item)
    }

    const displayNetwork = computed(() => {
      const n = createStore.network
      return n.charAt(0).toUpperCase() + n.slice(1) 
    })

    return {
      valid,
      settings,
      required,
      nodeName,
      form,
      loading,
      createNode,
      remove,
      displayNetwork
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
