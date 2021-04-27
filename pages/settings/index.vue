<template lang="pug">
  v-container
    v-row(justify='center')
      v-col(cols='12' xl='8')
        v-card(color='info')
          v-container.py-0
            div.d-flex.flex-row.align-center
              v-col(cols='auto') Email:
              v-spacer
               v-col(cols='auto').warning--text {{emailAddr}}
            v-divider
            div.d-flex.flex-row.align-center
              v-col(cols='auto') Password
              v-spacer
              v-dialog(max-width='800' v-model='openPW')
                template(v-slot:activator='{ on }')
                  v-btn(color='secondary' v-on='on').warning--text Change Password
                change-password(@done='openPW = false')
            v-divider
            div.d-flex.flex-row.align-center
              v-col(cols='auto') {{ MFAText }}
              v-spacer
              template(v-if='!MFAEnabled')
                v-dialog(max-width='800' v-model='openMFA')
                  template(v-slot:activator='{ on }')
                    v-btn(color='secondary' v-on='on' :loading='loading').warning--text Enable MFA
                  enable-mfa(@done='handleComplete')
              template(v-else)
                v-btn(color='secondary' @click='disableMfa' :loading='loading').warning--text Disable MFA
            v-divider
            div.d-flex.flex-row.align-center
              v-col(cols='auto') Card Billing
              v-spacer
              v-dialog(max-width='800')
                template(v-slot:activator='{ on }')
                  v-btn(color='secondary' v-on='on' @click='portal' :loading='billingLoading').warning--text Open Dashboard
            v-divider
            div.d-flex.flex-row.align-center
              v-col(cols='auto') Support
              v-spacer
              v-dialog(max-width='800')
                template(v-slot:activator='{ on }')
                  v-btn(color='secondary' href="mailto:support@voltage.cloud").warning--text Email Support
</template>
<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  onMounted,
} from "@vue/composition-api";
import Auth from "@aws-amplify/auth";
import { authStore } from "~/store";

export default defineComponent({
  components: {
    EnableMfa: () => import("~/components/EnableMfa.vue"),
    ChangePassword: () => import("~/components/ChangePassword.vue"),
  },
  setup(_, { root }) {
    const loading = ref(true);
    const billingLoading = ref(false);
    const MFAState = ref("NOMFA");
    const MFAEnabled = computed(() => MFAState.value === "SOFTWARE_TOKEN_MFA");

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

    onMounted(loadMFAState);

    const openPW = ref(false);
    const openMFA = ref(false);
    // @ts-ignore
    const emailAddr = authStore.user.attributes.email;

    const MFAText = computed(() => {
      if (loading.value) {
        return "Loading MFA settings...";
      } else if (MFAEnabled.value) {
        return "MFA is enabled";
      } else {
        return "MFA is disabled";
      }
    });

    async function handleComplete() {
      openMFA.value = false;
      await loadMFAState();
    }

    async function disableMfa() {
      loading.value = true;
      const user = await Auth.currentAuthenticatedUser();
      await Auth.setPreferredMFA(user, "NOMFA");
      await loadMFAState();
      loading.value = false;
    }

    async function portal() {
      billingLoading.value = true;
      const res = await root.$nuxt.context.$axios.post("/stripe/portal", {});
      if ("portal_url" in res.data) {
        const portalUrl = res.data.portal_url;
        window.location.replace(portalUrl);
      }
      billingLoading.value = false;
      loading.value = false;
    }

    return {
      MFAState,
      openPW,
      openMFA,
      emailAddr,
      MFAText,
      handleComplete,
      disableMfa,
      MFAEnabled,
      loading,
      billingLoading,
      portal,
    };
  },
});
</script>
