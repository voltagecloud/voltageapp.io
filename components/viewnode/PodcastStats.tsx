import { defineComponent, PropType, computed, ref } from "@vue/composition-api";
import { macaroonStore } from "~/store";
import { VProgressCircular } from "vuetify/lib";
import type { Node } from "~/types/apiResponse";
import PodcastChart from "~/components/PodcastChart";

type DataPayload = Map<string, { x: string; boostY: number; streamY: number }>;

// TODO swap to the correct tlv ids
//const BreezTlvId = "7629169";
//const SphinxTlvId = "133773310";
//
const BreezTlvId = "34349334";
const SphinxTlvId = "5482373484";

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
    const error = ref("");

    async function loadData() {
      if (!props.meta) return;
      error.value = "";
      loading.value = true;
      const res = await fetch(
        `https://${props.meta?.endpoint}:8080/v1/invoices?num_max_invoices=10000&reversed=true`,
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
        error.value =
          "An error occured communicating with your node. Please try again later";
        return;
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
        for (const [tlvId, value] of Object.entries(
          htlc?.custom_records || {}
        )) {
          console.log({ tlvId });
          if (tlvId !== BreezTlvId && tlvId !== SphinxTlvId) continue;
          console.log("decoding");
          try {
            const decode = atob(value as string);
            const payload = JSON.parse(decode);
            if (!payload) continue;
            // check if payload conforms to breez or sphinx structure
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

    // returns the epoch time bin that 'time' falls into given a start time, a count backwards interval and number of bins to create
    // returns null if the given time is before the span of the interval
    function getBin({
      time,
      interval,
      bins,
      start,
    }: {
      time: number;
      interval: number;
      bins: number;
      start: number;
    }): null | number {
      if (bins === 0) return null;
      if (time >= start - interval) return start;
      return getBin({
        time,
        interval,
        bins: bins - 1,
        start: start - interval,
      });
    }

    function makeBins({
      interval,
      bins,
      start,
    }: {
      interval: number;
      bins: number;
      start: number;
    }): number[] {
      let output = [];
      let cur = start;
      for (let i = 0; i < bins; i += 1) {
        output.push(cur);
        cur -= interval;
      }
      return output;
    }

    function binToStr(bin: number): string {
      const date = new Date(bin * 1000);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    // current epoch time
    const now = new Date().getTime() / 1000;
    const secondsPerDay = 86400;
    const podcastData = computed(() => {
      if (!reducedHTLC.value) return null;
      const data = new Map<string, { x: string; y: number }>();
      const bins = makeBins({
        interval: secondsPerDay,
        bins: 14,
        start: now,
      });
      for (const bin of bins) {
        const key = binToStr(bin)
        data.set(key, { x: key, y: 0 })
      }
      for (const htlc of reducedHTLC.value) {
        const acceptTime = htlc?.accept_time;
        if (!acceptTime) continue;
        const bin = getBin({
          time: +acceptTime,
          interval: secondsPerDay,
          bins: 14,
          start: now,
        });
        // if the current htlc falls outside time range, skip
        if (!bin) continue;

        const dateKey = binToStr(bin)
        const prevAmt = data.get(dateKey)?.y;

        const newAmt = +htlc.amt_msat / 1000 + (prevAmt || 0);
        data.set(dateKey, { x: dateKey, y: newAmt });
      }
      const output = Array.from(data.values()).reverse();
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
        return <div class="ma-3 text-h6">{error.value}</div>;
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
