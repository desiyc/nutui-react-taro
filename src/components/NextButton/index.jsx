import React from "react";
import { View, Button } from "@tarojs/components";
import Taro, { useReady } from "@tarojs/taro";
import "./index.scss";

export default function NextButton({
    leftClick = () => {},
    rightClick = () => {},
    leftText = "",
    rightText = "",
    type = "default" || "pay",
    button = "single" || "double",
    loading = false,
    disabled = false,
    dRight = true,
    leftButtonType = "none",
    rightButtonType = "none",
    children,
}) {
    const [deviceType, setDeviceType] = React.useState("android");

    useReady(() => {
        const systemInfo = Taro.getSystemInfoSync(); // 获取系统信息
        if (systemInfo.system.indexOf("iOS") > -1) {
            setDeviceType("ios");
        } else {
            setDeviceType("android");
        }
    });

    function buttonRendererSingle() {
        return (
            <View className={`next-bs-wrapper ${children ? "v3" : ""}`}>
                {children}
                <Button
                    className="next-bs-button"
                    onClick={() => rightClick()}
                    openType={rightButtonType}
                    loading={loading}
                    disabled={disabled}
                >
                    {rightText}
                </Button>
            </View>
        );
    }
    function buttonRendererDouble() {
        return (
            <View className={`next-bd-wrapper ${children ? "v3" : ""}`}>
                {children}
                <Button
                    className="next-bd-button left"
                    onClick={() => leftClick()}
                    openType={leftButtonType}
                    loading={dRight ? false : loading}
                    disabled={dRight ? false : loading}
                >
                    {leftText}
                </Button>
                <Button
                    className="next-bd-button right"
                    onClick={() => rightClick()}
                    openType={rightButtonType}
                    loading={loading}
                    disabled={disabled}
                >
                    {rightText}
                </Button>
            </View>
        );
    }
    return (
        <View className={`next-button-wrapper ${type} ${button} ${deviceType}`}>
            {button === "single" && buttonRendererSingle()}
            {button === "double" && buttonRendererDouble()}
        </View>
    );
}
