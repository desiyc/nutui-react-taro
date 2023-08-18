import React from "react";
import { View } from "@tarojs/components";
import "./index.scss";

export default function BlockGroup({ title = "", children }) {
    return (
        <View
            className={`block-group-wrapper ${
                title ? "block-group-wrapper-title" : ""
            }`}
        >
            <View className="block-group-title">{title}</View>
            {children}
        </View>
    );
}
