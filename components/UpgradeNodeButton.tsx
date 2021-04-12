import { defineComponent, ref, computed } from '@vue/composition-api'
import { VBtn, VIcon, VDialog } from 'vuetify/lib'
import PrepayPurchaseCard from '~/components/PrepayPurchaseCard'
import { nodeStore, createStore } from '~/store'

export default defineComponent({
  props: {
    nodeId: {
      type: String,
      required: true
    }
  },
  components: {
    VBtn,
    VIcon,
    VDialog
  },
  setup: (props) => {
    const showModal = ref(false)
    const nodeData = computed(() => nodeStore.nodeData(props.nodeId))

    function handleShow () {
    }

    return () => <VBtn
      fab
      absolute
      top
      right
      small
      color="highlight"
      style="right: -10px;"
      onClick={handleShow}
    >
      <VIcon>mdi-plus</VIcon>
      <VDialog value={showModal} onChange={(v: boolean) => showModal.value = v} >
        <PrepayPurchaseCard callbackPath={`/node/${props.nodeId}`} />
      </VDialog>
    </VBtn>
  }
})

