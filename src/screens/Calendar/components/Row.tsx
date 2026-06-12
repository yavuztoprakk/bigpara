import React, { useMemo } from "react";
import { CalendarEvent } from "../modules/list";
import countryCodes from "../modules/countryCodes";
import { View, StyleSheet, Platform, TouchableOpacity } from "react-native";
import BoldText from "../../../components/BoldText";
import Text from "../../../components/Text";
// @ts-ignore - react-native-flags has no types
import Flag from "react-native-flags";
import { Ionicons } from "@expo/vector-icons";
import flashMessage from "../../../modules/flashMessage";
import { useTheme } from "../../../theme/ThemeContext";

const ACCENT = "#F07400";

const MONTH_NAMES_TR = [
	"Oca", "Şub", "Mar", "Nis", "May", "Haz",
	"Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
] as const;

type ParsedDateTime = {
	date: string;   // "01 Haz 2026"
	time: string;   // "05:00"
	valid: boolean;
};

function parseEventDateTime(day: string, time: string): ParsedDateTime {
	const iso = time && time.includes("T") ? time : `${day || ""}T00:00:00.000Z`;
	const d = new Date(iso);
	if (isNaN(d.getTime())) {
		return { date: `${day || ""}`.trim(), time: `${time || ""}`.trim(), valid: false };
	}
	const dd = d.getDate().toString().padStart(2, "0");
	const mon = MONTH_NAMES_TR[d.getMonth()];
	const yy = d.getFullYear();
	const hh = d.getHours().toString().padStart(2, "0");
	const mi = d.getMinutes().toString().padStart(2, "0");
	return { date: `${dd} ${mon} ${yy}`, time: `${hh}:${mi}`, valid: true };
}

// "26.95", "21.5%", "-1.2" gibi string/number değerleri numerik karşılaştırma için parse et.
function toNumber(value: any): number | null {
	if (value === null || value === undefined || value === "") return null;
	if (typeof value === "number") return Number.isFinite(value) ? value : null;
	const cleaned = String(value).replace(/[^\d.\-]/g, "");
	const n = parseFloat(cleaned);
	return Number.isFinite(n) ? n : null;
}

const Row: React.FC<
	CalendarEvent & { save: (values: any) => void; hasImkbh: boolean }
> = ({ save, hasImkbh, ...event }) => {
	const { theme } = useTheme();
	const isDark = theme.themeDetail === "dark";
	const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

	const dt = useMemo(() => parseEventDateTime(event.day, event.time), [event.day, event.time]);

	// Önem seviyesine göre dolu yıldız rengi (1: gri, 2: sarı, 3: kırmızı).
	const filledStarColor =
		event.importance >= 3
			? theme.red
			: event.importance === 2
				? "#F0B400"
				: isDark
					? "rgba(255,255,255,0.45)"
					: "rgba(0,0,0,0.40)";
	const emptyStarColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
	const importanceCount = Math.max(0, Math.min(3, event.importance || 0));

	// Açıklanan değer beklentiye göre yeşil (üstü) / kırmızı (altı) / nötr.
	const actualNum = toNumber(event.actual);
	const forecastNum = toNumber(event.forecast);
	const surpriseColor =
		actualNum !== null && forecastNum !== null
			? actualNum > forecastNum
				? theme.green
				: actualNum < forecastNum
					? theme.red
					: theme.white
			: theme.white;

	return (
		<View style={styles.cardWrap}>
			<View style={styles.card}>
				{/* Üst bölüm: bayrak · başlık · alarm */}
				<View style={styles.header}>
					<View style={styles.flagWrap}>
						{event.currency && (countryCodes as any)[event.currency] ? (
							<Flag
								code={(countryCodes as any)[event.currency]}
								type="flat"
								size={24}
							/>
						) : null}
					</View>

					<View style={styles.headerCenter}>
						<BoldText allowFontScaling={false} style={styles.title} numberOfLines={2}>
							{event.provider_event_title}
						</BoldText>
						<View style={styles.metaRow}>
							{/* Önem — 3 yıldız, dolular renk koduyla (1:gri, 2:sarı, 3:kırmızı) */}
							<View style={styles.starsWrap}>
								{[1, 2, 3].map((idx) => {
									const filled = idx <= importanceCount;
									return (
										<Ionicons
											key={idx}
											name={filled ? "star" : "star-outline"}
											size={12}
											color={filled ? filledStarColor : emptyStarColor}
											style={idx > 1 ? styles.starGap : undefined}
										/>
									);
								})}
							</View>

							<View style={styles.timePill}>
								<Ionicons name="time-outline" size={11} color={ACCENT} style={{ marginRight: 4 }} />
								<Text allowFontScaling={false} style={styles.timeText}>{dt.time}</Text>
							</View>

							<Text allowFontScaling={false} style={styles.dateText} numberOfLines={1}>
								{dt.date} · {event.country}
							</Text>
						</View>
					</View>

					<TouchableOpacity
						style={styles.alarmBtn}
						activeOpacity={0.7}
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
									message: "Alarm oluşturabilmek için anlık lisans gereklidir.",
								})
						}
					>
						<Ionicons name="notifications-outline" size={18} color={ACCENT} />
					</TouchableOpacity>
				</View>

				{/* Alt bölüm: 3 metric, ortada vurgu */}
				<View style={styles.metricsContainer}>
					<View style={styles.metricsCol}>
						<BoldText allowFontScaling={false} style={[styles.metricsValue, { color: surpriseColor }]}>
							{event.actual !== null && event.actual !== undefined && event.actual !== ""
								? String(event.actual)
								: "—"}
						</BoldText>
						<Text allowFontScaling={false} style={styles.metricsLabel}>Açıklanan</Text>
					</View>

					<View style={styles.metricsDivider} />

					<View style={styles.metricsCol}>
						<BoldText allowFontScaling={false} style={styles.metricsValue}>
							{event.forecast === null || event.forecast === undefined ? "—" : String(event.forecast)}
						</BoldText>
						<Text allowFontScaling={false} style={styles.metricsLabel}>Beklenti</Text>
					</View>

					<View style={styles.metricsDivider} />

					<View style={styles.metricsCol}>
						<BoldText allowFontScaling={false} style={styles.metricsValue}>
							{event.previous === null || event.previous === undefined ? "—" : String(event.previous)}
						</BoldText>
						<Text allowFontScaling={false} style={styles.metricsLabel}>Önceki</Text>
					</View>
				</View>
			</View>
		</View>
	);
};

const createStyles = (theme: any, isDark: boolean) => {
	const cardBg = isDark ? "#1A1F26" : "#FFFFFF";
	const cardBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
	const muted = isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)";
	const subtle = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.40)";
	const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
	const timePillBg = isDark ? "rgba(240,116,0,0.12)" : "rgba(240,116,0,0.10)";

	return StyleSheet.create({
		cardWrap: {
			paddingHorizontal: 12,
			paddingTop: 8,
		},
		card: {
			backgroundColor: cardBg,
			borderRadius: 14,
			borderWidth: 1,
			borderColor: cardBorder,
			overflow: "hidden",
			...Platform.select({
				ios: {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: isDark ? 0.25 : 0.04,
					shadowRadius: 6,
				},
				android: { elevation: 2 },
			}),
		},
		header: {
			flexDirection: "row",
			alignItems: "flex-start",
			padding: 12,
		},
		flagWrap: {
			width: 32,
			height: 32,
			borderRadius: 16,
			overflow: "hidden",
			alignItems: "center",
			justifyContent: "center",
			marginRight: 10,
			marginTop: 2,
			backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
		},
		headerCenter: {
			flex: 1,
		},
		title: {
			color: theme.white,
			fontSize: 14.5,
			lineHeight: 19,
			marginBottom: 6,
		},
		metaRow: {
			flexDirection: "row",
			alignItems: "center",
			flexWrap: "wrap",
		},
		starsWrap: {
			flexDirection: "row",
			alignItems: "center",
			marginRight: 10,
		},
		starGap: {
			marginLeft: 2,
		},
		timePill: {
			flexDirection: "row",
			alignItems: "center",
			paddingHorizontal: 8,
			paddingVertical: 3,
			borderRadius: 10,
			backgroundColor: timePillBg,
			marginRight: 8,
		},
		timeText: {
			color: ACCENT,
			fontSize: 11,
			fontWeight: "600" as const,
			letterSpacing: 0.3,
		},
		dateText: {
			color: subtle,
			fontSize: 11.5,
			flexShrink: 1,
		},
		alarmBtn: {
			width: 34,
			height: 34,
			borderRadius: 17,
			alignItems: "center",
			justifyContent: "center",
			marginLeft: 8,
			backgroundColor: isDark ? "rgba(240,116,0,0.10)" : "rgba(240,116,0,0.08)",
		},
		metricsContainer: {
			flexDirection: "row",
			borderTopWidth: 1,
			borderTopColor: divider,
			paddingVertical: 10,
		},
		metricsCol: {
			flex: 1,
			alignItems: "center",
			justifyContent: "center",
		},
		metricsDivider: {
			width: StyleSheet.hairlineWidth,
			backgroundColor: divider,
			marginVertical: 4,
		},
		metricsValue: {
			color: theme.white,
			fontSize: 16,
			lineHeight: 20,
			marginBottom: 3,
		},
		metricsLabel: {
			color: muted,
			fontSize: 11,
			letterSpacing: 0.3,
		},
	});
};

export default Row;
