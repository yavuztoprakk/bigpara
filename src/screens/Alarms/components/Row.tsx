import React, { useRef } from "react";
import { Alarm } from "../modules/list";
import {
	View,
	StyleSheet,
	TouchableWithoutFeedback,
	TouchableOpacity,
} from "react-native";
import BoldText from "../../../components/BoldText";
import Text from "../../../components/Text";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { useTheme } from "../../../theme/ThemeContext";

const titleFormatters = {
	price: "Fiyat Alarmı",
	news: "Haber Alarmı",
	calendar: "Ekonomik Takvim Alarmı",
};

const priceOperatorLabels = (value: string) => ({
	gt: `son fiyatı ${value} üzerine çıkınca`,
	lt: `son fiyatı ${value} altına inince`,
	p_gt: `gün içi değişimi +%${value} üzerine çıkınca`,
	p_lt: `gün içi değişimi -%${value} altına inince`,
});

const subtitleFormatters = {
	price: (alarm: any) =>
		`${alarm.params["code"]} ${priceOperatorLabels(alarm.params.value)[alarm.params.operator]
		}`,
	news: (alarm: any) =>
		(alarm.params.query === ""
			? "Tüm "
			: `"${alarm.params.query}" içeren `) +
		(alarm.params.code === ""
			? "haberler"
			: `${alarm.params.code} haberleri`),
	calendar: (alarm: any) => alarm.params.title,
};

type Props = Alarm & {
	onDelete: (alarm: Alarm) => void;
};

const Row: React.FC<Props> = ({ onDelete, ...alarm }) => {
	const ref = useRef<any>();
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const onPress = () => ref.current.openRight();

	const renderRightSwipeMenu = (progress: any) => (
		<View style={styles.swipeMenuContainer}>
			<React.Fragment>
				<TouchableOpacity
					onPress={() => onDelete(alarm)}
					style={styles.swipeMenuButton}
				>
					<BoldText style={styles.swipeMenuLabel}>SİL</BoldText>
				</TouchableOpacity>
			</React.Fragment>
		</View>
	);

	return (
		<Swipeable ref={ref} renderRightActions={renderRightSwipeMenu}>
			<TouchableWithoutFeedback onPress={onPress}>
				<View style={styles.container}>
					<BoldText style={styles.title}>
						{titleFormatters[alarm.source]}
					</BoldText>
					<Text style={styles.subtitle}>
						{subtitleFormatters[alarm.source](alarm)}
					</Text>
				</View>
			</TouchableWithoutFeedback>
		</Swipeable>
	);
};


const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: theme.darkBrand,
		backgroundColor: theme.darkerBrand,
	},
	title: {
		color: theme.white,
		marginBottom: 3,
	},
	subtitle: {
		color: theme.primaryText,
	},
	swipeMenuContainer: {
		justifyContent: "flex-end",
		flexDirection: "row",
		width: 60,
	},
	swipeMenuButton: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: theme.red,
	},
	swipeMenuLabel: {
		fontSize: 13,
		textAlign: "center",
	},
});

export default Row;
