import { defineComponent } from "@vue/composition-api";
import useFetch from "~/compositions/useFetch";

export default defineComponent({
  setup: () => {
    const { dispatch: reload, data, loading, error } = useFetch(
      "/user/api_key",
      {
        method: "GET",
      }
    );

    const { dispatch: del, loading: deleting, error: deleteError } = useFetch(
      "/user/api_key/delete"
    );

    async function deleteKey(key_id: string) {
      await del({
        method: "POST",
        body: JSON.stringify({
          key_id,
        }),
      });
      await reload();
    }

    const {
      dispatch: create,
      loading: creating,
      error: createError,
    } = useFetch("/user/api_key/create");

    return () => (
      <v-card color="secondary">
        <v-container>
          <div class="d-flex flex-column align-center">
            <div class="text-h6">Api Keys</div>
            <div>
              You can create up to 5 keys per account which allow you to
              interact with voltage programatically via the Voltage API. API
              keys can be revoked at any time and will only be displayed once
              when they are created.
            </div>
          </div>
        </v-container>
      </v-card>
    );
  },
});
