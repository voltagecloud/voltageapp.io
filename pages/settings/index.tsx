import { defineComponent, computed, ref } from "@vue/composition-api";
import { authStore } from "~/store";
import Auth from "@aws-amplify/auth";
import { voltageFetch } from "~/utils/fetchClient";
import {
  VContainer,
  VCol,
  VDialog,
  VBtn,
  VSpacer,
  VCard,
  VDivider,
} from "vuetify/lib";
import ApiKeys from "~/components/ApiKeys";

export default defineComponent({
  components: {
    VContainer,
    VCol,
    VDialog,
    VBtn,
    VSpacer,
    VCard,
    VDivider,
    EnableMfa: () => import("~/components/EnableMfa.vue"),
    ChangePassword: () => import("~/components/ChangePassword.vue"),
  },
  setup: () => {
    // amplify doesnt have correct typings
    const emailAddr = computed<string>(
      // @ts-ignore
      () => authStore.user?.attributes?.email || ""
    );

    // hold state of dialog
    const openMFA = ref(false);
    const MFAState = ref("NOMFA");
    const MFAEnabled = computed(() => MFAState.value === "SOFTWARE_TOKEN_MFA");

    const openPw = ref(false);

    const loading = ref(false);
    async function loadMFAState() {
      if (authStore.user) {
        loading.value = true;
        const user = await Auth.currentAuthenticatedUser();
        const res = await Auth.getPreferredMFA(user, {
          bypassCache: true,
        });
        MFAState.value = res;
        loading.value = false;
      }
    }
    loadMFAState();

    async function handleComplete() {
      openMFA.value = false;
      await loadMFAState();
    }

    const MFAText = computed(() => {
      if (loading.value) {
        return "Loading MFA settings...";
      } else if (MFAEnabled.value) {
        return "MFA is enabled";
      } else {
        return "MFA is disabled";
      }
    });

    async function disableMfa() {
      loading.value = true;
      const user = await Auth.currentAuthenticatedUser();
      await Auth.setPreferredMFA(user, "NOMFA");
      await loadMFAState();
      loading.value = false;
    }

    const billingLoading = ref(false);
    const billingError = ref("");
    async function portal() {
      billingLoading.value = true;
      try {
        const res = await voltageFetch("/stripe/portal", {
          method: "POST",
          body: JSON.stringify({}),
        });

        const { portal_url } = await res.json();
        if (!portal_url) throw new Error("Portal url not found in response");
        window.location.replace(portal_url);
      } catch (e) {
        console.error(e);
        billingError.value = "An error occured, please try again later";
      } finally {
        billingLoading.value = false;
      }
    }

    // hold api keys dialog state
    const apiKeys = ref(false)

    return () => (
      <v-container>
        <div class="d-flex flex-row justify-center">
          <v-col cols="12" xl="8">
            <v-card color="info">
              <v-container>
                <div class="d-flex flex-row align-center">
                  <v-col cols="auto">Email:</v-col>
                  <v-spacer />
                  <v-col cols="auto" class="warning--text">
                    {emailAddr.value}
                  </v-col>
                </div>
                <v-divider />
                <div class="d-flex flex-row align-center">
                  <v-col cols="auto">Password</v-col>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    onClick={() => (openPw.value = true)}
                    class="warning--text"
                  >
                    Change Password
                  </v-btn>
                  <v-dialog
                    value={openPw.value}
                    max-width="800"
                    onInput={(v: boolean) => (openPw.value = v)}
                  >
                    <change-password onDone={() => (openPw.value = false)} />
                  </v-dialog>
                </div>
                <v-divider />
                <div class="d-flex flex-row align-center">
                  <v-col cols="auto">{MFAText.value}</v-col>
                  <v-spacer />
                  {!MFAEnabled.value ? (
                    <div>
                      <v-dialog
                        max-width="800"
                        value={openMFA.value}
                        onInput={(v: boolean) => (openMFA.value = v)}
                      >
                        <enable-mfa onDone={handleComplete} />
                      </v-dialog>
                      <v-btn
                        color="secondary"
                        loading={loading.value}
                        class="warning--text"
                        onClick={() => (openMFA.value = true)}
                      >
                        Enable MFA
                      </v-btn>
                    </div>
                  ) : (
                    <v-btn
                      color="secondary"
                      onClick={disableMfa}
                      loading={loading.value}
                      class="warning--text"
                    >
                      Disable MFA
                    </v-btn>
                  )}
                </div>
                <v-divider />
                <div class="d-flex flex-row align-center">
                  <v-col cols="auto">Card Billing</v-col>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    onClick={portal}
                    loading={billingLoading.value}
                    class="warning--text"
                  >
                    Open Dashboard
                  </v-btn>
                </div>
                <v-divider />
                <div class="d-flex flex-row align-center">
                  <v-col cols="auto">API Keys</v-col>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    onClick={() => apiKeys.value = true}
                    class="warning--text"
                  >
                    View
                  </v-btn>
                  <v-dialog value={apiKeys.value} onInput={(v: boolean) => apiKeys.value = v} max-width="800">
                    <ApiKeys />
                  </v-dialog>
                </div>
                <v-divider />
                <div class="d-flex flex-row align-center">
                  <v-col cols="auto">Support</v-col>
                  <v-spacer />
                  <v-btn
                    color="secondary"
                    href="mailto:support@voltage.cloud"
                    class="warning--text"
                  >
                    Email Support
                  </v-btn>
                </div>
              </v-container>
            </v-card>
          </v-col>
        </div>
      </v-container>
    );
  },
});
