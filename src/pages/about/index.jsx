import React from "react";
import Taro from "@tarojs/taro";
import { View, Text, Image, Picker, Switch } from "@tarojs/components";
import { copyText, useHeaderArea, useRouter } from "../../utils";
import SubHeader from "../../components/SubHeader";
import BlockItem from "../../components/BlockItem";
import "./index.scss";
import BlockGroup from "../../components/BlockGroup";
import dayjs from "dayjs";
import { reducer, useConnect } from "../../utils/dva17-taro";
import { NCommon, RSetState } from "../../models/constants";

export default function index() {
    const router = useRouter();
    const { headerArea } = useHeaderArea();
    const { osVersion } = useConnect(NCommon);
    const [isUpdate, setIsUpdate] = React.useState(false);
    const [clickCount, setClickCount] = React.useState(0);
    const [isBiometric, setIsBiometric] = React.useState(
        Taro.getStorageSync("isBiometric")
    );
    const [isBiometricSupport, setIsBiometricSupport] = React.useState(
        Taro.getStorageSync("isBiometricSupport")
    );
    const {
        miniProgram: { envVersion, version },
    } = Taro.getAccountInfoSync();
    const [debugMode, setDebugMode] = React.useState(
        Taro.getStorageSync("debug")
    );
    const envType = ["develop", "trial", "release"];
    const env = Taro.getStorageSync("env");
    const debugCode = "20230110";

    function checkMicroAppVersion(type = "normal") {
        const updateManager = Taro.getUpdateManager();
        updateManager.onCheckForUpdate(function(res) {
            // 请求完新版本信息的回调
            setIsUpdate(res.hasUpdate);
            if (type === "normal") {
                return;
            }
            Taro.showLoading({
                title: "检查中...",
            });
            setTimeout(() => {
                if (res.hasUpdate) {
                    checkUpdate();
                } else {
                    Taro.showToast({
                        title: "无更新",
                        icon: "none",
                    });
                }
            }, 1000);
        });
    }

    function debugFun() {
        Taro.showModal({
            title: "调试模式",
            content: "调试码",
            editable: true,
            confirmText: "提交",
            cancelText: "取消",
            success: async function(res) {
                if (res.confirm) {
                    if (res.content === debugCode) {
                        Taro.setStorageSync("debug", true);
                        setDebugMode(true);
                        Taro.showToast({
                            title: "已开启调试模式",
                            icon: "none",
                            duration: 800,
                        });
                        setClickCount(0);
                    } else {
                        Taro.showToast({
                            title: "调试码错误",
                            icon: "none",
                            duration: 800,
                        });
                        setClickCount(0);
                    }
                }
            },
        });
    }

    React.useEffect(() => {
        checkMicroAppVersion("normal");
        if (envVersion !== "release") {
            setDebugMode(true);
        }
    }, []);

    return (
        <View className="about-wrapper" style={headerArea}>
            <SubHeader title={"    "}></SubHeader>
            <View className={`about-container ${osVersion}`}>
                <Image
                    className="about-logo"
                    src="https://os.hnmincheng.com/yh1/uploads/t3PNg2/logo.png"
                    mode="aspectFill"
                    onClick={() => {
                        if (clickCount < 5) {
                            setClickCount(clickCount + 1);
                        } else {
                            debugFun();
                        }
                    }}
                ></Image>
                <View className="about-info">
                    <View className="about-app-name">永恒诱惑</View>
                    <View className="about-app-version">
                        Version {envVersion} {version ? `${version}` : ""}
                    </View>
                </View>
                <BlockGroup>
                    <BlockItem
                        title="检查新版本"
                        onClick={() => {
                            checkMicroAppVersion("force");
                        }}
                    ></BlockItem>
                    {debugMode && (
                        <>
                            <Picker
                                mode="selector"
                                value={envType.indexOf(env) || 0}
                                range={envType}
                                onChange={({ detail: { value } }) => {
                                    Taro.clearStorageSync();
                                    Taro.setStorageSync("env", envType[value]);
                                    Taro.setStorageSync("debug", true);
                                    Taro.showToast({
                                        title: "已切换环境，重启小程序生效。",
                                        icon: "none",
                                        duration: 800,
                                    });
                                }}
                            >
                                <BlockItem title="切换环境"></BlockItem>
                            </Picker>
                            <BlockItem
                                title="设置 Token"
                                onClick={() => {
                                    Taro.showModal({
                                        title: "设置 Token",
                                        content: "Token",
                                        editable: true,
                                        confirmText: "提交",
                                        cancelText: "取消",
                                        success: async function(res) {
                                            if (res.confirm) {
                                                if (!res.content) {
                                                    Taro.showToast({
                                                        title: "Token 不能为空",
                                                        icon: "none",
                                                        duration: 800,
                                                    });
                                                    return;
                                                }
                                                Taro.setStorageSync(
                                                    "token",
                                                    res.content
                                                );
                                                Taro.showToast({
                                                    title:
                                                        "已设置 Token，重启小程序生效。",
                                                    icon: "none",
                                                    duration: 800,
                                                });
                                            }
                                        },
                                    });
                                }}
                            ></BlockItem>
                            <BlockItem
                                title="复制 Token"
                                onClick={() => {
                                    copyText(Taro.getStorageSync("token"));
                                }}
                            ></BlockItem>
                            <BlockItem
                                title="最近请求"
                                onClick={() => {
                                    router.push({
                                        name: "recentRequests",
                                    });
                                }}
                            ></BlockItem>
                            <BlockItem
                                title="Biometric"
                                onClick={() => {
                                    if (!isBiometricSupport) {
                                        Taro.showToast({
                                            title: "当前设备不支持 Biometric",
                                            icon: "none",
                                            duration: 800,
                                        });
                                        return;
                                    }
                                    const text = [
                                        "是否关闭 Biometric? 关闭后，支付时将不再使用指纹或面容进行验证。",
                                        "是否启用 Biometric? 启用后，支付时将使用指纹或面容进行验证。请确保已设置指纹或面容，否则无法使用。",
                                    ];
                                    Taro.showModal({
                                        title: "设置 Biometric",
                                        content: text[isBiometric ? 0 : 1],
                                        confirmText: "确定",
                                        cancelText: "取消",
                                        success: async function(res) {
                                            if (res.confirm) {
                                                Taro.setStorageSync(
                                                    "isBiometric",
                                                    !isBiometric
                                                );
                                                setIsBiometric(!isBiometric);
                                                reducer(NCommon, RSetState, {
                                                    isBiometric: !isBiometric,
                                                });
                                                Taro.showToast({
                                                    title: `已${
                                                        isBiometric
                                                            ? "关闭"
                                                            : "启用"
                                                    } Biometric.`,
                                                    icon: "none",
                                                    duration: 800,
                                                });
                                            }
                                        },
                                    });
                                }}
                            >
                                <Switch
                                    checked={isBiometric}
                                    disabled={true}
                                    controlled={true}
                                    color="#f00"
                                ></Switch>
                            </BlockItem>
                            <BlockItem
                                title="关闭调试模式"
                                onClick={() => {
                                    Taro.setStorageSync("debug", false);
                                    setDebugMode(false);
                                    Taro.showToast({
                                        title: "已关闭调试模式",
                                        icon: "none",
                                        duration: 800,
                                    });
                                }}
                            ></BlockItem>
                        </>
                    )}
                </BlockGroup>
                <View className="about-footer">
                    <View className="about-powered">
                        本小程序由
                        <Text className="about-powered-link"> OrbitSoft </Text>
                        提供技术支持
                    </View>
                    <View className="about-copyright">
                        Copyright © {dayjs().format("YYYY")} 永恒诱惑。
                        保留所有权利。
                    </View>
                </View>
            </View>
        </View>
    );
}
