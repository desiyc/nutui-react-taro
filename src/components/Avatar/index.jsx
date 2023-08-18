import React from "react";
import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import IconVisual from "../IconVisual";
import "./index.scss";
import { pictureSize, pxFun } from "../../utils";
import { Image, Loading } from "@antmjs/vantui";

export default function Avatar({
    size = 52,
    src = "",
    radius,
    name = "",
    flow = "column",
    children,
    childrenName,
    sex = "",
    fontSize = 16,
    onClick = () => {},
}) {
    return (
        <View
            style={`
            --avatar-size: ${Taro.pxTransform(size * 2)};
            --avatar-border-radius: ${radius ?? size}px;
            --flow: ${flow};
            --avatar-font-size: ${fontSize}px;
            `}
            className="avatar-wrapper"
            onClick={onClick}
        >
            <Image
                src={pictureSize(src, size, size)}
                showError={true}
                showLoading={true}
                lazyLoad={true}
                fit="cover"
            ></Image>
            {name && (
                <View className="avatar-name">
                    {children}
                    {sex && <IconVisual size={20} name={sex}></IconVisual>}
                    <View className="name-text">
                        <Text className="overflow en-break-all">{name}</Text>
                        {childrenName}
                    </View>
                </View>
            )}
        </View>
    );
}
