import React, { useState } from "react";
import {
    View,
    PickerView,
    PickerViewColumn,
    Switch,
    PageContainer,
} from "@tarojs/components";
import { useMount, useUpdateEffect } from "ahooks";
import lunarCalendar from "./calendar";
import TimeUtils from "./timeUtils";
import "./index.scss";
import NextButton from "../NextButton";
import { AtFloatLayout } from "taro-ui";

export default function DatePicker({
    value,
    type = false,
    onChange = () => {},
    minTime = "1901/01/01",
    maxTime = "2100/12/31",
    children,
}) {
    const [isShow, setIsShow] = useState(false);
    const [pickerYearArr, setPickerYearArr] = useState([]);
    const [pickerMonthArr, setPickerMonthArr] = useState([]);
    const [pickerDayArr, setPickerDayArr] = useState([]);
    const [pickerSelectIndexArr, setPickerSelectIndexArr] = useState([]);
    const [pickerSelectTime, setPickerSelectTime] = useState("");
    const [pickerIsLunar, setPickerIsLunar] = useState(false);

    useUpdateEffect(() => {
        if (isShow) {
            setPickerIsLunar(type);
            setPickerSelectTime(value);
            initData(type, value);
        }
    }, [isShow]);

    function initData(pickerIsLunar, time) {
        let timeObj = TimeUtils.Jh_getYearMonthDayObj(time ?? pickerSelectTime);
        if (pickerIsLunar) {
            let lunarTimeObj = lunarCalendar.solar2lunar(
                timeObj.year,
                timeObj.month,
                timeObj.day
            );
            let newTimeObj = {};
            newTimeObj.year = lunarTimeObj.lYear;
            newTimeObj.month = lunarTimeObj.lMonth;
            newTimeObj.day = lunarTimeObj.lDay;
            newTimeObj.isLeapMonth = lunarTimeObj.IMonthCn.includes("闰");
            setDateLunarTime(newTimeObj);
        } else {
            setDateTime(timeObj);
        }
    }

    function getYears() {
        let minYear = getYear(minTime);
        let maxYear = getYear(maxTime);
        let tempArr = [];
        for (let i = minYear; i <= maxYear; i++) {
            tempArr.push({
                label: i + "年",
                value: i,
            });
        }
        return tempArr;
    }
    function getMonths(year) {
        let minMonth = 1;
        let maxMonth = 12;
        if (year <= getYear(minTime)) {
            minMonth = getMonth(minTime);
        }
        if (year >= getYear(maxTime)) {
            maxMonth = getMonth(maxTime);
        }
        let tempArr = [];
        for (let i = minMonth; i <= maxMonth; i++) {
            tempArr.push({
                label: i < 10 ? "0" + i + "月" : i + "月",
                value: i,
            });
        }
        return tempArr;
    }

    function getDays(year, month) {
        let dayInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
            dayInMonth[1] = 29;
        }
        let minDay = 1;
        let maxDay = dayInMonth[month - 1];
        if (year <= getYear(minTime) && month <= getMonth(minTime)) {
            minDay = getDay(minTime);
        }
        if (year >= getYear(maxTime) && month >= getMonth(maxTime)) {
            maxDay = getDay(maxTime);
        }
        let tempArr = [];
        for (let i = minDay; i <= maxDay; i++) {
            tempArr.push({
                label: i < 10 ? "0" + i + "日" : i + "日",
                value: i,
            });
        }
        return tempArr;
    }

    function getLunarYears() {
        let minLunarTimeObj = convertLunarTime(minTime);
        let maxLunarTimeObj = convertLunarTime(maxTime);
        let minYear = minLunarTimeObj.lYear;
        let maxYear = maxLunarTimeObj.lYear;
        let tempArr = [];
        for (let i = minYear; i <= maxYear; i++) {
            tempArr.push({
                label: i + "(" + lunarCalendar.toGanZhiYear(i) + "年)",
                value: i,
            });
        }
        return tempArr;
    }
    function getLunarMonths(year) {
        let minMonth = 1;
        let maxMonth = 12;
        let minLunarTimeObj = convertLunarTime(minTime);
        let maxLunarTimeObj = convertLunarTime(maxTime);
        if (year <= minLunarTimeObj.lYear) {
            minMonth = minLunarTimeObj.lMonth;
        }
        if (year >= maxLunarTimeObj.lYear) {
            maxMonth = maxLunarTimeObj.lMonth;
        }
        // 是否有闰月
        let leapMonth = lunarCalendar.leapMonth(year);
        let tempArr = [];
        for (let i = minMonth; i <= maxMonth; i++) {
            tempArr.push({
                label: lunarCalendar.toChinaMonth(i),
                value: i,
                isLeapMonth: false,
            });
        }
        if (leapMonth > 0 && leapMonth >= minMonth && leapMonth <= maxMonth) {
            tempArr.splice(leapMonth, 0, {
                label: "闰" + lunarCalendar.toChinaMonth(leapMonth),
                value: leapMonth,
                isLeapMonth: true,
            });
        }
        return tempArr;
    }
    function getLunarDays(year, month, isLeapMonth = false) {
        let days = isLeapMonth
            ? lunarCalendar.leapDays(year)
            : lunarCalendar.monthDays(year, month);
        let minDay = 1;
        let maxDay = days;
        let minLunarTimeObj = convertLunarTime(minTime);
        let maxLunarTimeObj = convertLunarTime(maxTime);
        if (year <= minLunarTimeObj.lYear && month <= minLunarTimeObj.lMonth) {
            minDay = minLunarTimeObj.lDay;
        }
        if (year >= maxLunarTimeObj.lYear && month >= maxLunarTimeObj.lMonth) {
            maxDay = maxLunarTimeObj.lDay;
        }
        let tempArr = [];
        for (let i = minDay; i <= maxDay; i++) {
            tempArr.push({
                label: lunarCalendar.toChinaDay(i),
                value: i,
            });
        }
        return tempArr;
    }

    function getYear(time) {
        let timeObj = TimeUtils.Jh_getYearMonthDayObj(time);
        return Number(timeObj.year);
    }
    function getMonth(time) {
        let timeObj = TimeUtils.Jh_getYearMonthDayObj(time);
        return Number(timeObj.month);
    }
    function getDay(time) {
        let timeObj = TimeUtils.Jh_getYearMonthDayObj(time);
        return Number(timeObj.day);
    }
    function convertLunarTime(time) {
        const { year, month, day } = TimeUtils.Jh_getYearMonthDayObj(time);
        let lunarCalendarTime = lunarCalendar.solar2lunar(year, month, day);
        return lunarCalendarTime;
    }

    function setDateTime(timeObj) {
        let yearArr = getYears();
        let monthArr = getMonths(timeObj.year);
        let dayArr = getDays(timeObj.year, timeObj.month);
        setPickerYearArr(yearArr);
        setPickerMonthArr(monthArr);
        setPickerDayArr(dayArr);
        let yearIndex = yearArr.findIndex((item) => item.value == timeObj.year);
        let monthIndex = monthArr.findIndex(
            (item) => item.value == timeObj.month
        );
        let dayIndex = dayArr.findIndex((item) => item.value == timeObj.day);
        if (timeObj.year <= getYear(minTime)) {
            yearIndex = yearArr.findIndex(
                (item) => item.value == getYear(minTime)
            );
        }
        if (
            timeObj.year <= getYear(minTime) &&
            timeObj.month <= getMonth(minTime)
        ) {
            monthIndex = monthArr.findIndex(
                (item) => item.value == getMonth(minTime)
            );
        }
        if (
            timeObj.year <= getYear(minTime) &&
            timeObj.month <= getMonth(minTime) &&
            timeObj.day <= getDay(minTime)
        ) {
            dayIndex = dayArr.findIndex(
                (item) => item.value == getDay(minTime)
            );
        }
        if (timeObj.year >= getYear(maxTime)) {
            yearIndex = yearArr.findIndex(
                (item) => item.value == getYear(maxTime)
            );
        }
        if (
            timeObj.year >= getYear(maxTime) &&
            timeObj.month >= getMonth(maxTime)
        ) {
            monthIndex = monthArr.findIndex(
                (item) => item.value == getMonth(this.properties.maxTime)
            );
        }
        if (
            timeObj.year >= getYear(maxTime) &&
            timeObj.month >= getMonth(maxTime) &&
            timeObj.day >= getDay(maxTime)
        ) {
            dayIndex = dayArr.findIndex(
                (item) => item.value == getDay(maxTime)
            );
        }
        let selectTime = TimeUtils.Jh_timeToTime(
            yearArr[yearIndex].value +
                "/" +
                monthArr[monthIndex].value +
                "/" +
                dayArr[dayIndex].value,
            "{y}/{m}/{d}"
        );
        setPickerSelectTime(selectTime);
        setTimeout(() => {
            setPickerSelectIndexArr([yearIndex, monthIndex, dayIndex]);
        }, 1);
    }
    function setDateLunarTime(timeObj) {
        let isLeapMonth =
            timeObj.isLeapMonth &&
            lunarCalendar.leapMonth(timeObj.year) == timeObj.month;
        let lunarTimeObj = lunarCalendar.lunar2solar(
            timeObj.year,
            timeObj.month,
            timeObj.day,
            isLeapMonth
        );
        let yearArr = getLunarYears();
        let monthArr = getLunarMonths(lunarTimeObj.year);
        let dayArr = getLunarDays(
            lunarTimeObj.year,
            lunarTimeObj.month,
            isLeapMonth
        );
        setPickerYearArr(yearArr);
        setPickerMonthArr(monthArr);
        setPickerDayArr(dayArr);
        let yearIndex = yearArr.findIndex((item) => item.value == timeObj.year);
        let monthIndex = monthArr.findIndex(
            (item) => item.label == lunarTimeObj.IMonthCn
        );
        let dayIndex = dayArr.findIndex(
            (item) => item.label == lunarTimeObj.IDayCn
        );
        let minLunarTimeObj = convertLunarTime(minTime);
        let minYear = minLunarTimeObj.lYear;
        let minMonth = minLunarTimeObj.lMonth;
        let minDay = minLunarTimeObj.lDay;
        if (timeObj.year <= minYear) {
            yearIndex = yearArr.findIndex((item) => item.value == minYear);
        }
        if (timeObj.year <= minYear && timeObj.month <= minMonth) {
            monthIndex = monthArr.findIndex((item) => item.value == minMonth);
        }
        if (
            timeObj.year <= minYear &&
            timeObj.month <= minMonth &&
            timeObj.day <= minDay
        ) {
            dayIndex = dayArr.findIndex((item) => item.value == minDay);
        }
        let maxLunarTimeObj = convertLunarTime(maxTime);
        let maxYear = maxLunarTimeObj.lYear;
        let maxMonth = maxLunarTimeObj.lMonth;
        let maxDay = maxLunarTimeObj.lDay;
        if (timeObj.year >= maxYear) {
            yearIndex = yearArr.findIndex((item) => item.value == maxYear);
        }
        if (timeObj.year >= maxYear && timeObj.month >= maxMonth) {
            monthIndex = monthArr.findIndex((item) => item.value == maxMonth);
        }
        if (
            timeObj.year >= maxYear &&
            timeObj.month >= maxMonth &&
            timeObj.day >= maxDay
        ) {
            dayIndex = dayArr.findIndex((item) => item.value == maxDay);
        }
        let selectLunarTimeObj = lunarCalendar.lunar2solar(
            yearArr[yearIndex].value,
            monthArr[monthIndex].value,
            dayArr[dayIndex].value,
            isLeapMonth
        );
        let selectTime = TimeUtils.Jh_timeToTime(
            selectLunarTimeObj.date,
            "{y}/{m}/{d}"
        );
        setPickerSelectTime(selectTime);
        setTimeout(() => {
            setPickerSelectIndexArr([yearIndex, monthIndex, dayIndex]);
        }, 1);
    }

    function setDateChange(value) {
        let yearIndex = value[0] >= 0 ? value[0] : 0;
        let monthIndex = value[1] >= 0 ? value[1] : 0;
        let dayIndex = value[2] >= 0 ? value[2] : 0;
        let yearObj = pickerYearArr[yearIndex];
        let monthObj = pickerMonthArr[monthIndex];
        let dayObj = pickerDayArr[dayIndex];
        if (pickerIsLunar) {
            setDateLunarTime({
                year: yearObj.value,
                month: monthObj.value,
                day: dayObj.value,
                isLeapMonth: monthObj.isLeapMonth,
            });
        } else {
            setDateTime({
                year: yearObj.value,
                month: monthObj.value,
                day: dayObj.value,
            });
        }
    }

    return (
        <>
            <View onClick={() => setIsShow(true)}>{children}</View>
            <AtFloatLayout
                isOpened={isShow}
                position="bottom"
                round={true}
                closeOnSlideDown={false}
                onClose={() => {
                    setIsShow(false);
                }}
                style={{
                    position: "fixed",
                    zIndex: 9,
                }}
                className="date-picker_wrapper"
            >
                <View>
                    <View className="date-picker_container">
                        <View className="dpw-header"></View>
                        <PickerView
                            value={pickerSelectIndexArr}
                            immediateChange={true}
                            indicatorStyle="height: 50px;"
                            onChange={({ detail: { value } }) => {
                                setPickerSelectIndexArr(value);
                                setDateChange(value);
                            }}
                        >
                            <PickerViewColumn>
                                {pickerYearArr?.map((item, index) => (
                                    <View className="dpw-item" key={index}>
                                        {item.label}
                                    </View>
                                ))}
                            </PickerViewColumn>
                            <PickerViewColumn>
                                {pickerMonthArr?.map((item, index) => (
                                    <View className="dpw-item" key={index}>
                                        {item.label}
                                    </View>
                                ))}
                            </PickerViewColumn>
                            <PickerViewColumn>
                                {pickerDayArr?.map((item, index) => (
                                    <View className="dpw-item" key={index}>
                                        {item.label}
                                    </View>
                                ))}
                            </PickerViewColumn>
                        </PickerView>
                    </View>
                    <NextButton
                        type="pay"
                        rightText="确认"
                        rightClick={() => {
                            setIsShow(false);
                            let year =
                                pickerYearArr[pickerSelectIndexArr[0]].value;
                            let month =
                                pickerMonthArr[pickerSelectIndexArr[1]].value;
                            let day =
                                pickerDayArr[pickerSelectIndexArr[2]].value;
                            const obj = pickerIsLunar
                                ? lunarCalendar.lunar2solar(
                                      year,
                                      month,
                                      day,
                                      pickerMonthArr[pickerSelectIndexArr[1]]
                                          .isLeapMonth
                                  )
                                : { year, month, day };
                            onChange({
                                year: pickerIsLunar ? obj.cYear : obj.year,
                                month: pickerIsLunar ? obj.cMonth : obj.month,
                                day: pickerIsLunar ? obj.cDay : obj.day,
                                type: pickerIsLunar,
                            });
                        }}
                    >
                        <View className="year-toggle_wrapper">
                            <Switch
                                className="year-toggle-red"
                                color="#f00"
                                controlled={true}
                                checked={pickerIsLunar}
                                onChange={({ detail: { value } }) => {
                                    setPickerIsLunar(value);
                                    initData(value);
                                }}
                            ></Switch>
                            <View></View>
                        </View>
                    </NextButton>
                </View>
            </AtFloatLayout>
        </>
    );
}
