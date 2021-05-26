import { defineComponent, PropType } from "@vue/composition-api";
import useClipboard from "~/compositions/useClipboard";

export default defineComponent({
  components: {
    CopyPill: () => import("~/components/core/CopyPill.vue"),
  },
  props: {
    title: {
      type: Object as PropType<string>,
      required: true,
    },
    value: {
      type: Object as PropType<string>,
      required: true,
    },
  },
  setup: (props) => {
    const styles = {
     marginBottom: "8px",
    };

    return () => (
      <div>
        <div style={styles}>{props.title}</div>
        <copy-pill
          class="text-break"
          text={props.value}
          color="accent"
          text-color="warning"
        />
        <p class="font-weight-light">click to copy</p>
      </div>
    );
  },
});
