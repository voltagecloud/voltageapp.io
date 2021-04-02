import { defineComponent, PropType, computed, ref } from "@vue/composition-api";
import { macaroonStore } from "~/store";
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

type DataPayload = Map<string, { x: string; boostY: number; streamY: number }>;

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
    const error = ref('')

    async function loadData() {
      if (!props.meta) return;
      error.value = ''
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
      loading.value = false;
      if (!res.ok) {
        error.value = 'An error occured communicating with your node. Please try again later'
        return
      }
      const js = await res.json();
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
      const data: DataPayload = new Map();
      for (const htlc of reducedHTLC.value) {
        // get podcast name
        const curTitle =
          htlc?.custom_records?.title ||
          htlc?.custom_records?.podcast_title ||
          "";

        // get podcast episode title
        const curSubtitle =
          htlc?.custom_records?.text ||
          htlc?.custom_records?.episode_title ||
          "";

        // determine payment type of boost or stream
        let htlcAction: "streamY" | "boostY";
        let otherAction: "streamY" | "boostY";
        const payloadType =
          htlc?.custom_records?.type || htlc?.custom_records?.action || "";

        if (payloadType === "boost") {
          htlcAction = "boostY";
          otherAction = "streamY";
        } else if (payloadType === "stream") {
          htlcAction = "streamY";
          otherAction = "boostY";
        } else {
          continue;
        }

        const episodeKey = curTitle + curSubtitle;
        const curAmount = data.get(episodeKey)?.[htlcAction] || 0;
        const otherAmount = data.get(episodeKey)?.[otherAction] || 0;
        if (episodeKey) {
          const amount = +htlc.amt_msat / 1000 + curAmount;
          const xAxisVal = curTitle + (curSubtitle ? ` - ${curSubtitle}` : "");

          data.set(episodeKey, {
            x: xAxisVal,
            boostY: htlcAction === "boostY" ? amount + curAmount : otherAmount,
            streamY:
              htlcAction === "streamY" ? amount + curAmount : otherAmount,
          });
        }
      }
      const output = Array.from(data.values());
      return output.length > 0 ? output : null;
    });

    return () => {
      if (loading.value) {
        return <VProgressCircular indeterminate class="mx-auto" />;
      } else if (podcastData.value) {
        return (
          <div>
            {/*<JsonTable data={() => podcastData.value?.tableData as JsonData} />*/}
            {podcastData.value && (
              <PodcastChart chartData={podcastData.value} />
            )}
          </div>
        );
      } else if (error.value) {
        return <div class="ma-3 text-h6"> 
          {error.value}
        </div>
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
