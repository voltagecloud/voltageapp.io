import { defineComponent, computed, reactive } from "@vue/composition-api";
import {
  VContainer,
  VSheet,
  VTextField,
  VCol,
  VRow,
  VImg,
  VBtn,
} from "vuetify/lib";

import { authStore } from "~/store";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default defineComponent({
  setup: (_, ctx) => {
    async function submitRedeemCode() {
      state.loading = true;
      try {
        let code = state.redeemCode.trim();
        console.log("SUBMITTING REDEEM CODE:", code);
        const res = await ctx.root.$axios.post("/billing/redeem", {
          code,
        });
        if (res.status === 200) {
          state.errorMessage = "";
          state.successMessage = "Code accepted. Enjoy your credits!";
        }
      } catch (e) {
        console.error(e);
        if (e.response?.data?.message) {
          state.errorMessage = capitalize(e.response.data.message);
        } else {
          state.errorMessage = "There was a problem redeeming your code";
        }
      } finally {
        state.loading = false;
      }
    }

    const state = reactive<{
      redeemCode: string;
      errorMessage: string;
      successMessage: string;
      loading: boolean;
    }>({
      redeemCode: "",
      errorMessage: "",
      successMessage: "",
      loading: false,
    });

    return () => (
      <VContainer>
        <VRow justify="center" align="center" no-gutters="no-gutters">
          <VCol cols="12" md="11" lg="9">
            <VSheet class="rounded-lg d-flex flex-column justify-center align-center pa-3 text-center">
              <div class="text-h4 my-6">FREE VOLTAGE NODES</div>
              <VImg src={require("~/assets/hackforfreedom.png")} />
              <div class="overline my-3">
                Every contestant gets enough credits to run 2 Standard nodes for
                30 days.
              </div>
              {!authStore.user ? (
                <span>
                  <div>
                    Register or Login to your Voltage account to redeem your
                    credits.
                  </div>
                  <p />
                  <VBtn
                    block
                    dark
                    color="highlight"
                    to="/register"
                    class="my-2"
                  >
                    Register
                  </VBtn>
                </span>
              ) : (
                <div class="d-flex flex-column align-center">
                  <div class="my-3 text-h5">How to Redeem</div>
                  <p>
                    Enter the code received from Impervious below. Click "Redeem
                    Code."
                  </p>
                  <p>
                    Click on "Nodes" in the top left and provision a new node.
                  </p>
                  <p>
                    When creating your new node be sure to select "Pay per Hour"
                    and "Standard."
                  </p>
                  <p>That’s it! Start hacking on your projects.</p>

                  <p />

                  <VTextField
                    onInput={(val: string) => {
                      state.redeemCode = val;
                    }}
                    value={state.redeemCode}
                    outlined
                    background-color="secondary"
                    placeholder="Enter code here"
                    color="highlight"
                    rules={[
                      (val: string) => !!val || "Redeem code can't be empty",
                    ]}
                  />
                  <VBtn
                    class="mb-2"
                    color="highlight"
                    dark
                    onClick={() => submitRedeemCode()}
                  >
                    Redeem Code
                  </VBtn>
                  <div class="text--error">
                    {state.errorMessage || state.successMessage}
                  </div>
                  <p />
                  <p>
                    <em>
                      Be sure to delete your nodes when you're done with the
                      hackathon to prevent unexpected charges.
                    </em>
                  </p>
                </div>
              )}
              <p />
              <p>
                If you have any questions please let us know at{" "}
                <a href="mailto:support@voltage.cloud">support@voltage.cloud</a>
              </p>
            </VSheet>
          </VCol>
        </VRow>
      </VContainer>
    );
  },
});
