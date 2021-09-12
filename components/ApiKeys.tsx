import { defineComponent, ref, watch, computed } from "@vue/composition-api";
import useFetch from "~/compositions/useFetch";
import {
  VBtn,
  VCard,
  VProgressCircular,
  VTextField,
  VContainer,
  VDivider,
} from "vuetify/lib";

interface ApiKey {
  alias: string;
  apikey_id: string;
  // TEMP should be the same
  created?: string;
  creation_date?: string;
}

interface FreshApiKey extends ApiKey {
  api_key: string;
}

export default defineComponent({
  components: {
    VBtn,
    VCard,
    VProgressCircular,
    VTextField,
    VContainer,
    VDivider,
    CopyPill: () => import("~/components/core/CopyPill.vue"),
  },
  setup: () => {
    const { dispatch: reload, data, loading, error } = useFetch<{
      keys: ApiKey[];
    }>("/user/api_key", {
      method: "GET",
    });

    const { dispatch: del, loading: deleting, error: deleteError } = useFetch(
      "/user/api_key/delete"
    );

    async function deleteKey(apikey_id: string) {
      await del({
        method: "POST",
        body: JSON.stringify({
          apikey_id,
        }),
      });
      await reload();
    }

    const {
      dispatch: create,
      data: createData,
      loading: creating,
      error: createError,
    } = useFetch<FreshApiKey>("/user/api_key/create");

    const showCreateInput = ref(false);
    const keyAlias = ref("");
    const keyAliasValidation = ref("");

    // reset validation error on input
    watch(keyAlias, () => (keyAliasValidation.value = ""));

    async function createKey() {
      if (!keyAlias.value) {
        keyAliasValidation.value = "Field cannot be blank";
        return;
      }
      if (createData.value) {
        await reload();
      }
      await create({
        method: "POST",
        body: JSON.stringify({
          alias: keyAlias.value,
        }),
      });
      showCreateInput.value = false;
      keyAlias.value = "";
    }

    function renderKey(k: ApiKey | FreshApiKey) {
      const d = k.creation_date || k.created || "";
      return (
        <div style="width: 100%">
          <div class="d-flex flex-row justify-space-between my-2">
            <div>Key Name: {k.alias}</div>
            <div>
              Created:{" "}
              {new Intl.DateTimeFormat().format(new Date(d.slice(0, -1)))}
            </div>
            {"api_key" in k ? (
              <div>
                Key: <copy-pill text={k.api_key} />
              </div>
            ) : (
              <v-btn
                onClick={() => deleteKey(k.apikey_id)}
                color="highlight"
                dark
              >
                Revoke Key
              </v-btn>
            )}
          </div>
          <v-divider />
        </div>
      );
    }

    const canCreateKey = computed(() => {
      const newKey = createData.value ? 1 : 0;
      const oldKeys = data.value?.keys?.length || 0;
      return newKey + oldKeys < 5;
    });

    function renderKeyCreation() {
      if (showCreateInput.value) {
        return (
          <div
            class="d-flex flex-row justify-center align-center"
            style="width: 100%"
          >
            <v-text-field
              full-width
              value={keyAlias.value}
              onInput={(v: string) => (keyAlias.value = v)}
              error-messages={keyAliasValidation.value}
              label="Key Name"
              class="ma-2"
              outlined
            />
            <v-btn
              dark
              class="mb-6"
              color="highlight"
              onClick={createKey}
              loading={creating.value}
            >
              Create Key
            </v-btn>
          </div>
        );
      }
      return (
        <v-btn
          dark
          class="mt-3"
          color="highlight"
          onClick={() => (showCreateInput.value = true)}
        >
          Create a New Key
        </v-btn>
      );
    }

    return () => (
      <v-card color="secondary">
        <v-container>
          <div class="d-flex flex-column align-start">
            <div class="v-card__title">Api Keys</div>
            <div class="mx-3 mb-3">
              <div class="font-weight-light">
                You can create up to 5 keys per account which allow you to
                interact with Voltage programmatically via the Voltage API.
                Keys will only be displayed once when they are created.
              </div>
              <a href="#">API Documentation</a>
            </div>
            <div style="width: 100%">
              <v-divider />
            </div>
            {data.value?.keys ? (
              data.value.keys
                .filter((key) => key.apikey_id !== createData.value?.apikey_id)
                .map((key) => renderKey(key))
            ) : loading.value ? (
              <v-progress-circular indeteminate />
            ) : !createData.value ? (
              <div>No Api Keys found</div>
            ) : (
              false
            )}
            {createData.value && renderKey(createData.value)}
            {canCreateKey.value && renderKeyCreation()}
            {error.value && <div class="error--text">There was an error retrieving your API Keys.</div>}
            {creating.value || deleting.value && <div class="error--text">Processing...</div>}
          </div>
        </v-container>
      </v-card>
    );
  },
});
