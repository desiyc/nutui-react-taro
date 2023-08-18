import React from "react";
// import { Image } from "@antmjs/vantui";
import { Image } from "@tarojs/components";
import "./index.scss";
import Taro from "@tarojs/taro";

export default function IconVisual({
    name,
    type = "png",
    size = 0,
    width = 0,
    height = 0,
    isResize = true,
    onClick = () => {},
}) {
    return (
        <>
            {isResize ? (
                <Image
                    className="icon-visual"
                    src={require(`./icons/${name}.${type}`)}
                    mode="widthFix"
                    style={{
                        width: Taro.pxTransform(size * 2),
                        height: Taro.pxTransform(size * 2),
                    }}
                    onClick={onClick}
                ></Image>
            ) : (
                <Image
                    className="icon-visual"
                    src={require(`./icons/${name}.${type}`)}
                    mode="widthFix"
                    style={{
                        width: Taro.pxTransform(width * 2),
                        height: Taro.pxTransform(height * 2),
                    }}
                    onClick={onClick}
                ></Image>
            )}
        </>
        // <Image
        //     className="icon-visual"
        //     src={require(`./icons/${name}.${type}`)}
        //     width={size * 2}
        //     // lazyLoad={true}
        //     fit="widthFix"
        //     showError={true}
        //     showLoading={false}
        //     onClick={onClick}
        // ></Image>
    );
}
