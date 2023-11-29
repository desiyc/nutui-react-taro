import Taro from "@tarojs/taro";

const {
    miniProgram: { envVersion, version },
} = Taro.getAccountInfoSync();
const env = Taro.getStorageSync("env");
const enterInfo = Taro.getLaunchOptionsSync(); // 获取小程序进入场景信息
const query = enterInfo?.query;

const versionBaseApis = {
    develop: "", // 开发环境
    trial: "", // 预发布环境
    release: "", // 生产环境
};

export default {
    SERVER_HOME: query?.env
        ? versionBaseApis[query?.env]
        : !env
        ? versionBaseApis[envVersion]
        : versionBaseApis[env],

    TMAP_KEY: "5QHBZ-475CJ-EEPFN-K5J3A-S4ZQS-RQBPD", //使用在腾讯位置服务申请的key
};
