import { requestGet, requestPost, requestPut } from "../utils/dva17-taro"
import { EGetAccount, EPostAccount, EPostAuth, NAccount, RSetState } from "./constants"

export default {
    namespace: NAccount,
    state: {
        profile: null,
        scene: [],
        invitation: null,
        staffShare: null,
    },
    reducers: {
        [RSetState](state, payload) {
            return { ...state, ...payload }
        },
    },
    effects: {
        async [EPostAuth]({ payload }, { reducer, select, effect }) {
            const res = await requestPost("/mi/login", payload)
            reducer(RSetState, { profile: res?.user })
            return res
        },
        async [EGetAccount]({ payload }, { reducer, select, effect }) {
            const res = await requestGet("/mi/info", payload)
            reducer(RSetState, { profile: res })
            return res
        },
        async [EPostAccount]({ payload }) {
            return requestPut("/mi/info", payload)
        },
    },
}
