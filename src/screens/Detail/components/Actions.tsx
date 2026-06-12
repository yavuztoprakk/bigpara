import React, { useState } from "react";
import { Portal, FAB } from "react-native-paper";
import { useBackHandler } from "@react-native-community/hooks";
import { useTheme } from "../../../theme/ThemeContext";
import { Symbol } from "../../Markets/modules/symbols";
import {
	piteOptions,
	pitOptions,
	levelStatsOptions,
} from "../../DateForm/modules/dateForm";
// import { WHITELABEL } from "../../../modules/IdealClient/constants";
const XDate = require("xdate");

export function getLicenceDateLimitations() {
	const isWeekday = [0, 6].indexOf(new Date().getDay()) === -1 && new Date().getHours() >= 9;
	const canSeeTodaysPiteViop = !isWeekday || new Date().getHours() * 60 + new Date().getMinutes() > 1110;
	return { isWeekday, canSeeTodaysPiteViop };
};

interface Props {
	code: string;
	symbol: Symbol;
	hasPite: boolean;
	isDemo: boolean;
	navigation: any;
}

const Actions: React.FC<Props> = ({
	code,
	symbol,
	hasPite,
	isDemo,
	navigation
}) => {
	const [open, setOpen] = useState(false);
	const { theme } = useTheme();
	const { prefix } = symbol;
	const { canSeeTodaysPiteViop } = getLicenceDateLimitations();

	useBackHandler(() => {
		if (open) {
			setOpen(false);
		}
		return open;
	});

	if (isDemo || (prefix !== "IMKBH" && prefix !== "VIP")) {
		return null;
	}

	const actionStyle = {
		backgroundColor: "white",
		borderRadius: 8,
		paddingHorizontal: 8,
		paddingVertical: 2,
		color: theme.gray,
		marginVertical: -8,
	};

	const actions = [
		prefix === "IMKBH" && {
			icon: "cash-multiple",
			label: "Temettü & Sermaye Arttırımları",
			labelStyle: actionStyle,
			onPress: () => navigation.navigate("DetailCapitalDividend", { code }),
		},
		{
			icon: "table-of-contents",
			label: "Kademe Analizi",
			labelStyle: actionStyle,
			onPress: () => navigation.navigate("DetailLevelStats", {
				code,
				days: "G",
				options: levelStatsOptions,
			}),
		},
		// prefix === "IMKBH" && {
		// 	icon: "cash",
		// 	label: "PGÇ/AKD Analizi",
		// 	labelStyle: actionStyle,
		// 	onPress: () => navigation.navigate("Pgc1", { code }),
		// },
		// prefix === "IMKBH" && {
		// 	icon: "chart-arc",
		// 	label: "Takas",
		// 	labelStyle: actionStyle,
		// 	onPress: () => navigation.navigate("DetailOwnerStats", {
		// 		code,
		// 		days: `custom-single|${new Date().toISOString().split("T")[0]}`,
		// 		options: singleDateOptions,
		// 	}),
		// },
		// prefix === "IMKBH" && {
		// 	icon: "vector-difference",
		// 	label: "Takas Değişimi",
		// 	labelStyle: actionStyle,
		// 	onPress: () => navigation.navigate("DetailCustodyChange", {
		// 		code,
		// 		days: isWeekday ? "day" : "week",
		// 		options: custodyChangeOptions,
		// 	}),
		// },
		prefix === "IMKBH" && {
			icon: "newspaper",
			label: "Haberler",
			labelStyle: actionStyle,
			onPress: () => navigation.navigate("DetailNews", { code }),
		},
		{
			icon: "chart-arc",
			label: "Aracı Kurum Dağılımı",
			labelStyle: actionStyle,
			onPress: () => navigation.navigate("DetailBrokerageStats", {
				code,
				days: (hasPite && prefix === "IMKBH") || (prefix === "VIP" && canSeeTodaysPiteViop)
					? `custom-single|${new XDate().toISOString().split("T")[0]}`
					: `custom-single|${new XDate().addDays(-1).toISOString().split("T")[0]}`,
				options: hasPite && prefix === "IMKBH" ? piteOptions : pitOptions,
			}),
		},
		{
			icon: "chart-gantt",
			label: "Derinlik",
			labelStyle: actionStyle,
			onPress: () =>
				navigation.navigate("DetailOrderBook", {
					code,
				}),
		},
	].filter(Boolean);

	return (
		<Portal>
			<FAB.Group
				visible
				color="white"
				fabStyle={{
					backgroundColor: theme.portfolio,
					borderRadius: 40,
				}}
				//backdropColor={theme.gray}
				style={{
					position: 'absolute',
				}}
				open={open}
				icon="chart-areaspline"
				actions={actions}
				onStateChange={({ open }) => setOpen(open)}
			/>
		</Portal>
	);
};

export default Actions;
