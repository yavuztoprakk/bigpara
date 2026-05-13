import React from "react";
import { CalendarEvent } from "../modules/list";
import countryCodes from "../modules/countryCodes";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import BoldText from "../../../components/BoldText";
import Text from "../../../components/Text";
import Flag from "react-native-flags";
import { Ionicons } from "@expo/vector-icons";
import flashMessage from "../../../modules/flashMessage";
import { useTheme } from "../../../theme/ThemeContext";

const MONTH_NAMES_TR = [
	"Oca", "Şub", "Mar", "Nis", "May", "Haz",
	"Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
] as const;

// "2026-05-13" + "2026-05-13T02:00:00.000Z" → "13 May 2026 · 05:00"
function formatEventDateTime(day: string, time: string): string {
	const iso = time && time.includes("T") ? time : `${day || ""}T00:00:00.000Z`;
	const d = new Date(iso);
	if (isNaN(d.getTime())) return `${day || ""} ${time || ""}`.trim();
	const dd = d.getDate().toString().padStart(2, "0");
	const mon = MONTH_NAMES_TR[d.getMonth()];
	const yy = d.getFullYear();
	const hh = d.getHours().toString().padStart(2, "0");
	const mi = d.getMinutes().toString().padStart(2, "0");
	return `${dd} ${mon} ${yy} · ${hh}:${mi}`;
}

const Row: React.FC<
	CalendarEvent & { save: (values: any) => void; hasImkbh: boolean }
> = ({ save, hasImkbh, ...event }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	const formattedDateTime = formatEventDateTime(event.day, event.time);
	return (
		<View style={styles.container}>
			<View style={styles.flag}>
				<Flag code={countryCodes[event.currency]} type="flat" size={24} />
				<View style={{ flex: 1, flexDirection: "row" }}>
					{Array.from(Array(event.importance).keys()).map((i) => (
						<Ionicons
							key={i}
							name="star"
							color={theme.primaryText}
							size={10}
						/>
					))}
				</View>
			</View>
			<View style={styles.header}>
				<BoldText style={styles.title}>
					{event.provider_event_title}
				</BoldText>
				<Text style={styles.subtitle}>
					{formattedDateTime} · {event.country}
				</Text>
			</View>
			<TouchableOpacity
				style={styles.alarm}
				onPress={() =>
					hasImkbh
						? save({
							source: "calendar",
							type: event.provider_event_id,
							title: event.provider_event_title,
						})
						: flashMessage({
							duration: 10000,
							type: "danger",
							message:
								"Alarm oluşturabilmek için anlık lisans gereklidir.",
						})
				}
			>
				<Ionicons
					name="notifications"
					size={22}
					color={theme.primaryText}
				/>
			</TouchableOpacity>

			<View style={styles.metricsContainer}>
				<View style={styles.metricsRow}>
					<View style={styles.metricsCol}>
						<BoldText style={styles.metricsValue}>
							{event.actual ? event.actual : "-"}
						</BoldText>
						<Text style={styles.metricsLabel}>Açıklanan</Text>
					</View>
					<View style={styles.metricsCol}>
						<BoldText style={styles.metricsValue}>
							{event.forecast === null ? "-" : event.forecast}
						</BoldText>
						<Text style={styles.metricsLabel}>Beklenti</Text>
					</View>
					<View style={styles.metricsCol}>
						<BoldText style={styles.metricsValue}>
							{event.previous === null ? "-" : event.previous}
						</BoldText>
						<Text style={styles.metricsLabel}>Önceki</Text>
					</View>
				</View>
			</View>
		</View>
	);
}


const createStyles = (theme: any) => StyleSheet.create({
	container: {
		backgroundColor: theme.darkestBrand,
		margin: 10,
		borderRadius: 4,
	},
	flag: {
		position: "absolute",
		left: 10,
		top: 8,
	},
	header: {
		padding: 10,
		paddingLeft: 45,
		paddingRight: 45,
	},
	alarm: {
		position: "absolute",
		right: 0,
		padding: 10,
	},
	title: {
		color: theme.white,
	},
	subtitle: {
		color: theme.primaryText,
		fontSize: 12,
	},
	metricsContainer: {
		height: 50,
		paddingTop: Platform.OS === "ios" ? 7 : 4,
		borderTopWidth: 1,
		borderTopColor: theme.darkBrand,
	},
	metricsRow: {
		flex: 1,
		flexDirection: "row",
	},
	metricsCol: {
		width: "33.33%",
	},
	metricsValue: {
		textAlign: "center",
		color: theme.white,
	},
	metricsLabel: {
		textAlign: "center",
		color: theme.primaryText,
		fontSize: 12,
	},
});

export default Row;
