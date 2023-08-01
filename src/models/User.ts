import Taro from "@tarojs/taro";
import {
  bindJWTToken,
  effect,
  requestGet,
  requestPost,
  requestPut,
} from "../utils/dva17-taro";
import {
  EGet,
  EGetInfo,
  EPost,
  EPut,
  NUser,
  RSetState,
  QueryWhetherLogon,
} from "../common/action";

export default {
  namespace: NUser,
  state: {
    bannerList: null,
    userinfo: null,
  },
  reducers: {
    [RSetState](state, payload) {
      return { ...state, ...payload };
    },
    [QueryWhetherLogon](state, fn) {
      const { userinfo } = state;
      if (userinfo && userinfo?.phone) {
        fn && fn();
      } else {
        Taro.showModal({
          title: "提示",
          content: "您还没有登录或者注册，是否前往登录或者注册",
          success: function (res) {
            if (res.confirm) {
              Taro.navigateTo({ url: "/pages/login/index" });
            }
          },
        });
      }
      return state;
    },
  },
  effects: {
    async [EGet]({ payload }, { reducer }) {
      let res = await requestGet("mi/banner", payload);
      reducer(RSetState, { bannerList: res });
      return res;
    },
    async [EGetInfo]({ payload }, { reducer }) {
      let res = await requestGet("mi/info", payload);
      reducer(RSetState, { userinfo: res?.data });
      return res;
    },
    async [EPost]({ payload }, { reducer }) {
      const res = await requestPost("mi/login", payload);
      if (res?.data?.token) {
        bindJWTToken(res?.data?.token);
        reducer(RSetState, { userinfo: res?.data?.user });
        await requestPost("mi/browse", { scenario: 0 });
      }
      return res;
    },
    //更新用户信息
    async [EPut]({ payload }) {
      return await requestPut("mi/info", {
        ...payload,
        province: Taro.getStorageSync("region")[0] || "浙江省",
        city: Taro.getStorageSync("region")[1] || "杭州市",
      });
    },
  },
};
