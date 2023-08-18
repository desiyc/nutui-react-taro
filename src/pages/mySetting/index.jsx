import React from "react";
import Taro from "@tarojs/taro";
import {
    View,
    Text,
    Picker,
    Button,
    Input,
    Form,
    PageContainer,
} from "@tarojs/components";
import { checkUpdate, useHeaderArea, useRouter } from "../../utils";
import SubHeader from "../../components/SubHeader";
import IconVisual from "../../components/IconVisual";
import Avatar from "../../components/Avatar";
import { effect, useConnect } from "../../utils/dva17-taro";
import { EPostAccount, NAccount, EGetAccount } from "../../models/constants";
import config from "../../config";
import "./index.scss";
import dayjs from "dayjs";
import { Popup } from "@antmjs/vantui";
// import DatePicker from "../../components/DatePicker";
import lunarCalendar from "../../components/DatePicker/calendar";

export default function index() {
    const router = useRouter();
    const { headerArea } = useHeaderArea();
    const { profile } = useConnect(NAccount);
    const sexType = ["未知", "男", "女"];
    const [visible, setVisible] = React.useState(false);

    async function updateProfile(payload) {
        try {
            const res = await effect(NAccount, EPostAccount, payload);
            if (res?.rewardIntegral > 0) {
                Taro.showToast({
                    title: `已完善资料，获得${res.rewardIntegral}积分`,
                    icon: "none",
                    duration: 800,
                });
            }
            effect(NAccount, EGetAccount);
        } catch (error) {
            console.error(error);
            Taro.showModal({
                content: error?.message || `未知错误 ${error?.code}`,
                confirmText: "好",
                showCancel: false,
                success: function(res) {
                    Taro.removeStorageSync("token");
                    Taro.removeStorageSync("defaultShop");
                    // 退出小程序
                    Taro.exitMiniProgram();
                },
            });
        }
    }

    function updateAvatar(temp) {
        Taro.showLoading({
            title: "上传中",
            mask: true,
        });
        Taro.uploadFile({
            url: `${config.SERVER_HOME}mi/upload`,
            header: {
                Authorization: `Bearer ${Taro.getStorageSync("token")}`,
            },
            filePath: temp,
            name: "file",
            success: function(res) {
                updateProfile({ avatar: res.data });
                Taro.hideLoading();
            },
        });
    }

    function updateTel({ detail: { code: phoneCode, encryptedData, iv } }) {
        if (phoneCode) {
            updateProfile({ phoneCode: phoneCode });
        }
    }

    function birthdayRender() {
        if (!profile?.birthday) {
            return "未设置";
        }
        if (profile?.calendar === 3) {
            const date = dayjs(profile?.birthday)
                .format("YYYY-MM-DD")
                ?.split("-");
            const obj = lunarCalendar.solar2lunar(
                date?.[0],
                date?.[1],
                date?.[2]
            );
            return `${obj.cYear}年${obj.IMonthCn}${obj.IDayCn}`;
        } else {
            return dayjs(profile?.birthday).format("YYYY.MM.DD");
        }
    }

    return (
        <View className="setting-wrapper" style={headerArea}>
            <SubHeader title="个人设置"></SubHeader>
            <View className="setting-w-container">
                <Button
                    className="setting-wc-item"
                    openType="chooseAvatar"
                    onChooseAvatar={({ detail: { avatarUrl } }) => {
                        updateAvatar(avatarUrl);
                    }}
                >
                    <Text className="setting-wci-left">头像</Text>
                    <View className="setting-wci-right">
                        <Avatar size={32} src={profile?.avatar}></Avatar>
                        <IconVisual size={16} name="more-right-0"></IconVisual>
                    </View>
                </Button>
                <View
                    className="setting-wc-item"
                    onClick={() => setVisible(true)}
                >
                    <Text className="setting-wci-left">昵称</Text>
                    <View className="setting-wci-right overflow en-break-all">
                        <Text className="name-text overflow en-break-all">
                            {profile?.nickname}
                        </Text>
                        <IconVisual size={16} name="more-right-0"></IconVisual>
                    </View>
                </View>
                <Picker
                    mode="selector"
                    range={sexType}
                    value={profile?.sex}
                    onChange={({ detail: { value } }) => {
                        updateProfile({ sex: Number(value) });
                    }}
                >
                    <View className="setting-wc-item">
                        <Text className="setting-wci-left">性别</Text>
                        <View className="setting-wci-right">
                            {sexType[profile?.sex]}
                            <IconVisual
                                size={16}
                                name="more-right-0"
                            ></IconVisual>
                        </View>
                    </View>
                </Picker>
                {/* <DatePicker
                    value={dayjs(profile?.birthday).format("YYYY-MM-DD")}
                    type={profile?.calendar === 3}
                    onChange={(e) => {
                        updateProfile({
                            birthday: `${e.year}-${e.month}-${e.day}`,
                            calendar: e.type ? 3 : 1,
                        });
                    }}
                >
                    <View className="setting-wc-item">
                        <Text className="setting-wci-left">出生日期</Text>
                        <View className="setting-wci-right">
                            {birthdayRender()}
                            <IconVisual
                                size={16}
                                name="more-right-0"
                            ></IconVisual>
                        </View>
                    </View>
                </DatePicker> */}
                <Button
                    className="setting-wc-item"
                    openType="getPhoneNumber"
                    onGetPhoneNumber={updateTel}
                >
                    <Text className="setting-wci-left">绑定手机号</Text>
                    <View className="setting-wci-right">
                        {profile?.phone ?? "未绑定"}
                        <IconVisual size={16} name="more-right-0"></IconVisual>
                    </View>
                </Button>
                <View
                    className="setting-wc-item"
                    onClick={() => {
                        router.push({
                            name: "about",
                        });
                    }}
                >
                    <Text className="setting-wci-left">关于永恒诱惑</Text>
                    <IconVisual size={16} name="more-right-0"></IconVisual>
                </View>
            </View>
            <Popup
                round={true}
                closeable={true}
                show={visible}
                className="setting-wc-popup"
                onClose={() => {
                    setVisible(false);
                }}
            >
                <Form
                    onSubmit={({ detail: { value } }) => {
                        if (!value.nickname) {
                            Taro.showToast({
                                title: "昵称不能为空",
                                icon: "none",
                            });
                            return;
                        }
                        if (value.nickname === profile?.nickname) {
                            Taro.showToast({
                                title: "昵称未改变",
                                icon: "none",
                            });
                            return;
                        }
                        if (value.nickname.length > 24) {
                            Taro.showToast({
                                title: "昵称不能超过24个字符",
                                icon: "none",
                            });
                            return;
                        }
                        updateProfile(value);
                        setVisible(false);
                    }}
                >
                    <View
                        className="setting-wc-item"
                        style={{
                            justifyContent: "center",
                        }}
                    >
                        更新昵称
                    </View>
                    <View className="setting-wc-item">
                        <View className="setting-wci-right name">
                            <Input
                                name="nickname"
                                type="nickname"
                                value={profile?.nickname}
                                focus={true}
                            ></Input>
                        </View>
                    </View>
                    <Button
                        formType="submit"
                        className="setting-wc-item"
                        style={{
                            justifyContent: "center",
                        }}
                    >
                        更新
                    </Button>
                </Form>
            </Popup>
        </View>
    );
}
