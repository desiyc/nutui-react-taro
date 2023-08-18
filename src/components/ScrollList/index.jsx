import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import Taro, { useReady } from "@tarojs/taro";
import { ScrollView, View } from "@tarojs/components";
import "./index.scss";
import { EGetCommon, NBasic, NCommon } from "../../models/constants";
import { effect, useConnect } from "../../utils/dva17-taro";
import { Empty, Loading } from "@antmjs/vantui";
import { useUpdateEffect } from "ahooks";

function ScrollList(
    {
        h = 0,
        paddingTop = 40,
        paddingLeft = 40,
        paddingRight = 40,
        paddingBottom = 240,
        classArray = [],
        children,
        childrenBottom,
        requestPath,
        terms = null,
        renderItem = () => {},
        onScroll = () => {},
        onRefresh = () => {},
        onNoMoreItem = () => {},
        lowerThreshold = 100,
        isReady = false,
        isLoading = true,
        isDefaultShopChange = false,
        refresherEnabled = true,
        isHide = false,
        display = "grid",
        auto,
    },
    ref
) {
    const { defaultShop } = useConnect(NBasic);
    const [otherHeight, setOtherHeight] = React.useState(0);
    const [array, setArray] = React.useState([]); // 数据 Array。
    const [current, setCurrent] = React.useState(1); // 默认页码。
    const [pageSize, setPageSize] = React.useState(10); // 单次请求的最大条数。
    const [totalNum, setTotalNum] = React.useState(0); // 当前接口中的数据总条数。
    const [term, setTerm] = React.useState({}); // 搜索&筛选 参数。
    const [refreshState, setRefreshState] = React.useState(false); // 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发。
    const [moreState, setMoreState] = React.useState(false); // 防止慢速网络下多次请求。
    const [loading, setLoading] = React.useState(false);

    async function getArray(params, body) {
        // 瀑布流&下拉刷新&搜索 方法。params 为 true 执行 瀑布流，params 为 false 执行 下拉刷新&搜索。
        for (const key in term) {
            if (!term[key]) {
                delete term[key];
                setTerm(term);
            }
        }
        if (!params) {
            body["current"] = 1;
            setLoading(true);
            // setArray([]);
        }
        if (!requestPath) {
            setRefreshState(false);
            setLoading(false);
            return false;
        }
        try {
            const res = await effect(NCommon, EGetCommon, {
                path: requestPath,
                body: { ...body, ...term },
            });
            if (params) {
                setTotalNum(res.total ?? res.length);
                setArray(array.concat(res.data ?? res));
                setMoreState(false);
                if (totalNum == [...array, ...(res.data ?? res)].length) {
                    onNoMoreItem();
                }
            } else {
                setRefreshState(false);
                setTotalNum(res.total ?? res.length);
                setCurrent(1);
                setArray(res.data ?? res);
                if (
                    (res.total ?? res.length) ==
                    [...array, ...(res.data ?? res)].length
                ) {
                    onNoMoreItem();
                }
            }
            setLoading(false);
        } catch (error) {
            setRefreshState(false);
            setLoading(false);
            Taro.showToast({
                title: error?.message ?? "加载失败",
                icon: "none",
                duration: 1200,
            });
            console.error(error);
        }
    }

    function refresh() {
        // 下拉刷新 方法。
        setRefreshState(true);
        if (!refreshState) {
            onRefresh();
            getArray(false, { current, pageSize });
        }
    }

    function getMore() {
        // 上拉加载更多 方法。
        if (array.length < totalNum && !moreState) {
            setMoreState(true);
            setCurrent(current + 1);
        }
    }
    useEffect(() => {
        if (current != 1) {
            getArray(true, { current, pageSize, ...term });
        }
    }, [current]);

    function passivity(terms) {
        if (terms) {
            for (const key in terms) {
                if (terms[key]) {
                    term[key] = terms[key];
                    setTerm(term);
                } else {
                    delete term[key];
                    setTerm(term);
                }
            }
        }
        getArray(false, { current, pageSize, ...term });
    }

    useUpdateEffect(() => {
        if (isLoading) {
            passivity(terms);
        }
    }, [terms]);
    useUpdateEffect(() => {
        if (isDefaultShopChange) {
            passivity(terms);
        }
    }, [defaultShop]);

    function getScrollListHeight() {
        setOtherHeight(0);
        setTimeout(() => {
            classArray?.forEach((item) => {
                if (item) {
                    const query = Taro.createSelectorQuery();
                    query
                        .select(`.${item}`)
                        .boundingClientRect((rect) => {
                            setOtherHeight((otherHeight) => {
                                return otherHeight + rect?.height || 0;
                            });
                        })
                        .exec();
                }
            });
        }, 1);
    }

    function useEmptyFun() {
        // term 除了 current 和 pageSize 存在其他属性时，显示搜索结果为空。
        let flag = false;
        for (const key in term) {
            if (key !== "current" && key !== "pageSize") {
                flag = true;
            }
        }
        return flag;
    }

    function emptyLoadingFun() {
        if (!loading && !array.length) {
            return (
                <Empty
                    image={
                        useEmptyFun()
                            ? "https://os.hnmincheng.com/yh1/uploads/kifCpd/empty-search.png"
                            : "https://os.hnmincheng.com/yh1/uploads/t5Epna/empty-list.png"
                    }
                ></Empty>
            );
        } else if (loading) {
            return (
                <Loading color="var(--system-quaternary, #FF4D05)"></Loading>
            );
        }
    }
    function moreLoadingFun() {
        if (moreState) {
            return (
                <Loading color="var(--system-quaternary, #FF4D05)"></Loading>
            );
        }
    }

    function isRender() {
        if (isHide && !array.length) {
            return <>{emptyLoadingFun()}</>;
        }
        return (
            <ScrollView
                scrollY
                scrollWithAnimation={true}
                refresherEnabled={refresherEnabled}
                refresherThreshold={10}
                refresherDefaultStyle="black"
                refresherBackground="transparent"
                refresherTriggered={refreshState}
                onRefresherRefresh={() => refresh()}
                onScrollToLower={() => getMore()}
                onScroll={onScroll}
                lowerThreshold={lowerThreshold}
                enhanced={false}
                bounces={false}
                showScrollbar={false}
                enablePassive={true}
                className="scroll-list-wrapper"
                style={{
                    height: classArray?.length
                        ? `calc(100vh - (${otherHeight}px + ${Taro.pxTransform(
                              h
                          )}))`
                        : h
                        ? `calc(100vh - ${Taro.pxTransform(h)})`
                        : auto ?? "100vh",
                }}
            >
                {children}
                <View
                    className={`scroll-list-container ${display} loading-${loading} a-${array.length}`}
                    style={{
                        paddingBlockStart: Taro.pxTransform(paddingTop),
                        paddingBlockEnd: Taro.pxTransform(paddingBottom),
                        paddingInlineStart: Taro.pxTransform(paddingLeft),
                        paddingInlineEnd: Taro.pxTransform(paddingRight),
                    }}
                >
                    {array?.map((item, index) => {
                        return <>{renderItem(item, index)}</>;
                    })}
                    {emptyLoadingFun()}
                    {moreLoadingFun()}
                    {childrenBottom}
                </View>
            </ScrollView>
        );
    }

    useReady(() => {
        // 初始化。
        if (isLoading) {
            passivity(terms);
        }
    });

    useReady(() => {
        if (classArray.length > 0) {
            getScrollListHeight();
        }
    }, [classArray]);

    useImperativeHandle(ref, () => ({
        refresh: () => refresh(),
        passivity: (terms) => passivity(terms),
        updateArray: (array) => setArray(array),
    }));

    return <>{isRender()}</>;
}

export default forwardRef(ScrollList);
