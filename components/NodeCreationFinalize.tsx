import { defineComponent, computed, ref } from "@vue/composition-api";
import { useRouter } from "@nuxtjs/composition-api";
import {
  VCard,
  VContainer,
  VCol,
  VTextField,
  VIcon,
  VBtn,
  VCheckbox,
  VFileInput,
} from "vuetify/lib";
import { createStore, macaroonStore } from "~/store";
import { useConfirmPassword } from "~/compositions/useConfirmPassword";
import useFetch from "~/compositions/useFetch";

export default defineComponent({
  setup: () => {
    const nodeName = computed({
      get: () => createStore.nodeName,
      set: (v: string) => createStore.NODE_NAME(v),
    });

    // fill createStore
    createStore.DESERIALIZE();

    const {
      password,
      confirmPassword,
      handlePassword,
      handleConfirm,
      inputType,
      showPassword,
      validate,
      error,
    } = useConfirmPassword();

    const router = useRouter();

    // hold status message of request
    const message = ref("");
    // hold state of if /create has been called
    // used to prevent recurring /create requests
    const hasRetried = ref(false);

    async function createNode() {
      // reset store errors
      createStore.CREATE_ERROR({});
      createStore.POPULATE_ERROR({});

      const passwordValid = validate();
      if (!passwordValid) return;
      // commit to store for use during node waiting_init
      createStore.PASSWORD(password.value);

      if (isSCBRestore.value) {
        const restoreValid = handleRestore();
        if (!restoreValid) return;
      }

      message.value = "Populating node settings";
      await createStore.dispatchPopulate();
      message.value = "";

      if (!createStore.populateError) {
        // creation was successful write password to macaroon store
        macaroonStore.NODE_PASSWORD({
          password: password.value,
          nodeId: createStore.nodeId,
        });
        router.push(`/node/${createStore.nodeId}`);
      } else if (
        createStore.populateError?.message ===
          "This node has not been created yet" &&
        createStore.nodeId &&
        !hasRetried.value
      ) {
        createStore.dispatchCreate();
        hasRetried.value = true;
        await createNode();
      }
    }

    // node name checking
    const onBlurName = ref("");
    const reqOpts = computed(() => ({
      method: "POST",
      body: JSON.stringify({
        network: createStore.network,
        node_name: onBlurName.value,
      }),
      pause: computed(() => !!onBlurName.value),
    }));

    // are we doing a restore from SCB?
    const isSCBRestore = ref(false);
    const recoveryWindow = ref(2500);
    const seedPhrase = ref("");
    const aezeedPhrase = ref("");
    const scbFile = ref<File | null>(null);

    function getBase64(file: File) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        // This should be a string because readAsDataURL returns strings
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }

    function handleRestore(): boolean {
      const seed = seedPhrase.value.trim().split(" ");

      const aezeedPassphrase = aezeedPhrase.value
        ? aezeedPhrase.value.trim()
        : null;

      if (seed.length !== 24) {
        createStore.CREATE_ERROR({
          error: Error("Invalid seed phrase. Expected 24 words."),
        });
        return false;
      }

      if (recoveryWindow.value < 0 || isNaN(recoveryWindow.value)) {
        createStore.CREATE_ERROR({
          error: Error("Invalid Recovery Window. The default is 2500."),
        });
        return false;
      }

      // if a SCB file is select convert it to base64 and save it to the store
      if (scbFile.value) {
        getBase64(scbFile.value)
          .then((b64: string) => {
            // TODO is there a more robust way of stripping off that data uri junk?
            let scb = b64.substr(b64.indexOf(",") + 1);

            createStore.RESTORE({
              recoveryWindow: recoveryWindow.value,
              seedPhrase: seed,
              scb,
              aezeedPassphrase,
            });
          })
          .catch((e) => {
            createStore.CREATE_ERROR(e);
            return false;
          });
        // otherwise provide a null SCB
      } else {
        createStore.RESTORE({
          recoveryWindow: recoveryWindow.value,
          seedPhrase: seed,
          scb: null,
          aezeedPassphrase,
        });
      }

      return true;
    }

    function handleFile(file: File) {
      scbFile.value = file;
    }

    const { loading, data } = useFetch<{
      taken: boolean;
      valid: boolean;
      node_name: string;
    }>("/node/name", reqOpts);
    const errorMessage = computed(() => {
      if (!data.value) return "";
      else if (data.value.taken) return "This node name is already taken";
      else if (!data.value.valid) return "This node name is not valid";
    });

    return () => (
      <VContainer>
        <div class="d-flex flex-row justify-center">
          <VCol cols="12" md="10" lg="8">
            <VCard color="info">
              <div class="font-weight-light warning--text text--darken-1 text-h5 px-3 pt-3">
                Node Name
              </div>
              <div class="text-caption px-3 pb-3">
                Give your node a name. This will be part of your API endpoint
                and can't be changed.
              </div>
              <div class="mx-12 mb-4">
                <VTextField
                  outlined
                  background-color="secondary"
                  label="Name"
                  value={nodeName.value}
                  onInput={(v: string) => (nodeName.value = v)}
                  onBlur={() => (onBlurName.value = nodeName.value)}
                  loading={loading.value && "highlight"}
                  error-messages={errorMessage.value}
                />
              </div>
              <div class="font-weight-light warning--text text--darken-1 text-h5 px-3 pt-3">
                Node Password
              </div>
              <div class="text-caption px-3 pb-3">
                Each node requires a unique password used for encryption.
              </div>
              <div class="mx-12 d-flex flex-column mb-6">
                <VTextField
                  outlined
                  background-color="secondary"
                  label="Password"
                  value={password.value}
                  onInput={handlePassword}
                  type={inputType.value}
                  error-messages={error.value}
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
                  label="Confirm Password"
                  value={confirmPassword.value}
                  onInput={handleConfirm}
                  type={inputType.value}
                />
                <div class="warning--text text--darken-1">
                  Write this password down! You need it to unlock your node.
                  Also, your node's seed and macaroons are encrypted to this
                  password. Losing this password means losing access to your
                  node and backups. <b>Voltage can not reset it.</b>
                </div>
              </div>

              <div class="pt-3 px-3 text--darken-1">
                <VCheckbox
                  value={isSCBRestore.value}
                  onChange={(v: boolean) => (isSCBRestore.value = v)}
                  label="Restore existing node from Seed and Static Channel Backup"
                />
              </div>

              {isSCBRestore.value ? (
                <div class="mx-12 d-flex flex-column mb-6">
                  <div class="warning--text text--darken-1 pb-3">
                    This should only be used if you want to{" "}
                    <a
                      style="color: black;"
                      target="_blank"
                      href="https://github.com/lightningnetwork/lnd/blob/master/docs/recovery.md"
                    >
                      restore a node due to data loss
                    </a>
                    . Using an SCB will force-close all of your channels. Use
                    with caution!
                  </div>
                  <VTextField
                    outlined
                    background-color="secondary"
                    label="Recovery Window"
                    value={recoveryWindow.value}
                    onInput={(v: string) => {
                      let parsedValue = parseInt(v);
                      if (isNaN(parsedValue)) {
                        recoveryWindow.value = 0;
                      } else {
                        recoveryWindow.value = parsedValue;
                      }
                    }}
                    type="text"
                  />

                  <VTextField
                    outlined
                    background-color="secondary"
                    label="Seed Phrase"
                    value={seedPhrase.value}
                    onInput={(v: string) => (seedPhrase.value = v)}
                    type="text"
                  />

                  <VTextField
                    outlined
                    background-color="secondary"
                    label="AEZeed Passphrase (optional)"
                    value={aezeedPhrase.value}
                    onInput={(v: string) => (aezeedPhrase.value = v)}
                    type="text"
                  />

                  <VFileInput
                    show-size
                    label="Static Channel Backup File (Optional)"
                    onChange={handleFile}
                  />
                </div>
              ) : null}

              <div class="mx-12 pb-3">
                <VBtn block onClick={createNode} loading={!!message.value}>
                  Create Node
                </VBtn>
                <div class="error--text pt-1 pb-1">
                  {createStore.populateError?.message ||
                    createStore.createError?.message ||
                    ""}
                </div>
              </div>
            </VCard>
          </VCol>
        </div>
      </VContainer>
    );
  },
});
