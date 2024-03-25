import { connect as reduxConnect, useSelector } from "react-redux";
import { init, createModel } from "@rematch/core";
import loadingPlugin from "@rematch/loading";
import Taro from "@tarojs/taro";
import { NRecent, RSetRecentRequests } from "../../src/models/constants";

/*------------------------- 基于rematch实现的类dva框架 -------------------------*/
const dvaParams = { storeInstance: null, printLog: false };
export const initModels = (modelArray, printLog = false) => {
  const models = {};
  for (let model of modelArray) {
    models[model.namespace] = createModel()({
      ...model,
      effects: (dispatch) => {
        let newEffects = {};
        let namespace = model.namespace;
        for (let key in model.effects) {
          newEffects[key] = async (payload, rootState) => {
            return await model.effects[key](
              { state: rootState[namespace], payload },
              {
                reducer: (...args) => {
                  if (args.length <= 2) {
                    args.unshift(namespace);
                  }
                  dvaParams.printLog &&
                    console.log("[reducer]", args[0], args[1], args[2]);
                  dispatch[args[0]][args[1]](args[2]);
                },
                select: (namespace2) => rootState[namespace2],
                effect: async (...args) => {
                  if (args.length <= 2) {
                    args.unshift(namespace);
                  }
                  dvaParams.printLog &&
                    console.log("[effect]", args[0], args[1], args[2]);
                  return await dispatch[args[0]][args[1]](args[2]);
                },
              }
            );
          };
        }
        return newEffects;
      },
    });
  }
  dvaParams.printLog = printLog;
  dvaParams.storeInstance = init({
    models,
    plugins: [loadingPlugin({ type: "full" })],
  });
  return dvaParams.storeInstance;
};
export const useLoading = (namespace) => {
  return useSelector((store) => {
    return store.loading.models[namespace];
  });
};
export const useConnect = (namespace) => {
  return useSelector((store) => {
    return store[namespace];
  });
};
export const reducer = (namespace, type, payload) => {
  dvaParams.printLog && console.log("[reducer]", namespace, type, payload);
  return dvaParams.storeInstance.dispatch[namespace][type](payload);
};
export const effect = async (namespace, type, payload) => {
  dvaParams.printLog && console.log("[effect]", namespace, type, payload);
  return await dvaParams.storeInstance.dispatch[namespace][type](payload);
};

/*------------------------- 基于axios实现的通用request，json格式，jwt校验 -------------------------*/
const requestParams = {
  serverHome: null,
  errorHanlder: null,
  printLog: false,
  extraHeaders: {},
};
export function initRequest(serverHome, errorHanlder, printLog = false) {
  requestParams.printLog = printLog;
  requestParams.serverHome = [].concat(serverHome);
  requestParams.errorHanlder = errorHanlder;
}
export function bindHeader(key, value) {
  requestParams.extraHeaders[key] = value;
}
export function bindJWTToken(token) {
  requestParams.extraHeaders["Authorization"] = token
    ? `Bearer ${token}`
    : undefined;
}
export function requestGet(url, body, serverHomeIndex = 0) {
  return request(url, { method: "GET", body }, null, serverHomeIndex);
}
export function requestDelete(url, serverHomeIndex = 0) {
  return request(url, { method: "DELETE" }, null, serverHomeIndex);
}
export function requestPost(url, body, serverHomeIndex = 0) {
  return request(url, { method: "POST", body }, null, serverHomeIndex);
}
export function requestPatch(url, body, serverHomeIndex = 0) {
  return request(url, { method: "PATCH", body }, null, serverHomeIndex);
}
export function requestPut(url, body, serverHomeIndex = 0) {
  return request(url, { method: "PUT", body }, null, serverHomeIndex);
}
export function requestFile(url, file, serverHomeIndex = 0) {
  let body = new FormData();
  body.append("file", file);
  return request(
    url,
    { method: "POST", body },
    "application/form-data",
    serverHomeIndex
  );
}
function request(url, options, ContentType = null, serverHomeIndex = 0) {
  return new Promise((resolve, reject) => {
    let { method, body } = options;
    // 添加url前缀
    if (url.indexOf("https://") === -1 && url.indexOf("http://") === -1) {
      url =
        requestParams.serverHome[serverHomeIndex] +
        (url.indexOf("/") === 0 ? url.substr(1) : url);
    }
    let option = {
      method,
      url,
      header: {
        Accept: "application/json",
        Pragma: "no-cache",
        "Cache-Control": "no-cache",
        Expires: 0,
        "Content-Type": ContentType || "application/json; charset=utf-8",
        ...requestParams.extraHeaders,
      },
      dataType: "json",
    };
    // 参数赋值
    switch (method.toUpperCase()) {
      case "GET":
      case "DELETE":
        option.data = body || {};
        break;
      case "POST":
      case "PATCH":
      case "PUT":
        option.data = body || {};
        break;
    }

    Taro.request(option)
      .then((response) => {
        if (response?.data?.code >= 400) {
          reject(response?.data);
        } else {
          resolve(response?.data);
        }
        reducer(NRecent, RSetRecentRequests, {
          ...option,
          header: option?.header,
          body: option.data,
          statusCode: response?.statusCode,
          result: response,
        });
      })
      .catch((e) => {
        if (e.response) {
          let { status, data } = e.response;
          requestParams.errorHanlder(status, data);
        } else {
          throw e;
        }
      });
  });
}
