import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import BottomSheetLayer from "../../../components/BottomSheet/BottomSheetLayer";
import Select from "../../../components/BottomSheet/Select";
import DateRangePicker from "./DateRangePicker";
import SubmitButton from "../../../components/Forms/SubmitButton";
import { View } from "react-native";
import { CalendarList, LocaleConfig } from "react-native-calendars";
import { select } from "../modules/dateForm";
import { close } from "../../../modules/bottomSheet";
import { useTheme } from "../../../theme/ThemeContext";

LocaleConfig.locales["fr"] = {
	monthNames: [
		"Ocak",
		"Şubat",
		"Mart",
		"Nisan",
		"Mayıs",
		"Haziran",
		"Temmuz",
		"Ağustos",
		"Eylül",
		"Ekim",
		"Kasım",
		"Aralık",
	],
	monthNamesShort: [
		"Oca",
		"Şub",
		"Mar",
		"Nis",
		"May",
		"Haz",
		"Tem",
		"Ağu",
		"Eyl",
		"Eki",
		"Kas",
		"Ara",
	],
	dayNames: [
		"Pazar",
		"Pazartesi",
		"Salı",
		"Çarşamba",
		"Perşembe",
		"Cuma",
		"Cumartesi",
	],
	dayNamesShort: ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cts"],
	today: "Bugün",
};
LocaleConfig.defaultLocale = "fr";

const DateForm = ({ open, attachment, changeAttachment }) => {
	const { theme } = useTheme();
	const { selected, options } = useSelector((state: any) => state.dateForm);

	const dispatch = useDispatch();

	// Calendar props içine theme değerlerini ekle
	const defaultCalendarProps = {
		scrollEnabled: true,
		pastScrollRange: 50,
		futureScrollRange: 50,
		showScrollIndicator: true,
		firstDay: 1,
		maxDate: new Date().toISOString().split("T")[0],
		theme: {
			selectColor: theme.portfolio,
			markColor: theme.portfolio,
			markTextColor: theme.onBlue,
			calendarBackground: theme.darkBrand,
			textSectionTitleColor: theme.primaryText,
			monthTextColor: theme.white,
			dayTextColor: theme.white,
			todayTextColor: theme.white,
			textDisabledColor: theme.separator,
			textDayFontFamily: theme.regularFont,
			textMonthFontFamily: theme.regularFont,
			textDayHeaderFontFamily: theme.regularFont,
		},
	};

	const initialRange = selected?.startsWith("custom|") && selected?.split("|").slice(1);
	const [range, setRange] = useState(initialRange);

	const initialDay = selected?.startsWith("custom-single|")
		? selected.split("|").slice(1)
		: new Date();
	const [day, setDay] = useState(initialDay);

	const handleSelect = (value: any) => {
		if (value === "custom") {
			dispatch(changeAttachment("custom"));
		} else if (value === "custom-single") {
			dispatch(changeAttachment("custom-single"));
		} else {
			dispatch(select(value));
			dispatch(close());
		}
	};

	const handleRangeSubmit = () => {
		if (range) {
			dispatch(select(`custom|${range.join("|")}`));
			dispatch(close());
		}
	};

	const handleSingleDateSubmit = () => {
		if (day) {
			dispatch(select(`custom-single|${day}`));
			dispatch(close());
		}
	};

	return (
		<>
			<BottomSheetLayer
				title="Tarih Filtresi"
				open={open}
				small={attachment !== null}
				onCancel={() => dispatch(close())}
				contentHeight={500}
			>
				<Select
					onChange={handleSelect}
					options={options}
					value={
						selected?.startsWith("custom|")
							? "custom"
							: selected?.startsWith("custom-single|")
								? "custom-single"
								: selected
					}
				/>
			</BottomSheetLayer>

			{attachment === "custom" && (
				<BottomSheetLayer
					title="Özel Tarih Aralığı"
					open
					small={false}
					onCancel={() => dispatch(changeAttachment(null))}
					contentHeight={570}
				>
					<View style={{ height: 400 }}>
						<DateRangePicker
							initialRange={initialRange}
							onSuccess={(startDate: any, endDate: any) => setRange([startDate, endDate])}
							{...defaultCalendarProps}
						/>
					</View>

					<SubmitButton
						label="TAMAM"
						disabled={!range}
						onPress={handleRangeSubmit}
						margin
					/>
				</BottomSheetLayer>
			)}

			{attachment === "custom-single" && (
				<BottomSheetLayer
					title="Tarih Seçimi"
					open
					small={false}
					onCancel={() => dispatch(close())}
					contentHeight={600}
				>
					<View style={{ height: 400 }}>
						<CalendarList
							current={new Date(initialDay).toISOString().split("T")[0]} // 'YYYY-MM-DD' formatında string
							markedDates={
								day && {
									[day]: {
										selected: true,
										selectedColor: theme.portfolio,
									},
								}
							}
							onDayPress={(selectedDay) => setDay(selectedDay.dateString)}
							{...defaultCalendarProps}
						/>
					</View>

					<SubmitButton
						label="TAMAM"
						disabled={!day}
						onPress={handleSingleDateSubmit}
						margin
					/>
				</BottomSheetLayer>
			)}
		</>
	);
};

export default DateForm;
