import { NRecent, RSetRecentRequests } from "./constants";

export default {
    namespace: NRecent,
    state: {
        recentRequests: [],
    },
    reducers: {
        [RSetRecentRequests](state, payload) {
            return {
                ...state,
                recentRequests: [payload, ...state.recentRequests],
            };
        },
    },
    effects: {},
};
