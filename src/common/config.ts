import Taro from "@tarojs/taro";

const {
  miniProgram: { envVersion, version },
} = Taro.getAccountInfoSync();

const env = Taro.getStorageSync("env");
const enterInfo = Taro.getLaunchOptionsSync(); // 获取小程序进入场景信息
const query = enterInfo?.query;
const versionBaseApis = {
  develop: "https://s2d.orbitsoft.cn/sm2/client/v1/", // 开发环境
  trial: "https://s2d.orbitsoft.cn/sm2/client/v1/", // 预发布环境
  release: "https://s.shmed.com/sm2/client/v1/", // 生产环境
};

export default {
  VERSION: version,
  ENV: query?.env ? query?.env : env ? env : envVersion,
  SERVER_HOME: query?.env
    ? versionBaseApis[query?.env]
    : !env
    ? versionBaseApis[envVersion]
    : versionBaseApis[env],
};
