import React, { useEffect } from "react";
import { withToolAds } from "../../../modules/ads/withToolAds";
import { useSelector, useDispatch } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import { load, defaultPeriodOption, defaultCountryOption, defaultRatingOption, resetCalendar } from "../modules/list";
import { save } from "../../AlarmsCreate/modules/create";
import Calendar from "../components/Calendar";
import FilterTriggerContainer from "./FilterTriggerContainer";

const CalendarContainer = ({ navigation }: any) => {
	const dispatch = useDispatch();

	// State selectors
	const data = useSelector((state: any) => state.calendar.list.data);
	const loading = useSelector((state: any) => state.calendar.list.loading);
	const licences = useSelector((state: any) => state.auth?.user?.licences || []);

	const hasImkbh = licences.some((licence: string) =>
		["COMEX", "IMKBL1P"].includes(licence)
	);
	// Reset filters and load default data when screen comes into focus
	useFocusEffect(
		React.useCallback(() => {
			dispatch(resetCalendar());
			dispatch(load({
				country: defaultCountryOption,
				period: defaultPeriodOption,
				rating: defaultRatingOption
			}));
		}, [dispatch])
	);

	// Set navigation options
	useEffect(() => {
		navigation.setOptions({
			headerTitleAlign: "center",
			title: "Ekonomik Takvim",
			headerRight: () => <FilterTriggerContainer />,
		});
	}, [navigation]);

	// Props to pass to Calendar
	const calendarProps = {
		data,
		loading,
		save: (values: any) => dispatch(save(values)),
		hasImkbh,
	};

	return <Calendar {...calendarProps} />;
};

export default withToolAds(CalendarContainer, "ekonomik-takvim");