// this file sould be remove when node/_id is changed to tsx
import { defineComponent, PropType } from "@vue/composition-api";
import SlottedRest from "~/components/viewnode/SlottedREST";
import PodcastStats from "~/components/viewnode/PodcastStats";
import type { Node } from "~/types/apiResponse";

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props) => {
    return () => (
      <SlottedRest
        node={props.node}
        child={({ macaroon, meta }) => (
          <PodcastStats node={props.node} macaroon={macaroon} meta={meta} />
        )}
      />
    );
  },
});
