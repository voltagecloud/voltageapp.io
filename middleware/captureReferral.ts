import { Context, Middleware } from "@nuxt/types";
import { createStore, nodeStore } from "~/store";

const captureReferral: Middleware = ({ route, redirect }: Context) => {
  const code: string | null =
    (route.query.podcast_id as string | null) ||
    localStorage.getItem("podcast_id") ||
    null;
  if (code && !createStore.referralCode) {
    localStorage.setItem("podcast_id", code);
    createStore.REFERRAL(code);
    // if user doesnt have nodes redirect
    !nodeStore.nodes.length && route.path !== '/podcast' && redirect('/podcast')
  }
};

export default captureReferral;
