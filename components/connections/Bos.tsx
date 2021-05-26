import {
  defineComponent,
  PropType,
  computed,
} from "@vue/composition-api";
import type { Node } from "~/types/apiResponse";
import { macaroonStore } from "~/store";
import { VContainer } from "vuetify/lib";
import CodeSnippet from "~/components/core/CodeSnippet";

export default defineComponent({
  props: {
    node: {
      type: Object as PropType<Node>,
      required: true,
    },
  },
  setup: (props) => {
    const macaroon = computed(() => {
      const data = macaroonStore.macaroonState({
        nodeId: props.node.node_id,
        type: "admin",
      });
      return data.macaroon;
    });

    const endpoint = computed(() => macaroonStore.findNodeMeta({ nodeId: props.node.node_id })?.endpoint || "");

    const snippetText = computed(
      () => `{
  "cert": "",
  "macaroon": "${macaroon.value}",
  "socket": "${endpoint.value}:10009"
}
`
    );

    return () => (
      <VContainer class="text-center">
        <p class="font-weight-light text--darken-1 v-card__title justify-center align-center">
          <a href="https://github.com/alexbosworth/balanceofsatoshis" target="_blank">
            Balance of Satoshis
          </a>
        </p>

        <div>
          <p>To connect with Balance of Satoshis you'll need a credentials.json file with the following content:</p>
          <CodeSnippet>{snippetText.value}</CodeSnippet>
          <p>Place that file in its own folder inside the <code>.bos</code> folder in your home directory. You can substitute "voltage" with another name, this is how you'll reference the credentials.</p>
          <CodeSnippet>$HOME/.bos/voltage/credentials.json</CodeSnippet>
          <p>To make sure it's working, try a command like <code>balance</code></p>
          <p>If you are using docker:</p>
          <CodeSnippet>
            docker run -it --rm -v $HOME/.bos:/home/node/.bos alexbosworth/balanceofsatoshis balance --node=voltage
          </CodeSnippet>
          <p></p>
          <p>If you installed via npm:</p>
          <CodeSnippet>
            bos balance --node=voltage
          </CodeSnippet>
        </div>
        <a
          href="https://github.com/alexbosworth/balanceofsatoshis/blob/master/README.md"
          target="_blank"
        >
          Balance of Satoshis Documentation.
        </a>
      </VContainer>
    );
  },
});
