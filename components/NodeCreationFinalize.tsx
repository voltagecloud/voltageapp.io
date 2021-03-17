import { defineComponent, computed, ref } from "@vue/composition-api";
import { useRouter } from '@nuxtjs/composition-api'
import { VCard, VContainer, VCol, VTextField, VIcon, VBtn } from "vuetify/lib";
import { createStore } from "~/store";
import { useConfirmPassword } from "~/compositions/useConfirmPassword";

export default defineComponent({
  setup: () => {
    const nodeName = computed({
      get: () => createStore.nodeName,
      set: (v: string) => createStore.NODE_NAME(v),
    });

    // fill createStore
    createStore.DESERIALIZE()

    const createError = computed(() => createStore.createError || createStore.populateError)

    const {
      password,
      confirmPassword,
      handlePassword,
      handleConfirm,
      inputType,
      showPassword,
      validate,
    } = useConfirmPassword();

    const router = useRouter()

    const message = ref('')
    async function createNode () {
      const passwordValid = validate()
      if (!passwordValid) return
      // commit to store for use during node waiting_init
      createStore.PASSWORD(password.value)

      message.value = 'Creating Node'
      await createStore.dispatchCreate()
      message.value = ''

      if (createStore.createError) return

      message.value = 'Populating node settings'
      await createStore.dispatchPopulate()
      message.value = ''

      if (!createStore.populateError) {
        router.push(`/node/${createStore.nodeId}`)
      }
    }

    return () => (
      <VContainer>
        <div class="d-flex flex-row justify-center">
          <VCol cols="12" md="10" lg="8">
            <VCard color="info">
              <div class="text-h5 pa-3">Node Name</div>
              <div class="mx-12">
                <VTextField
                  outlined
                  background-color="secondary"
                  value={nodeName.value}
                  onInput={(v: string) => (nodeName.value = v)}
                />
              </div>
              <div class="text-h5 pa-3">Node Password</div>
              <div class="mx-12 d-flex flex-column">
                <VTextField
                  outlined
                  background-color="secondary"
                  value={password.value}
                  onInput={handlePassword}
                  type={inputType.value}
                >
                  <VIcon
                    slot="append"
                    onClick={() => (showPassword.value = !showPassword.value)}
                  >
                    {showPassword.value ? "mdi-eye-off" : "mdi-eye"}
                  </VIcon>
                </VTextField>
                <VTextField
                  outlined
                  background-color="secondary"
                  value={confirmPassword.value}
                  onInput={handleConfirm}
                  type={inputType.value}
                />
              </div>
              <div class="mx-12 pb-3">
                <VBtn block onClick={createNode} loading={!!message.value}>Create Node</VBtn>
                <div>{message.value}</div>
                <div class="error--text">{createError.value?.message || ''}</div>
              </div>
            </VCard>
          </VCol>
        </div>
      </VContainer>
    );
  },
});
