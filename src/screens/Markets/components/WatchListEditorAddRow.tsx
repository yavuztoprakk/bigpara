import React, { useMemo, useCallback } from "react";
import { TouchableOpacity, View, StyleSheet, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../theme/ThemeContext";
import { update } from "../../WatchList/modules/watchlists";
import flashMessage from "../../../modules/flashMessage";
import { useSelector } from "react-redux";
import { syncWatchlists } from "../../../modules/FintablesClient";
import store from "../../../store";
import { useDispatch } from "react-redux";

interface Props {
	code: string;
	added: boolean;
	onEdit: (code: string) => void;
	onRemove?: () => void;
	dragging?: boolean;
	onDragStart?: any;
}

const WatchListEditorAddRow: React.FC<Props> = ({
	code,
	added,
	onEdit,
	onRemove,
	dragging,
	onDragStart,
}) => {
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);
	const dispatch = useDispatch();
	const selectedCodes = useSelector(
		(state: any) => state.watchLists.lists[state.watchLists.selectedIndex].codes
	);

	const syncWatchlistsHandle = useCallback(async () => {
		try {
			const user = store.getState().auth.user;
			const lists = store.getState().watchLists.lists;
			await syncWatchlists({
				username: user?.username,
				data: lists,
			});
		} catch (error) {
			flashMessage({
				duration: 10000,
				message: "Takip listeniz senkronize edilirken hata oluştu.",
				type: "danger",
			});
		}
	}, []);

	const handleAdd = useCallback((newCode: string) => {
		const cloned = [...selectedCodes, newCode];
		dispatch(update(cloned));
		syncWatchlistsHandle();
		flashMessage({
			type: "success",
			message: `${newCode} listenize eklendi.`,
			duration: 600,
		});
	}, [selectedCodes, dispatch, syncWatchlistsHandle]);

	const handleRemove = useCallback((newCode: string) => {
		const currentIndex = selectedCodes.indexOf(code);
		if (currentIndex !== -1) {
			const updatedCodes = [...selectedCodes];
			updatedCodes.splice(currentIndex, 1);
			dispatch(update(updatedCodes));
			syncWatchlistsHandle();
			flashMessage({
				type: "success",
				message: `${code.startsWith("separator-") ? "Ayraç" : code} listenizden çıkartıldı.`,
				duration: 600,
			});
		}
	}, [selectedCodes, code, dispatch, syncWatchlistsHandle]);

	const handleToggle = useCallback(() => {
		added ? handleRemove(code) : handleAdd(code);
	}, [added, code, handleAdd, handleRemove]);

	const isSeparator = code.startsWith("separator-");

	return (
		<View style={[styles.container, dragging && styles.draggingContainer]}>
			{onDragStart && (
				<TouchableOpacity
					style={styles.dragButton}
					onPressIn={onDragStart}
					delayLongPress={250}
				>
					<Ionicons name="reorder-three" color={theme.gray} size={24} />
				</TouchableOpacity>
			)}

			<View style={styles.titleContainer}>
				{isSeparator ? (
					<View style={styles.separatorRow}>
						<View style={styles.separatorLine} />
						<Ionicons name="remove-outline" size={14} color={theme.gray} />
						<View style={styles.separatorLine} />
					</View>
				) : (
					<TextInput
						autoCapitalize={"characters"}
						defaultValue={code}
						style={styles.titleInput}
						onEndEditing={(e) => {
							const val = e.nativeEvent.text;
							if (val !== code) {
								onEdit(e.nativeEvent.text.toUpperCase());
							}
						}}
						editable={added}
						placeholderTextColor={theme.gray + "60"}
					/>
				)}
			</View>

			<TouchableOpacity
				onPress={handleToggle}
				style={styles.icon}
				activeOpacity={0.6}
			>
				<View
					style={[
						styles.iconWrapper,
						added ? styles.removeIcon : styles.addIcon,
					]}
				>
					<Ionicons name={added ? "close" : "add"} color="white" size={16} />
				</View>
			</TouchableOpacity>
		</View>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		container: {
			flexDirection: "row",
			alignItems: "center",
			backgroundColor: theme.darkestBrand,
			marginHorizontal: 12,
			marginVertical: 3,
			borderRadius: 10,
			height: 52,
			paddingRight: 4,
		},
		titleContainer: {
			flex: 1,
			justifyContent: "center",
		},
		draggingContainer: {
			backgroundColor: theme.darkBrand,
			elevation: 8,
			shadowColor: "#000",
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: 0.3,
			shadowRadius: 8,
		},
		titleInput: {
			paddingLeft: 4,
			color: theme.white,
			fontSize: 15,
			fontFamily: theme.boldFont,
			letterSpacing: 0.3,
		},
		separatorRow: {
			flexDirection: "row",
			alignItems: "center",
			gap: 6,
			paddingHorizontal: 4,
		},
		separatorLine: {
			flex: 1,
			height: StyleSheet.hairlineWidth,
			backgroundColor: theme.gray + "40",
		},
		icon: {
			justifyContent: "center",
			alignItems: "center",
			paddingHorizontal: 12,
		},
		iconWrapper: {
			width: 24,
			height: 24,
			justifyContent: "center",
			alignItems: "center",
			borderRadius: 12,
		},
		removeIcon: {
			backgroundColor: theme.red + "CC",
		},
		addIcon: {
			backgroundColor: theme.green,
		},
		dragButton: {
			paddingRight: 8,
			paddingLeft: 14,
			justifyContent: "center",
			alignItems: "center",
			height: "100%",
		},
	});

export default WatchListEditorAddRow;
