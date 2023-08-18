import React from "react";
import { View } from "@tarojs/components";
import "./index.scss";
import IconVisual from "../IconVisual";

export default function BlockItem({
    title = "标题",
    children,
    iconSize = 16,
    iconName = "more-right-0",
    onClick = () => {},
}) {
    return (
        <View className="block-item" onClick={onClick}>
            <View className="block-item-left">{title}</View>
            <View className="block-item-right">
                {children}
                <IconVisual size={iconSize} name={iconName}></IconVisual>
            </View>
        </View>
    );
}
