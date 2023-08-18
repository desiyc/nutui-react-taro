import React, { useEffect } from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import IconVisual from "../IconVisual";
import { useHeaderArea, useRouter } from "../../utils";
import { useConnect } from "../../utils/dva17-taro";
import { NCommon } from "../../models/constants";
import "./index.scss";

export default function SubHeader({
    title,
    bg = true,
    bgc = true,
    isBack = true,
    clickCircle = false,
    click = false,
    onClick = () => {},
    bgUrl,
    mode = "dark" || "light",
    style,
    children,
}) {
    const router = useRouter();
    const {
        statusBarHeight,
        menuButtonHeight,
        menuButtonBoundingHeight,
        headerArea,
    } = useHeaderArea();
    const { colorMode } = useConnect(NCommon);
    const [subMode, setSubMode] = React.useState(null);

    function goBack() {
        if (isBack && !click) {
            router.back();
        } else if (click) {
            onClick();
        }
    }

    // useEffect(() => {
    //     if (bgUrl) {
    //         getTextColor(bgUrl);
    //     }
    // }, [bgUrl]);

    return (
        <View
            style={`
                --header-state-height: ${statusBarHeight}px;
                --header-tab-height: ${menuButtonHeight}px;
                --header-tab-bounding-height: ${menuButtonBoundingHeight}px;
                ${bgUrl ? `background-image: url(${bgUrl});` : `${headerArea}`}
                ${
                    bgUrl
                        ? `color: ${subMode === "dark" ? "white" : "black"}`
                        : ""
                }
                ${style}
            `}
            className={`sub-header-wrapper ${bgUrl ? subMode : colorMode} ${
                bg ? "bg-appear" : "end"
            } ${bgc ? "bgc-appear" : ""}`}
        >
            {clickCircle && (
                <View className="sub-header-icon">
                    <View className="click-circle" onClick={() => goBack()}>
                        <IconVisual
                            name={"back"}
                            isResize={false}
                            width={9}
                            height={16}
                        ></IconVisual>
                    </View>
                </View>
            )}
            {!clickCircle && (
                <View className="sub-header-title" onClick={() => goBack()}>
                    <>
                        {isBack && (
                            <IconVisual
                                name={
                                    bgUrl
                                        ? subMode === "dark"
                                            ? "back-light"
                                            : "back"
                                        : colorMode === "dark"
                                        ? "back-light"
                                        : mode === "dark"
                                        ? "back"
                                        : "back-light"
                                }
                                isResize={false}
                                width={9}
                                height={16}
                            ></IconVisual>
                        )}
                    </>
                    {title}
                </View>
            )}
            {children}
        </View>
    );
}
