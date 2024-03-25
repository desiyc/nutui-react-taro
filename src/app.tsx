import { Provider } from "react-redux";
import "./app.scss";
import { initModels, initRequest, reducer } from "./utils/dva17-taro";
import models from "./models";
import "@nutui/nutui-react-taro/dist/style.css";
import config from "./config";
import Taro, { onAppShow } from "@tarojs/taro";
import React from "react";
import { NCommon, RSetState } from "./models/constants";
import { useMount } from "ahooks";
const storeInstance: any = initModels(models, false);

initRequest(
  config.SERVER_HOME,
  ({ code, message }) => {
    if (401 == code) {
    } else {
      console.warn(message); //TODO.请求异常
      Taro.showToast({
        title: message,
        icon: "none",
      });
    }
  },
  true
);
export default ({ children }) => {
  useMount(async () => {
    const systemInfo = Taro.getSystemInfoSync(); // 获取系统信息
    const menuInfo = Taro.getMenuButtonBoundingClientRect(); // 获取菜单按钮位置信息
    let navigatorStyle = "";
    let bottomStyle = "";
    let osVersion = "";

    Taro.removeStorageSync("recentRequests");

    if (systemInfo.system.indexOf("iOS") > -1) {
      osVersion = "ios";
      navigatorStyle = `
            padding-block-start: 12px;
            padding-block-end: constant(safe-area-inset-bottom);
            padding-block-end: env(safe-area-inset-bottom);
            position: fixed;
            bottom: 0;
            width: 100vw;
            background-color: white;
            `;
      bottomStyle = `
            padding-block-end: constant(safe-area-inset-bottom);
            padding-block-end: env(safe-area-inset-bottom);
            `;
    } else {
      osVersion = "android";
      navigatorStyle = `
            padding-block-start: 12px;
            padding-block-end: 12px;
            position: fixed;
            bottom: 0;
            width: 100vw;
            background-color: white;
            `;
      bottomStyle = `
            padding-block-end: 20px;
            `;
    }

    reducer(NCommon, RSetState, {
      statusBarHeight: systemInfo.statusBarHeight,

      menuButtonHeight:
        //@ts-ignore
        (menuInfo.top - systemInfo.statusBarHeight) * 2 + menuInfo.height,
      menuButtonBoundingHeight: menuInfo.height,
      headerArea: `
                --header-state-height: ${systemInfo.statusBarHeight}px;
                --header-tab-height: ${(menuInfo.top -
                  //@ts-ignore
                  systemInfo.statusBarHeight) *
                  2 +
                  menuInfo.height}px;
                --dp:0px;
            `,
      navigatorStyle: navigatorStyle,
      bottomStyle: bottomStyle,
      osVersion: osVersion,
    });

    const token = Taro.getStorageSync("token");
    if (token) {
      try {
        bindJWTToken(token);
        await effect(NAccount, EGetAccount);
        effect(NChat, EGetImInfo);
      } catch (error) {
        Taro.clearStorageSync();
      }
    } else {
      Taro.clearStorageSync();
    }
    Taro.getSetting({
      success: function(res) {
        console.log("已授权", res.authSetting);
      },
    });
  });
  return <Provider store={storeInstance}>{children}</Provider>;
};
