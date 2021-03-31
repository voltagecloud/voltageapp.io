import { Context, Middleware } from "@nuxt/types";
import { createStore } from "~/store";

const captureReferral: Middleware = ({ route }: Context) => {
  const code: string | null =
    (route.query.podcast_id as string | null) ||
    localStorage.getItem("podcast_id") ||
    null;
  if (code && !createStore.referralCode) {
    localStorage.setItem("podcast_id", code);
    createStore.REFERRAL(code);
  }
};

export default captureReferral;
