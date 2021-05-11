import { defineComponent, ref } from "@vue/composition-api";
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
import JsonTable from "~/components/core/JsonTable";
import type { JsonData } from "~/components/core/JsonTable";
import { nodeStore } from "~/store";
import { voltageFetch } from "~/utils/fetchClient";
import useFetch from "~/compositions/useFetch";

interface PurchasedItem {
  item: string;
  quantity: number;
}

interface Invoice {
  invoice_id: string;
  creation_date: string;
  due_date: string;
  status: "due"|"late";
  lite_node_hours: number;
  standard_node_hours: number;
  amount_due: number;
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
    const { data, loading, error } = useFetch<any>("/billing", {
      method: "GET",
    });

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

    function transformInvoiceData(invoice: Invoice) {
      return () =>
        ({
          Created: new Intl.DateTimeFormat().format(
            new Date(invoice.creation_date)
          ),
          "Due Date": new Intl.DateTimeFormat().format(
            new Date(invoice.due_date)
          ),
          Status: invoice.status,
          "Lite Node Hours": invoice.lite_node_hours,
          "Standard Node Hours": invoice.standard_node_hours,
          "Amount Due": `$${invoice.amount_due}`,
        } as JsonData);
    }

    const loadingInvoice = ref("");
    const invoiceErr = ref("");
    async function payInvoice({
      invoice,
      method,
    }: {
      invoice: Invoice;
      method: "bitcoin" | "card";
    }) {
      const { invoice_id } = invoice;
      loadingInvoice.value = method;
      try {
        const res = await voltageFetch("/billing/pay", {
          method: "POST",
          body: JSON.stringify({
            invoice_id,
            type: method,
          }),
        });
        if (!res.ok) {
          throw new Error("Invalid status code");
        }
        const { redirect_url } = await res.json();
        console.log({ redirect_url })
        // write to btcpayRedir to redirect back to this page after payment
        if (method === 'bitcoin') {
          localStorage.setItem('btcpayRedir', '/billing')
        }
        window.location = redirect_url;
      } catch (e) {
        invoiceErr.value =
          "An error occured paying the invoice. Please try again later";
      } finally {
        loadingInvoice.value = "";
      }
    }

    return () => {
      if (loading.value) {
        return (
          <v-container class="text-center">
            <v-progress-circular indeterminate />
          </v-container>
        );
      } else if (error.value) {
        return (
          <v-container>
            <v-card color="info" class="text-center pa-3 my-3">
              <div>
                There was an error retrieving your billing information. Please
                try again later
              </div>
            </v-card>
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
                    Your account status is: <b>{data.value.status}</b>
                  </v-card>
                )}
                {data.value?.invoices?.length > 0 && (
                  <div class="text-h6">Bills Due</div>
                )}
                {data.value?.invoices?.length > 0 &&
                  data.value.invoices.map((invoice: Invoice) => (
                    <v-card color="info" class="pa-3 my-3">
                      <JsonTable data={transformInvoiceData(invoice)} />
                      <v-btn
                        loading={loadingInvoice.value === "card"}
                        dark
                        color="highlight"
                        class="mt-3 mx-1"
                        onClick={() => payInvoice({ invoice, method: "card" })}
                      >
                        Pay with Card
                      </v-btn>
                      <v-btn
                        loading={loadingInvoice.value === "bitcoin"}
                        dark
                        color="highlight"
                        class="mt-3 mx-1"
                        onClick={() =>
                          payInvoice({ invoice, method: "bitcoin" })
                        }
                      >
                        Pay with Bitcoin
                      </v-btn>
                    </v-card>
                  ))}
                <div class="text-h6">Subscriptions</div>
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
                          {renderPurchasedNodes({
                            title: "Podcast Nodes",
                            match: "podcast_node",
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
