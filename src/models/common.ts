import { EGetCommon, EPostCommon, NCommon, RSetState } from "./constants";
import { requestGet, requestPost } from "../utils/dva17-taro"

export default {
    namespace: NCommon,
    state: {
        statusBarHeight: 0,
        menuButtonHeight: 0,
        menuButtonBoundingHeight: 0,
        headerArea: "",
        navigatorStyle: "",
        bottomStyle: "",
        osVersion: "",
        navigationVisible: true,
        colorMode: 'light',
        headerBg: null,
        networkType: 'none',
        isBiometric: false,
        isBiometricSupport: false,
        biometricSupportMode: [],
    },
    reducers: {
        [RSetState](state, payload) {
            return { ...state, ...payload };
        },
    },
    effects: {
        /* { path: "get", body: {id: 1, obj: {} } } */
        /* effect(NCommon, CommonGet, { path: "", body: { } }, (res) => {
            console.log('res: ', res);
        }) */

        async [EGetCommon]({ payload }) {
            if (payload.body) {
                return requestGet(payload.path, payload.body);
            } else {
                return requestGet(payload.path);
            }
        },
        async [EPostCommon]({ payload }) {
            if (payload.body) {
                return requestPost(payload.path, payload.body);
            } else {
                return requestPost(payload.path);
            }
        },
    },
};
