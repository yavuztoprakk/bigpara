import React, { useRef, useEffect, useState, useMemo } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Alert,
} from "react-native";
import DraggableFlatList, { RenderItemParams } from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";

import BoldText from "../../../components/BoldText";
import Text from "../../../components/Text";
import flashMessage from "../../../modules/flashMessage";
import { WatchList } from "../../WatchList/modules/watchlists";
import { syncWatchlists } from "../../../modules/FintablesClient";
import store from "../../../store";
import { useTheme } from "../../../theme/ThemeContext";
import { useSelector } from "react-redux";
import WatchListEditorAddRow from "./WatchListEditorAddRow";

interface Props {
	navigation: any;
	selectedCodes: string[];
	update: (codes: string[]) => void;
	watchList?: WatchList;
}

const WatchListEditor: React.FC<Props> = ({
	navigation,
	selectedCodes,
	watchList,
	update,
}) => {
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);
	const listRef = useRef<DraggableFlatList<string>>(null);

	const [localCodes, setLocalCodes] = useState([...selectedCodes]);
	const oldSelectedCodesRef = useRef([...selectedCodes]);

	const lists = useSelector((state: any) => state.watchLists?.lists);

	useEffect(() => {
		if (
			watchList &&
			oldSelectedCodesRef.current.join("|") !== localCodes.join("|")
		) {
			const user = store.getState().auth?.user;
			(async () => {
				try {
					await syncWatchlists({ username: user.username, data: lists });
					flashMessage({
						duration: 3000,
						message: "Takip listeniz başarıyla senkronize edildi.",
						type: "success",
					});
				} catch {
					flashMessage({
						duration: 10000,
						message: "Takip listeniz senkronize edilirken hata oluştu.",
						type: "danger",
					});
				}
			})();
			oldSelectedCodesRef.current = [...localCodes];
		}
	}, [localCodes, lists, watchList]);

	const handleUpdate = async () => {
		const user = store.getState().auth?.user;
		const lists = store.getState().watchLists.lists;
		await syncWatchlists({ username: user.username, data: lists });
	};

	const renderItem = (
		{ item, drag, isActive }: RenderItemParams<string>,
		index: number
	) => (
		<WatchListEditorAddRow
			code={item}
			added
			onEdit={(newCode: string) => {
				const clone = [...selectedCodes];
				clone[index] = newCode;
				update(clone);
				handleUpdate();
			}}
			onRemove={() => {
				const doRemove = () => {
					const codes = [...selectedCodes];
					codes.splice(index, 1);
					setLocalCodes(codes);
					update(codes);
				};
				Alert.alert(
					"Emin misiniz?",
					"Listeden kaldırmak istediğinize emin misiniz?",
					[
						{ text: "Vazgeç", style: "cancel" },
						{ text: "OK", onPress: doRemove },
					]
				);
			}}
			dragging={isActive}
			onDragStart={drag}
		/>
	);

	return (
		<View style={{ flex: 1, backgroundColor: theme.darkerBrand }}>
			<View style={styles.buttons}>
				<TouchableOpacity
					onPress={() =>
						navigation.navigate("WatchListEditorAdd", {
							watchList,
							onAdd: (code: string) => {
								update([...selectedCodes, code]);
								flashMessage({ type: "success", message: `${code} listenize eklendi.`, duration: 600 });
							},
							onRemove: (code: string) => {
								update(selectedCodes.filter((c) => c !== code));
								flashMessage({ type: "success", message: `${code} listenizden çıkartıldı.`, duration: 600 });
							},
						})
					}
					style={[styles.button, styles.symbolButton]}
					activeOpacity={0.7}
				>
					<Ionicons name="add-circle-outline" size={18} color={theme.green} style={{ marginRight: 6 }} />
					<BoldText style={styles.symbolButtonLabel}>Sembol Ekle</BoldText>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						const separatorId = `separator-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
						const newCodes = [...selectedCodes, separatorId];
						setLocalCodes(newCodes);
						update(newCodes);
						setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 500);
					}}
					style={styles.button}
					activeOpacity={0.7}
				>
					<Ionicons name="remove-outline" size={18} color={theme.gray} style={{ marginRight: 6 }} />
					<BoldText style={styles.buttonLabel}>Ayraç Ekle</BoldText>
				</TouchableOpacity>
			</View>

			{selectedCodes.length === 0 && (
				<View style={styles.emptyState}>
					<Ionicons name="list-outline" size={40} color={theme.gray + "60"} />
					<Text style={styles.emptyText}>Listeniz boş. Sembol ekleyerek başlayın.</Text>
				</View>
			)}

			<DraggableFlatList
				ref={listRef}
				data={selectedCodes}
				keyExtractor={(item, index) =>
					item ? `${item}-${index}` : `empty-${index}`
				}
				renderItem={renderItem}
				onDragBegin={() => { }}
				onDragEnd={({ data }) => {
					update(data);
					handleUpdate();
				}}
				autoscrollSpeed={300}
				activationDistance={8}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
				contentContainerStyle={{ paddingBottom: 50, paddingTop: 4 }}
			/>
		</View>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		buttons: {
			paddingVertical: 12,
			paddingHorizontal: 12,
			backgroundColor: theme.darkestBrand,
			flexDirection: "row",
			gap: 10,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: theme.darkBrand,
		},
		button: {
			flex: 1,
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.darkBrand,
			borderRadius: 10,
			paddingVertical: 10,
		},
		symbolButton: {
			flex: 1.3,
			backgroundColor: theme.green + "18",
		},
		symbolButtonLabel: {
			color: theme.green,
			fontSize: 13,
		},
		buttonLabel: {
			color: theme.gray,
			fontSize: 13,
		},
		emptyState: {
			alignItems: "center",
			justifyContent: "center",
			paddingVertical: 40,
			gap: 12,
		},
		emptyText: {
			fontSize: 13,
			color: theme.gray,
		},
	});

export default WatchListEditor;
