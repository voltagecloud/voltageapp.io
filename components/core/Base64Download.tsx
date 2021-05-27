import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  components: {
    VBtn: () => import("vuetify/lib").then(m => m.VBtn),
  },
  props: {
    title: {
      type: Object as PropType<string>,
      required: true,
    },
    buttonText: {
      type: Object as PropType<string>,
      required: true,
    },
    filename: {
      type: Object as PropType<string>,
      required: true,
    },
    base64: {
      type: Object as PropType<string>,
      required: true,
    },
    disabled: {
      type: Object as PropType<boolean>,
      required: false,
    },
  },
  setup: (props) => {
    const titleStyle = {
      marginBottom: "8px",
    };

    const wrapperStyle = {
      marginBottom: "16px",
    };

    return () => (
      <div style={wrapperStyle}>
        <div style={titleStyle}>{props.title}</div>
        <v-btn
          class="info--text"
          color="warning"
          text-color="highlight"
          href={`data:application/text-plain;base64,${props.base64}`}
          download={props.filename}
          title={props.filename}
          disabled={props.disabled ? props.disabled : false}
        >
          {props.buttonText}
        </v-btn>
      </div>
    );
  },
});
