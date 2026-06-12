import React from "react";
import { FlatList } from "react-native-gesture-handler";
import { CalendarEvent } from "../modules/list";
import Row from "./Row";
import ToolFooterAd from "../../../modules/ads/ToolFooterAd";
import ToolMastheadAd from "../../../modules/ads/ToolMastheadAd";

interface Props {
	data?: CalendarEvent[];
	save: (values: any) => void;
	hasImkbh: boolean;
}

const Calendar: React.FC<Props> = ({ data, save, hasImkbh }) => {
	return (
		<FlatList
			style={{ flex: 1 }}
			data={data}
			initialNumToRender={15}
			keyExtractor={(item, i) => `${i}`}
			renderItem={({ item }) => (
				<Row {...item} hasImkbh={hasImkbh} save={save} />
			)}
			ListHeaderComponent={ToolMastheadAd}
			ListFooterComponent={ToolFooterAd}
		/>
	);
}

export default Calendar;
