import React, { useState, useEffect } from "react";
import { CalendarList } from "react-native-calendars";

const XDate = require("xdate");


const DateRangePicker = ({ theme, initialRange, onSuccess, ...props }) => {
	const [isFromDatePicked, setIsFromDatePicked] = useState(false);
	const [isToDatePicked, setIsToDatePicked] = useState(false);
	const [markedDates, setMarkedDates] = useState({});
	const [fromDate, setFromDate] = useState(null);

	useEffect(() => {
		setupInitialRange();
	}, []);

	const onDayPress = (day: any) => {
		if (!isFromDatePicked || (isFromDatePicked && isToDatePicked)) {
			setupStartMarker(day);
		} else if (!isToDatePicked) {
			let markedDates1 = { ...markedDates };
			let [mMarkedDates1, _range] = setupMarkedDates(
				fromDate,
				day.dateString,
				markedDates1
			);
			if (range >= 0) {
				setIsToDatePicked(true);
				setIsToDatePicked(true)
				setMarkedDates(mMarkedDates1);
				onSuccess(fromDate, day.dateString);
			} else {
				setupStartMarker(day);
			}
		}
	};

	const setupStartMarker = (day: any) => {
		let markedDates = {
			[day.dateString]: {
				startingDay: true,
				color: theme.markColor,
				textColor: theme.markTextColor,
			},
		};
		setIsFromDatePicked(true);
		setIsToDatePicked(false);
		setFromDate(day.dateString);
		setMarkedDates(markedDates);
	};

	const setupMarkedDates = (fromDate: any, toDate: any, markedDates: any) => {
		let mFromDate = new XDate(fromDate);
		let mToDate = new XDate(toDate);
		let range = mFromDate.diffDays(mToDate);

		if (range >= 0) {
			if (range === 0) {
				markedDates = {
					[toDate]: {
						color: theme.markColor,
						textColor: theme.markTextColor,
					},
				};
			} else {
				for (let i = 1; i <= range; i++) {
					let tempDate = mFromDate.addDays(1).toString("yyyy-MM-dd");
					if (i < range) {
						markedDates[tempDate] = {
							color: theme.markColor,
							textColor: theme.markTextColor,
						};
					} else {
						markedDates[tempDate] = {
							endingDay: true,
							color: theme.markColor,
							textColor: theme.markTextColor,
						};
					}
				}
			}
		}

		return [markedDates, range];
	};

	const setupInitialRange = () => {
		if (!initialRange) return;
		let [fromDate, toDate] = initialRange;
		let markedDates = {
			[fromDate]: {
				startingDay: true,
				color: theme.markColor,
				textColor: theme.markTextColor,
			},
		};
		let [mMarkedDates, _range] = setupMarkedDates(
			fromDate,
			toDate,
			markedDates
		);
		setMarkedDates(mMarkedDates);
		setFromDate(fromDate);
	};

	return (
		<CalendarList
			{...props}
			theme={theme}
			markingType={"period"}
			current={initialRange && initialRange[0]}
			markedDates={markedDates}
			onDayPress={(day) => onDayPress(day)}
		/>
	);
};

export default DateRangePicker;
