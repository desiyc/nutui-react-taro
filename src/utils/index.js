import Taro, { useReady } from "@tarojs/taro";
import { effect, reducer, useConnect } from "./dva17-taro";
import qs from "query-string";
import config from "../config";
import { EPostCommon, NCommon, RSetState } from "../models/constants";
import { useState } from "react";

export function useRouter() {
    /**
     *
     * @param {Object} name
     * @param {Object} query
     */
    function push({ name, query = {} }) {
        Taro.navigateTo({
            url: `/pages/${name}/index?${qs.stringify(query, {
                encode: false,
            })}`,
        });
    }
    function replace({ name, query = {} }) {
        Taro.redirectTo({
            url: `/pages/${name}/index?${qs.stringify(query, {
                encode: false,
            })}`,
        });
    }
    function tab({ name }) {
        Taro.switchTab({
            url: `/pages/${name}/index`,
        });
    }
    function back(delta) {
        // 判断页面栈，如果只有一个页面，就跳转到首页
        const pages = Taro.getCurrentPages();
        if (pages.length === 1) {
            Taro.switchTab({
                url: "/pages/browse/index",
            });
        } else {
            Taro.navigateBack({
                delta: delta || 1,
            });
        }
    }
    return {
        push,
        replace,
        tab,
        back,
    };
}

export function useRoute() {
    const router = Taro.useRouter();
    router.query = router.params;
    delete router.query?.$taroTimestamp;
    return {
        ...router,
    };
}

export function useHeaderArea() {
    const {
        statusBarHeight,
        menuButtonHeight,
        menuButtonBoundingHeight,
        headerArea,
        navigatorStyle,
        bottomStyle,
    } = useConnect(NCommon);
    return {
        statusBarHeight,
        menuButtonHeight,
        menuButtonBoundingHeight,
        headerArea,
        navigatorStyle,
        bottomStyle,
    };
}

export function throttleFun(fn, interval) {
    var enterTime = 0; //触发的时间
    var gapTime = interval || 300; //间隔时间，如果interval不传，则默认300ms
    return function() {
        var context = this;
        var backTime = new Date(); //第一次函数return即触发的时间
        if (backTime - enterTime > gapTime) {
            fn.call(context, arguments);
            enterTime = backTime; //赋值给第一次触发的时间，这样就保存了第二次触发的时间
        }
    };
}

/*函数防抖*/
export function debounceFun(fn, interval) {
    var timer;
    var gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
    return function() {
        clearTimeout(timer);
        var context = this;
        var args = arguments; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
        timer = setTimeout(function() {
            fn.call(context, args);
        }, gapTime);
    };
}

export function imagePreview(array, index) {
    if (!array || !array.length) {
        return;
    }
    Taro.previewImage({
        current: array[index], // 当前显示图片的http链接
        urls: array, // 需要预览的图片http链接列表
    });
}

export function dateFormat(date) {
    // 时间格式化
    if (!date) {
        return "0";
    }
    return (date / 60).toFixed(0);
}

export function getDistance(lat1, lng1, lat2, lng2, isSymbol = true) {
    // lat1,lng1为用户当前位置，lat2,lng2为商家位置
    var radLat1 = (lat1 * Math.PI) / 180.0;
    var radLat2 = (lat2 * Math.PI) / 180.0;
    var a = radLat1 - radLat2;
    var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
    var s =
        2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a / 2), 2) +
                    Math.cos(radLat1) *
                        Math.cos(radLat2) *
                        Math.pow(Math.sin(b / 2), 2)
            )
        );
    s = s * 6378.137; // EARTH_RADIUS;
    // 距离小于1km时，显示为m。
    if (s < 1) {
        return isSymbol ? `${Math.round(s * 1000)}m` : s;
    } else if (s > 1) {
        s = Math.round(s * 10000) / 10000; //输出为公里
        s = s.toFixed(2);
        return isSymbol ? `${s} km` : s;
    } else {
        return "未知";
    }
}

export function copyText(text) {
    if (!text) {
        return;
    }
    Taro.setClipboardData({
        data: text,
        success: function(res) {
            Taro.getClipboardData({
                success: function(res) {
                    Taro.showToast({
                        title: "复制成功",
                        icon: "none",
                    });
                },
            });
        },
    });
}

export function callTel(tel) {
    if (!/^1[3456789]\d{9}$/.test(tel)) {
        Taro.showToast({
            title: "手机号码有误",
            icon: "none",
        });
        return;
    }
    Taro.makePhoneCall({
        phoneNumber: tel,
    });
}

export function pxFun(px) {
    return Number(
        Taro.pxTransform(px)
            .split("px")[0]
            .split("r")[0]
    );
}
/**
 *
 * @param {string | array} obj 示例格式："https://www.baidu.com" 或 ["https://www.baidu.com"]
 * @returns
 */
export function uploadFun(obj) {
    // 上传图片
    return new Promise(async (resolve, reject) => {
        if (!obj) return resolve([]);
        if (Array.isArray(obj)) {
            const res = await Promise.all(
                obj?.map((item) => {
                    return new Promise((resolve, reject) => {
                        Taro.uploadFile({
                            url: `${config.SERVER_HOME}mi/upload`,
                            header: {
                                Authorization: `Bearer ${Taro.getStorageSync(
                                    "token"
                                )}`,
                            },
                            filePath: item,
                            name: "file",
                            success: function(res) {
                                resolve(res?.data);
                            },
                            fail: function(error) {
                                reject(error);
                            },
                        });
                    });
                })
            );
            resolve(res);
        } else {
            Taro.uploadFile({
                url: `${config.SERVER_HOME}mi/upload`,
                header: {
                    Authorization: `Bearer ${Taro.getStorageSync("token")}`,
                },
                filePath: obj,
                name: "file",
                success: function(res) {
                    resolve(res?.data);
                },
                fail: function(error) {
                    reject(error);
                },
            });
        }
    });
}

export function checkUpdate() {
    // 检查更新
    const updateManager = Taro.getUpdateManager();
    updateManager.onCheckForUpdate(function(res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate ? "有新版本" : "没有新版本");
    });
    updateManager.onUpdateReady(function() {
        Taro.showModal({
            title: "更新提示",
            content: "新版本已经准备好，是否重启应用？",
            success: function(res) {
                if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate();
                }
            },
        });
    });
    updateManager.onUpdateFailed(function() {
        // 新的版本下载失败
        Taro.showToast({
            title: "新版本下载失败",
            icon: "none",
        });
    });
}

export function useOtherHeight(classArray, mode = "immediate") {
    // 获取其他元素高度
    const [height, setHeight] = useState(0);

    function getOtherHeight() {
        setTimeout(() => {
            classArray?.forEach((item) => {
                if (item) {
                    const query = Taro.createSelectorQuery();
                    query
                        .select(`.${item}`)
                        .boundingClientRect((rect) => {
                            setHeight((prev) => prev + rect?.height || 0);
                        })
                        .exec();
                }
            });
        }, 100);
    }

    if (mode === "delay") {
        getOtherHeight();
    }
    if (mode === "immediate") {
        useReady(() => {
            getOtherHeight();
        });
    }
    return height;
}

export function useOtherWidth(classArray, mode = "immediate") {
    // 获取其他元素宽度
    const [width, setWidth] = useState(0);

    function getOtherHeight() {
        setTimeout(() => {
            classArray?.forEach((item) => {
                if (item) {
                    const query = Taro.createSelectorQuery();
                    query
                        .select(`.${item}`)
                        .boundingClientRect((rect) => {
                            setWidth((prev) => prev + rect?.width || 0);
                        })
                        .exec();
                }
            });
        }, 1);
    }

    if (mode === "delay") {
        getOtherHeight();
    }
    if (mode === "immediate") {
        useReady(() => {
            getOtherHeight();
        });
    }
    return width;
}

export function mapNavigationHandler({
    myLatitude,
    myLongitude,
    latitude,
    longitude,
    name,
    mode,
}) {
    // 地图导航
    const plugin = requirePlugin("routePlan");
    const body = {
        key: config.TMAP_KEY,
        referer: config.TMAP_REFERER,
        mode: mode,
    };
    const startPoint = {
        latitude: myLatitude,
        longitude: myLongitude,
        name: "我的位置",
    };
    const endPoint = {
        latitude: latitude,
        longitude: longitude,
        name: name,
    };
    Taro.navigateTo({
        url: `plugin://routePlan/index?${qs.stringify(
            body
        )}&themeColor=#FE4F81&endPoint=${JSON.stringify(endPoint)}`,
    });
}

export function useOrderControl(type, obj) {
    const uocInfo = {
        cancelOrder: {
            text: "要取消该订单吗",
            api: "/order/cancel",
        },
        confirmOrder: {
            text: "要确认收货吗",
            api: "/order/receipt",
        },
        cancelAfter: {
            text: "要取消售后吗",
            api: "/order/cancel/afterSales",
        },
    };
    return new Promise(async (resolve, reject) => {
        Taro.showModal({
            content: uocInfo[type].text,
            success: async function(res) {
                if (res.confirm) {
                    try {
                        const res = await effect(NCommon, EPostCommon, {
                            path: uocInfo[type].api,
                            body: { ...obj },
                        });
                        resolve(res);
                    } catch (error) {
                        reject(error);
                        Taro.showToast({
                            title: error?.message,
                            icon: "none",
                            duration: 800,
                        });
                    }
                }
            },
        });
    });
}

//处理富文本字段
export function formatRichText(nodes) {
    return nodes.replace(/<(img).*?(\/>|<\/img>)/g, function(mats) {
        if (mats.indexOf("style") < 0) {
            return mats.replace(
                /<\s*img/,
                '<img style="width:100vw;height:auto;"'
            );
        } else {
            return mats.replace(
                /style=("|')/,
                "style=$1width:100vw;height:auto;"
            );
        }
    });
}

export function generateMicroAppQR({ scene, page }) {
    // 生成小程序码
    const {
        miniProgram: { envVersion, version },
    } = Taro.getAccountInfoSync();
    const env = Taro.getStorageSync("env");
    const sceneStr = [];
    const versionType = {
        develop: "develop",
        trial: "trial",
        release: "release",
    };
    for (const key in scene) {
        const element = scene[key];
        // is not empty
        if (element) {
            sceneStr.push(element);
        }
    }
    const body = {
        envVersion: !env ? versionType[envVersion] : versionType[env],
        scene: sceneStr?.map((item) => item).join(","),
        page: page,
    };
    return new Promise(async (resolve, reject) => {
        try {
            Taro.showLoading({ title: "生成小程序码中..." });
            const res = await effect(NCommon, EPostCommon, {
                path: "/basic/diy/code",
                body: body,
            });
            resolve(res);
            Taro.hideLoading();
        } catch (error) {
            reject(error);
        }
    });
}

export function saveImageToPhotosAlbum(url) {
    // 保存图片到相册
    return new Promise(async (resolve, reject) => {
        try {
            Taro.showLoading({ title: "保存中..." });
            const res = await Taro.downloadFile({ url: url });
            const path = res.tempFilePath;
            Taro.saveImageToPhotosAlbum({ filePath: path });
            Taro.hideLoading();
            resolve(res);
        } catch (error) {
            Taro.showToast({
                title: "保存失败",
                icon: "error",
                duration: 800,
            });
            reject(error);
        }
    });
}

export function decodeScene(keyArray) {
    // 解析小程序码参数
    const enterInfo = Taro.getLaunchOptionsSync();
    const scene = enterInfo?.query?.scene;
    if (!scene) {
        return {};
    }
    const scenes = decodeURIComponent(scene)?.split(",");
    const sceneObj = {};
    keyArray?.forEach((item, index) => {
        sceneObj[item] = scenes[index];
    });
    return sceneObj;
}

export function pictureSize(src, width, height) {
    // 图片尺寸
    // src 图片地址 包含 hnmincheng 为 阿里云图片，使用阿里云图片处理
    // src 图片地址 包含 orbitsoft 为 腾讯云图片，使用腾讯云图片处理
    // src 图片地址 包含 .svg 为 svg 图片，不处理
    // src 图片地址 不包含 .mp4 为 视频，不处理
    // width 图片宽度
    // height 图片高度
    if (!src) {
        return "";
    }
    if (src?.includes(".svg")) {
        return src;
    }
    if (src?.includes(".mp4")) {
        return src;
    }
    if (src?.includes("hnmincheng")) {
        return `${src}?x-oss-process=image/resize,lfit,h_${pxFun(
            height * 2
        )},w_${pxFun(width * 2)}`;
    }
    if (src?.includes("orbitsoft")) {
        return `${src}?imageView2/1/w/${pxFun(height * 2)}/h/${pxFun(
            width * 2
        )}`;
    }
    return src;
}

export function moneyFormat(e) {
    // 金额格式化
    let arriveMoneyInput = e;
    if (arriveMoneyInput == "￥") {
        return "";
    }
    if (arriveMoneyInput == ".") {
        return "0.";
    }
    arriveMoneyInput = arriveMoneyInput.replace("￥", "");
    const exp = /(^[1-9]([0-9]+)?(\.[0-9]{0,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]{0,2}$)/;
    if (exp.test(arriveMoneyInput)) {
        return arriveMoneyInput;
    } else {
        return "";
    }
}

export function getSceneArray() {
    // 获取场景值数组
    const {
        query: { scene },
    } = Taro.getLaunchOptionsSync(); // 获取小程序进入场景信息
    const arr = decodeURIComponent(scene)?.split(",");
    return scene ? arr : [];
}
