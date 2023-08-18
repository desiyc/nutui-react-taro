import { Button } from "@nutui/nutui-react-taro";
import "./index.scss";
// 如果您已集成 v2.x 的 SDK，想升级到 V3 并且想尽可能地少改动项目代码，可以继续沿用 TIM
// import TIM from '@tencentcloud/chat';
import TencentCloudChat from "@tencentcloud/chat";
import TIMUploadPlugin from "tim-upload-plugin";
import TIMProfanityFilterPlugin from "tim-profanity-filter-plugin";
import { useEffect } from "react";
import { View } from "@tarojs/components";
import React from "react";

//创建实例
function onInitChat() {
    //测试AppID注册
    let create_options = {
        SDKAppID: 1400823918, // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
    };
    // 创建 SDK 实例
    let chat: any = TencentCloudChat.create(create_options);
    //打印实例版本是否创建
    chat.setLogLevel(1); // 普通级别，日志量较多，接入时建议使用

    // 注册腾讯云即时通信 IM 上传插件
    chat.registerPlugin({ "tim-upload-plugin": TIMUploadPlugin });

    // 注册腾讯云即时通信 IM 本地审核插件
    chat.registerPlugin({
        "tim-profanity-filter-plugin": TIMProfanityFilterPlugin,
    });
    onLoginChat(chat);
}

//实例登录
function onLoginChat(chat: any) {
    //使用SDK内置各API前需要在实例化后进行登录操作,本demo中使用的是测试账号并且是在腾讯云控制台生成的userSig,仅供测试使用,正式环境需要业务自己实现userSig的生成
    let login_options = {
        userID: "132",
        userSig:
            "eJyrVgrxCdYrSy1SslIy0jNQ0gHzM1NS80oy0zLBwobGRlDh4pTsxIKCzBQlK0MTAwMLI2NLQwuITGpFQWZRKlDc1NTUyMDAACJakpkLEjOzNLAwN7U0MISakpkONNU3Oys939ggI0a-qsIvKyzRxDTXJDG0LDvR3TAyzDvJM9XPLcLDL8lJ28DQwlapFgCIzy**",
    };
    let promise = chat.login(login_options);
    promise
        .then(function(imResponse: any) {
            console.log(imResponse.data, "success----------"); // 登录成功
            if (imResponse.data.repeatLogin === true) {
                // 标识账号已登录，本次登录操作为重复登录。
                console.log(imResponse.data.errorInfo);
            }
        })
        .catch(function(imError: any) {
            console.warn("login error:", imError); // 登录失败的相关信息
        });
}
useEffect(() => {
    console.log("useEffect");
    onInitChat();
}, []);
export default () => {
    return (
        <View className="nutui-react-demo">
            <View className="index">
                欢迎使用 NutUI React 开发 Taro 多端项目。
            </View>
            <View className="index">
                <Button type="primary" className="btn">
                    NutUI React Button
                </Button>
            </View>
        </View>
    );
};
