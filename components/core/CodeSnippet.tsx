import { defineComponent } from "@vue/composition-api";
import useClipboard from "~/compositions/useClipboard";

export default defineComponent({
  components: {
    VTooltip: () => import("vuetify/lib").then((m) => m.VTooltip),
  },
  setup: (_, { slots }) => {
    const styles = {
      textAlign: "left",
      overflow: "scroll-y",
      backgroundColor: "#505050",
      fontFamily: "monospace",
      color: "#ffffff",
      borderRadius: "5px",
      padding: "10px",
      whiteSpace: "pre-wrap" /* css-3 */,
      wordWrap: "break-word" /* Internet Explorer 5.5+ */,
    };

    const { isCopied, copy } = useClipboard(2000);

    return () => (
      <v-tooltip
        bottom
        scopedSlots={{
          // @ts-ignore
          activator: ({ attrs, on }) => (
            <div
              style={styles}
              {...attrs}
              {...{ on }}
              onClick={() => {
                copy(slots?.default?.()[0].text || '');
              }}
            >
              {slots?.default?.()}
            </div>
          ),
        }}
      >
        <span>{isCopied.value ? "Copied to Clipboard!" : "Click to Copy"}</span>
      </v-tooltip>
    );
  },
});
