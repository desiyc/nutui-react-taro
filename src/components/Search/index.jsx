import React from "react";
import Taro, { useDidHide } from "@tarojs/taro";
import { View, Input, Button } from "@tarojs/components";
import IconVisual from "../IconVisual";
import { debounceFun, pxFun, useNluHandler } from "../../utils";
import "./index.scss";
import dayjs from "dayjs";

export default function Search({
    placeholder,
    type = "v1" || "v2",
    onConfirm = () => {},
    searchMethod = "onConfirm" || "onInput",
    interval = 500,
    hint = false,
    hintsStorageKey = "search-hints",
    bottom = 0,
}) {
    const [term, setTerm] = React.useState();
    const [focus, setFocus] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [hintsVisible, setHintsVisible] = React.useState(false);
    const [hints, setHints] = React.useState(
        Taro.getStorageSync(hintsStorageKey) || []
    );
    const action = React.useRef(null);
    const hintsRef = React.useRef(null);

    const handleInput = debounceFun(function(value) {
        savaHints(...value);
        onConfirm(...value);
    }, interval);

    function savaHints(value) {
        const hints = Taro.getStorageSync(hintsStorageKey) || [];
        if (hints.some((item) => item.hint === value)) {
            return;
        }
        if (!hint || !value) {
            return;
        }
        hints.push({
            hint: value,
            time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        });
        setHints(hints);
        Taro.setStorageSync(hintsStorageKey, hints);
    }

    useDidHide(() => {
        if (visible) {
            setVisible(false);
        }
    });

    return (
        <>
            <View
                className={`search-wrapper ${type}`}
                style={{ marginBlockEnd: `${pxFun(bottom)}rpx` }}
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                }}
            >
                <View className="search-container">
                    <IconVisual name="search" size={16}></IconVisual>
                    <Input
                        ref={action}
                        type="text"
                        className="search-input"
                        value={term}
                        placeholder={placeholder}
                        placeholderStyle="color: #918186;"
                        placeholderClass="search-placeholder"
                        onConfirm={({ detail: { value } }) => {
                            setTerm(value);
                            if (searchMethod === "onConfirm") {
                                savaHints(value);
                                onConfirm(value);
                            }
                        }}
                        onInput={({ detail: { value } }) => {
                            setTerm(value);
                            // useNluHandler("sensitive", { q: value, mode: "cnn" });
                            if (searchMethod === "onInput") {
                                handleInput(value);
                            } else if (searchMethod === "onConfirm" && !value) {
                                onConfirm(value);
                            }
                        }}
                        onFocus={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            setFocus(true);
                            setVisible(true);
                        }}
                        onBlur={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            setFocus(false);
                            setTimeout(() => {
                                if (!hintsVisible) {
                                    setVisible(false);
                                }
                            }, 100);
                        }}
                    ></Input>
                    <Button
                        className={`clear-search ${
                            term && focus ? "active" : "inactive"
                        }`}
                        disabled={!term}
                        onClick={(event) => {
                            event.stopPropagation();
                            event.preventDefault();
                            setTerm("");
                            onConfirm("");
                            setFocus(false);
                            setVisible(false);
                        }}
                    >
                        <IconVisual name="clear-search" size={18}></IconVisual>
                    </Button>
                    <View
                        ref={hintsRef}
                        className={`search-hints-wrapper ${
                            visible && hint ? "expand" : ""
                        }`}
                        style={`--search-hints-number: ${
                            hints.length > 5 ? 5 : hints.length
                        };`}
                        onTouchStart={() => {
                            setHintsVisible(true);
                            setVisible(true);
                        }}
                    >
                        <View className="search-hints-container">
                            {hints?.map((item, index) => (
                                <View
                                    className="search-hint-item"
                                    key={index}
                                    onClick={() => {
                                        setTerm(item.hint);
                                        onConfirm(item.hint);
                                        setFocus(false);
                                        setVisible(false);
                                        action.current.blur();
                                    }}
                                >
                                    {item.hint}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>
            <View
                className={`hints-click-mask ${visible ? "expand" : ""}`}
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    setFocus(false);
                    setVisible(false);
                    setHintsVisible(false);
                    action.current.blur();
                }}
            ></View>
        </>
    );
}
