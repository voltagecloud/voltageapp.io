import { defineComponent, reactive, computed } from "@vue/composition-api";
import useAuthentication from "~/compositions/useAuthentication";
import { authStore } from "~/store";
import { VBtn, VIcon } from "vuetify/lib";
import { useRouter, useRoute } from "@nuxtjs/composition-api";

export default defineComponent({
  components: {
    VNavigationDrawer: () =>
      import("vuetify/lib").then((m) => m.VNavigationDrawer),
    VApp: () => import("vuetify/lib").then((m) => m.VApp),
    VContainer: () => import("vuetify/lib").then((m) => m.VContainer),
    VRow: () => import("vuetify/lib").then((m) => m.VRow),
    VCol: () => import("vuetify/lib").then((m) => m.VCol),
    VList: () => import("vuetify/lib").then((m) => m.VList),
    VListItem: () => import("vuetify/lib").then((m) => m.VListItem),
    VListItemAction: () => import("vuetify/lib").then((m) => m.VListItemAction),
    VListItemTitle: () => import("vuetify/lib").then((m) => m.VListItemTitle),
    VAppBar: () => import("vuetify/lib").then((m) => m.VAppBar),
    VImg: () => import("vuetify/lib").then((m) => m.VImg),
    VMenu: () => import("vuetify/lib").then((m) => m.VMenu),
    VTabs: () => import("vuetify/lib").then((m) => m.VTabs),
    VTab: () => import("vuetify/lib").then((m) => m.VTab),
    VCard: () => import("vuetify/lib").then((m) => m.VCard),
    VMain: () => import("vuetify/lib").then((m) => m.VMain),
    VDivider: () => import("vuetify/lib").then((m) => m.VDivider),
    ErrorSnackbar: () => import("~/components/core/ErrorSnackbar.vue"),
    CoreFooter: () => import("~/components/core/Footer.vue"),
  },
  middleware: ["assertAuthed", "loadUser"],
  setup: (_, ctx) => {
    const router = useRouter();
    const route = useRoute();

    const state = reactive({
      showDrawer: false,
    });

    const tabs = computed<
      { text: string; active: () => boolean; onClick: () => void }[]
    >(() => [
      {
        text: "Nodes",
        onClick: () => router.push("/"),
        active: () =>
          route.value.path === "/" || route.value.path.includes("node"),
      },
      {
        text: "BTCPay Server",
        onClick: () => router.push("/btcpay"),
        active: () => route.value.path.includes("btcpay"),
      },
      {
        text: "Documentation",
        onClick: () => window.open("https://docs.voltage.cloud", "_blank"),
        active: () => false,
      },
    ]);

    const activeTab = computed(() => {
      const res = tabs.value.reduce((acc: null | number, cur, i) => {
        if (typeof acc === "number") return acc;
        if (cur.active()) return i;
        return null;
      }, null);
      return res;
    });

    // aws amplify typescript typings are incorrect smh jeff bezos
    // @ts-ignore
    const username = computed(() => authStore?.user?.attributes?.email || "");

    const isBig = computed(() => ctx.root.$vuetify.breakpoint.mdAndUp);

    const { logout } = useAuthentication();
    const bottomItems = computed(() => {
      const output: {
        title: string;
        icon: string;
        fct: () => any;
      }[] = [
        {
          title: "Dashboards",
          icon: "mdi-laptop",
          fct: () => router.push("/dashboards"),
        },
        {
          title: "Exports",
          icon: "mdi-file-export-outline",
          fct: () => router.push("/exports"),
        },
        {
          title: "Billing",
          icon: "mdi-currency-usd",
          fct: () => router.push("/billing"),
        },
        {
          title: "Settings",
          icon: "mdi-cog-outline",
          fct: () => router.push("/settings"),
        },
      ];
      if (!!authStore.user) {
        output.push({
          title: "Logout",
          icon: "mdi-logout",
          fct: async () => {
            await logout();
            router.push("/login");
          },
        });
      } else {
        output.push({
          title: "Login",
          icon: "mdi-login",
          fct: () => router.push("/login"),
        });
      }
      return output;
    });

    return () => {
      const btnContent = () => (
        <div>
          {username.value}
          {/*
        // @ts-ignore */}
          <VIcon class="ml-3">mdi-account</VIcon>
        </div>
      );

      const list = () => (
        <div>
          <v-list>
            {bottomItems.value.map((e) => (
              <v-list-item key={e.title} onClick={e.fct}>
                <v-list-item-action>
                  {/*
              // @ts-ignore */}
                  <VIcon color="warning darken-1">{e.icon}</VIcon>
                </v-list-item-action>
                <v-list-item-title class="warning--text text--darken-1">
                  {e.title}
                </v-list-item-title>
              </v-list-item>
            ))}
          </v-list>
        </div>
      );

      return (
        <v-app>
          <v-navigation-drawer
            app
            clipped
            right
            value={state.showDrawer && !isBig.value}
            onInput={(v: boolean) => {
              state.showDrawer = v;
            }}
            disable-resize-watcher
          >
            <v-list>
              {tabs.value.map((e) => (
                <v-list-item onClick={e.onClick} class="font-weight-bold">
                  {e.text}
                </v-list-item>
              ))}
            </v-list>
            <v-divider class="font-weight-bold" />
            <v-list>
              <v-list-item>
                <v-list-item-title>{username.value}</v-list-item-title>
                <v-list-item-action>
                  {/*
              // @ts-ignore */}
                  <VIcon>mdi-account</VIcon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            {list()}
          </v-navigation-drawer>
          <v-app-bar app clipped-right color="warning" dark>
            <nuxt-link to="/">
              <v-img
                src={require("~/assets/logo/voltage-logo-white.png")}
                max-height="23"
                max-width="130"
                contain
              />
            </nuxt-link>
            <v-tabs class="d-flex flex-grow-1 mx-6" value={activeTab.value}>
              {tabs.value.map((elem) => (
                <v-tab
                  onClick={elem.onClick}
                  class="d-none d-md-flex mx-3"
                  text
                >
                  {elem.text}
                </v-tab>
              ))}
            </v-tabs>
            {isBig.value ? (
              <v-menu
                offset-y
                scopedSlots={{
                  activator: ({ attrs, on }: { attrs: any; on: any }) => (
                    <VBtn key="sm" text {...attrs} {...{ on }}>
                      {btnContent()}
                    </VBtn>
                  ),
                }}
              >
                <v-card>{list()}</v-card>
              </v-menu>
            ) : (
              <VBtn
                onClick={() => {
                  state.showDrawer = true;
                }}
                text
                key="lg"
              >
                <VIcon>mdi-menu</VIcon>
              </VBtn>
            )}
          </v-app-bar>
          <v-main class={{ background: route.value.path !== "settings" }}>
            <nuxt />
          </v-main>
          <error-snackbar />
          <core-footer />
        </v-app>
      );
    };
  },
});
