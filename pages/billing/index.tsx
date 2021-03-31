import { defineComponent } from "@vue/composition-api";
import {
  VContainer,
  VRow,
  VCol,
  VCard,
  VSimpleTable,
  VChip,
  VBtn,
  VProgressCircular,
} from "vuetify/lib";
import { nodeStore } from "~/store";
import useFetch from "~/compositions/useFetch";

interface PurchasedItem {
  item: string;
  quantity: number;
}

export default defineComponent({
  components: {
    VContainer,
    VRow,
    VCol,
    VCard,
    VSimpleTable,
    VChip,
    VBtn,
    VProgressCircular,
  },
  setup: (_, ctx) => {
    const { data, dispatch, loading, error } = useFetch<any>("/billing");

    dispatch({ method: "GET" });

    const renderLinkedNodes = (ids: string[]) => {
      const linkedNodes = ids.reduce((acc: any, cur: any) => {
        let nodeItem = null;
        for (const node of nodeStore.IDNames) {
          if (node.node_id === cur) {
            nodeItem = (
              <v-chip
                color="accent"
                text-color="warning"
                onClick={() => ctx.root.$router.push(`/node/${cur}`)}
              >
                {node.node_name}
              </v-chip>
            );
            break;
          }
        }
        return !!nodeItem ? [...acc, nodeItem] : acc;
      }, []);
      return linkedNodes.length ? linkedNodes : <div>None</div>;
    };

    const renderPurchasedNodes = ({
      title,
      match,
      items,
    }: {
      title: string;
      match: string;
      items: PurchasedItem[];
    }) => {
      const purchased = items.reduce((acc: number, cur: any) => {
        return cur.item === match ? cur.quantity + acc : acc;
      }, 0);
      if (purchased) {
        return (
          <tr>
            <td>
              <b>{title}</b>
            </td>
            <td>{purchased}</td>
          </tr>
        );
      }
    };

    return () => {
      if (loading.value) {
        return (
          <v-container class="text-center">
            <v-progress-circular indeterminate />
          </v-container>
        );
      } else if (error.value) {
        return (
          <v-container class="text-center">
            <div>
              There was an error retrieving your billing information. Please try
              again later
            </div>
          </v-container>
        );
      } else if (data.value?.status) {
        return (
          <v-container>
            <v-row justify="center">
              <v-col cols="12" lg="10">
                <v-btn
                  color="highlight"
                  dark
                  class="ml-auto"
                  nuxt
                  to="/purchase"
                >
                  Buy New Subscription
                </v-btn>
              </v-col>
              <v-col cols="12" lg="10">
                {error.value && (
                  <v-card class="pa-3 text-h4">{error.value}</v-card>
                )}
                {data.value && data.value.status !== "active" && (
                  <v-card class="pa-3 text-center">
                    Warning, your account status is: {data.value.status}
                  </v-card>
                )}
                {data.value &&
                  data.value.subscriptions.map((sub: any) => (
                    <v-card color="info" class="pa-3 my-3">
                      <v-simple-table
                        style={{
                          "background-color":
                            ctx.root.$vuetify.theme.currentTheme.secondary,
                        }}
                      >
                        <tbody>
                          <tr>
                            <td>
                              <b>Status</b>
                            </td>
                            <td>{sub.status}</td>
                          </tr>
                          <tr>
                            <td>
                              <b>Method</b>
                            </td>
                            <td>{sub.payment_method}</td>
                          </tr>
                          <tr>
                            <td>
                              <b>Billing Interval</b>
                            </td>
                            <td>{sub.interval}</td>
                          </tr>
                          <tr>
                            <td>
                              <b>Price</b>
                            </td>
                            <td>{sub.price}</td>
                          </tr>
                          <tr>
                            <td>
                              <b>Renewal Date</b>
                            </td>
                            <td>{sub.renewal_date}</td>
                          </tr>
                          <tr>
                            <td>
                              <b>Renewal Type</b>
                            </td>
                            <td>{sub.renewal_type}</td>
                          </tr>
                          {renderPurchasedNodes({
                            title: "BTCPay Servers",
                            match: "btcpayserver",
                            items: sub.items,
                          })}
                          {renderPurchasedNodes({
                            title: "Standard Nodes",
                            match: "standard_node",
                            items: sub.items,
                          })}
                          {renderPurchasedNodes({
                            title: "Lite Nodes",
                            match: "lite_node",
                            items: sub.items,
                          })}
                          <tr>
                            <td>
                              <b>Linked Items</b>
                            </td>
                            <td>
                              {renderLinkedNodes([
                                ...sub.lite_nodes,
                                ...sub.nodes,
                              ])}
                            </td>
                          </tr>
                        </tbody>
                      </v-simple-table>
                      <v-container class="pb-0">
                        <v-row justify="end">
                          <v-btn
                            color="highlight"
                            href={sub.payment_link}
                            target="_blank"
                            dark
                            class="my-3"
                          >
                            Manage Subscription
                          </v-btn>
                        </v-row>
                      </v-container>
                    </v-card>
                  ))}
              </v-col>
            </v-row>
          </v-container>
        );
      }
    };
  },
});
