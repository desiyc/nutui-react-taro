import React from "react";
import Taro, { useReady } from "@tarojs/taro";
import { View, Text, Image, Button } from "@tarojs/components";
import { useConnect } from "../../utils/dva17-taro";
import { NAccount, NCommon } from "../../models/constants";
import { useHeaderArea, useVibrateShort } from "../../utils";
import "./index.scss";
import IconVisual from "../IconVisual";

export default function Navigation({ children, current }) {
    const {
        statusBarHeight,
        menuButtonHeight,
        navigatorStyle,
    } = useHeaderArea();
    const [navigatorHeight, setNavigatorHeight] = React.useState(0);
    const { profile } = useConnect(NAccount);
    const { navigationVisible, colorMode, headerBg } = useConnect(NCommon);

    useReady(() => {
        setTimeout(() => {
            Taro.createSelectorQuery()
                .select(".navigation-container")
                .boundingClientRect((rect) => {
                    if (rect) {
                        const { height } = rect;
                        setNavigatorHeight(height);
                    }
                })
                .exec();
        }, 300);
    });

    const config = {
        color: "#808080",
        selectedColor: "#FF4D05",
        iconSize: 26,
        textSize: 10,
        navigationList: [
            {
                title: "首页",
                name: "browse",
                disabledHeader: false,
                type: "switchTab",
                index: 0,
            },
            {
                title: "消息",
                name: "notifications",
                disabledHeader: false,
                type: "switchTab",
                index: 1,
            },
            {
                type: "custom",
            },
            {
                title: "购物车",
                name: "shoppingCart",
                disabledHeader: false,
                type: "switchTab",
                index: 2,
            },
            {
                title: "我的",
                name: "my",
                disabledHeader: false,
                type: "switchTab",
                index: 3,
            },
        ],
    };

    async function routerPush(item) {
        Taro.switchTab({
            url: `/pages/${item.name}/index`,
        });
        return;
    }

    function redDone(index) {
        if (index === 1 && profile?.unreadCount) {
            return "red-done";
        } else {
            return "";
        }
    }

    return (
        <>
            <View
                className="navigation-wrapper"
                style={`
                padding-top: ${
                    config.navigationList[current]?.disabledHeader
                        ? statusBarHeight
                        : 0
                }px;
                --top: ${
                    config.navigationList[current]?.disabledHeader
                        ? statusBarHeight
                        : 0
                }px;
                --header-tab-height: ${menuButtonHeight}px;
                --bottom: ${navigatorHeight}px;
                --icon-size: ${Taro.pxTransform(config.iconSize * 2)};
                --text-size: ${Taro.pxTransform(config.textSize * 2)};
                --header-state-height: ${statusBarHeight}px;
                --header-capsule-height: ${menuButtonHeight}px;
                --color-mode: ${colorMode === "dark" ? "black" : ""};
                ${headerBg ? `--header-bg-url: ${headerBg};` : ""}
            `}
            >
                <View className="loading-inner">
                    <View className="loading-view">{children}</View>
                </View>
                <View
                    className={`navigation-container ${
                        navigationVisible
                            ? "navigation-appear"
                            : "navigation-disappear"
                    }`}
                    style={`${navigatorStyle} --badge: "${
                        profile?.unreadCount <= 99
                            ? profile?.unreadCount
                            : "99+"
                    }";`}
                >
                    {config.navigationList.map((item, index) => (
                        <Button
                            className={`navigation-item ${item.type}`}
                            key={item.name}
                            onClick={() => {
                                routerPush(item);
                                // useVibrateShort("medium");
                            }}
                        >
                            {item.type === "custom" ? (
                                <View className="custom-wrapper">
                                    <View className="custom-inner">
                                        <IconVisual
                                            name="qr-code"
                                            size={25}
                                        ></IconVisual>
                                    </View>
                                </View>
                            ) : (
                                <>
                                    <Image
                                        className={`navigation-icon ${redDone(
                                            item.index
                                        )}`}
                                        src={
                                            item.index == current
                                                ? require(`./images/${item.index}-1.png`)
                                                : require(`./images/${item.index}-0.png`)
                                        }
                                        mode="aspectFill"
                                    ></Image>
                                    <Text
                                        className="navigation-text"
                                        style={`color: ${
                                            item.index == current
                                                ? config.selectedColor
                                                : config.color
                                        }`}
                                    >
                                        {item.title}
                                    </Text>
                                </>
                            )}
                        </Button>
                    ))}
                </View>
            </View>
        </>
    );
}
