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
      showCreateInput.value = false
      keyAlias.value = ''
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
                Key: <span class="overline" style="word-break: break-all;">{k.api_key}</span>
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
          <div class="d-flex flex-row justify-center align-center" style="width: 100%">
            <v-text-field
              full-width
              value={keyAlias.value}
              onInput={(v: string) => (keyAlias.value = v)}
              error-messages={keyAliasValidation.value}
              label="Key Name"
              class="ma-2"
              outlined
            />
            <v-btn dark class="mb-6" color="highlight" onClick={createKey} loading={creating.value}>
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
            <div class="text-h6">Api Keys</div>
            <div>
              You can create up to 5 keys per account which allow you to
              interact with voltage programatically via the Voltage API. API
              keys can be revoked at any time and will only be displayed once
              when they are created.
            </div>
            <v-divider />
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
          </div>
        </v-container>
      </v-card>
    );
  },
});
