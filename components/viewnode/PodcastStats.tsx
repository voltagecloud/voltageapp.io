import { defineComponent, PropType, computed, ref } from "@vue/composition-api";
import { macaroonStore } from "~/store";
import JsonTable, { JsonData } from "~/components/core/JsonTable";
import { VProgressCircular } from "vuetify/lib";
import type { Node } from "~/types/apiResponse";
import PodcastChart from "~/components/PodcastChart";

function isSphinxPayload(payload: Record<string, string>) {
  return "ts" in payload && "feedID" in payload && "itemID" in payload;
}

function isBreezPayload(payload: Record<string, string>) {
  return (
    "podcast_title" in payload &&
    "episode_title" in payload &&
    "action" in payload &&
    "action_time" in payload
  );
}

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
  setup: (props, { refs }) => {
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
      // see https://api.lightning.community/?javascript#lnrpcinvoicehtlc
      let htlcOutput: any[] = [];
      for (const htlc of htlcs.value) {
        // determine if this htlc has podcast relevant custom record
        for (const [_, value] of Object.entries(htlc?.custom_records || {})) {
          let payload: Record<string, string>;
          try {
            const decode = atob(value as string);
            console.log(decode);
            payload = JSON.parse(decode);
            if (!payload) continue;
            // check if payload conforms to breez or sphinx structure
            if (!isBreezPayload(payload) && !isSphinxPayload(payload)) continue;
            htlcOutput.push(
              Object.assign({}, htlc, { custom_records: payload })
            );
          } catch (e) {
            continue;
          }
        }
      }
      return htlcOutput;
    });

    const podcastData = computed(() => {
      if (!reducedHTLC.value) return null;
      const episodes = new Map<
        string,
        {
          title: string;
          subtitle?: string;
          amount: number;
        }
      >();
      const timeSeries = new Map<string, { x: string; y: number }>();
      for (const htlc of reducedHTLC.value) {
        const curTitle =
          htlc?.custom_records?.title ||
          htlc?.custom_records?.podcast_title ||
          "";
        const curSubtitle =
          htlc?.custom_records?.text ||
          htlc?.custom_records?.episode_title ||
          "";
        const episodeKey = curTitle + curSubtitle;
        const curAmount = episodes.get(episodeKey)?.amount || 0;
        if (episodeKey) {
          const amount = +htlc.amt_msat / 1000 + curAmount;

          episodes.set(episodeKey, {
            title: curTitle,
            amount,
            subtitle: curSubtitle,
          });

          timeSeries.set(episodeKey, {
            x: curTitle + (curSubtitle ? ` - ${curSubtitle}` : ""),
            y: amount,
          });
        }
      }
      const tableData = Array.from(episodes.values());
      const chartData = Array.from(timeSeries.values());
      return tableData.length > 0
        ? {
            tableData,
            chartData,
          }
        : null;
    });

    return () => {
      if (loading.value) {
        return <VProgressCircular indeterminate class="mx-auto" />;
      } else if (podcastData.value) {
        return (
          <div>
            {/*<JsonTable data={() => podcastData.value?.tableData as JsonData} />*/}
            {podcastData.value?.chartData && (
              <PodcastChart podcastData={podcastData.value.chartData} />
            )}
          </div>
        );
      } else {
        return (
          <div class="ma-3 text-h6">
            No Podcast stream data found for this node
          </div>
        );
      }
    };
  },
});
