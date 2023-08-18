import Taro from "@tarojs/taro";

const { miniProgram: { envVersion, version } } = Taro.getAccountInfoSync();
const env = Taro.getStorageSync("env");
const enterInfo = Taro.getLaunchOptionsSync(); // 获取小程序进入场景信息
const query = enterInfo?.query;

const versionBaseApis = {
    develop: "https://s2d.orbitsoft.cn/yh1/client/v1/", // 开发环境
    trial: "https://yh.hnmincheng.com/test/api/client/v1/", // 预发布环境
    release: "https://yh.hnmincheng.com/api/client/v1/", // 生产环境
};

export default {
    SERVER_HOME: query?.env ? versionBaseApis[query?.env] : (!env ? versionBaseApis[envVersion] : versionBaseApis[env]),
    DEBUG_TOKEN:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF0Zm9ybSI6ImNsaWVudCIsImlkIjoxLCJpYXQiOjE2Njk5NDk0MTUsImV4cCI6MjUzMzg2MzAxNX0.9Kwbwp_E-HBkgx0Ah8dN5QMV0sRdchjDaLTBF3oju_s',
    TMAP_KEY: "5QHBZ-475CJ-EEPFN-K5J3A-S4ZQS-RQBPD", //使用在腾讯位置服务申请的key
    TMAP_REFERER: "美容sass", //调用插件的app的名称
};
