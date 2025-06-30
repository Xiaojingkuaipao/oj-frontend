import { createStore } from "vuex";
import user from "@/store/user";
import match from "@/store/match";

export default createStore({
  modules: {
    user,
    match,
  },
});
