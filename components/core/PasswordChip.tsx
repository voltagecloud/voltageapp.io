import { defineComponent, createElement, computed, ref } from '@vue/composition-api'

const h = createElement

export default defineComponent({
  components: {
    VChip: () => import('vuetify/lib').then(m => m.VChip),
    VIcon: () => import('vuetify/lib').then(m => m.VIcon)
  },
  props: {
    password: {
      type: String,
      required: true
    }
  },
  setup: (props) => {
    const show = ref(false)

    const icon = computed(() => show.value ? 'mdi-eye-off' : 'mdi-eye')
    const bulletText = computed(() => '•'.repeat(props.password.length))

    return () => <v-chip onClick={() => show.value = !show.value} color="accent" text-color="warning">
      { show.value ? props.password : bulletText.value }
      <v-icon right>
        {icon.value}
      </v-icon>
    </v-chip>
  }
})

