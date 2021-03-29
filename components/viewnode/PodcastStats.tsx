import { defineComponent, PropType, computed, ref } from "@vue/composition-api";
import { macaroonStore } from "~/store";
import JsonTable, { JsonData } from "~/components/core/JsonTable";
import { VProgressCircular } from "vuetify/lib";
import type { Node } from "~/types/apiResponse";

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
    macaroon: {
      type: Object as PropType<ReturnType<typeof macaroonStore.macaroonState>>,
      required: true,
    },
    meta: {
      type: Object as PropType<ReturnType<typeof macaroonStore.findNodeMeta>>,
      required: true,
    },
  },
  setup: (props) => {
    const htlcs = ref<Array<Record<string, any>> | null>(null);
    const loading = ref(false);

    async function loadData() {
      if (!props.meta) return;
      loading.value = true;
      const res = await fetch(
        `https://${props.meta?.endpoint}:8080/v1/invoices?num_max_invoices=10000`,
        {
          method: "GET",
          headers: new Headers({
            "Grpc-Metadata-macaroon": props.macaroon.macaroonHex,
            "Content-Type": "application/json",
          }),
        }
      );
      const js = await res.json();
      loading.value = false;
      // see response data shape at https://api.lightning.community/?javascript#v1-invoices
      htlcs.value = js.invoices.flatMap((invoice: any) => invoice.htlcs);
    }
    loadData();

    const reducedHTLC = computed(() => {
      if (!htlcs.value) return null;
      const podcasts: Record<
        string,
        {
          title: string;
          subtitle?: string;
          amount: number;
        }
      > = {};
      for (const htlc of htlcs.value) {
        const curTitle =
          htlc?.custom_records?.title ||
          htlc?.custom_records?.podcast_title ||
          "";
        const curSubtitle =
          htlc?.custom_records?.text ||
          htlc?.custom_records?.episode_title ||
          "";
        const episodeKey = curTitle + curSubtitle;
        const curAmount = podcasts[episodeKey]?.amount || 0;
        if (curTitle) {
          podcasts[curTitle] = {
            title: curTitle,
            amount: curAmount + +htlc.amt_msat,
            subtitle: curSubtitle,
          };
        }
      }
      const podcastObjects = Object.values(podcasts);
      return podcastObjects.length > 0 ? podcastObjects : null;
    });

    console.log(reducedHTLC);

    return () => {
      if (loading.value) {
        return <VProgressCircular indeterminate class="mx-auto" />;
      } else if (!reducedHTLC.value) {
        return <div>No Podcast stream data found for this node</div>;
      } else {
        return <JsonTable data={() => reducedHTLC.value as JsonData} />;
      }
    };
  },
});
