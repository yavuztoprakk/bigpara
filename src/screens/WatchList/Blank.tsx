import React, { useMemo } from "react";
import { Alert, StyleSheet, View } from "react-native";
import BoldText from "../../components/BoldText";
import Text from "../../components/Text";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../theme/ThemeContext";

interface Props {
	onPressEdit: Function;
	onPressRemove: Function;
	canRemove: boolean;
}

const Blank: React.FC<Props> = ({ onPressEdit, onPressRemove, canRemove }) => {
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);

	const handleRemove = () => {
		Alert.alert(
			"İzleme Listesi",
			"Silmek istediğinize emin misiniz?",
			[
				{
					text: "Evet",
					onPress: () => {
						if (typeof onPressRemove === "function") {
							onPressRemove();
						}
					},
				},
				{
					text: "Vazgeç",
					style: "cancel",
				},
			],
			{ cancelable: true }
		);
	};

	return (
		<View style={styles.container}>
			<View style={[styles.iconCircle, { backgroundColor: theme.active + "15" }]}>
				<Ionicons name="telescope-outline" size={32} color={theme.active} />
			</View>

			<BoldText style={[styles.title, { color: theme.primaryText }]}>
				Liste Boş
			</BoldText>
			<Text style={[styles.subtitle, { color: theme.gray }]}>
				Takip etmek istediğiniz sembolleri ekleyerek{"\n"}bu listeyi kişiselleştirin.
			</Text>

			<TouchableOpacity
				onPress={() => onPressEdit()}
				activeOpacity={0.7}
				style={[styles.editButton, { backgroundColor: theme.active }]}
			>
				<Ionicons name="add-circle-outline" size={18} color="#fff" />
				<BoldText style={styles.editButtonText}>Sembol Ekle</BoldText>
			</TouchableOpacity>

			{canRemove && (
				<TouchableOpacity
					onPress={handleRemove}
					activeOpacity={0.7}
					style={[styles.removeButton, { borderColor: theme.red + "40" }]}
				>
					<Ionicons name="trash-outline" size={15} color={theme.red} />
					<Text style={[styles.removeButtonText, { color: theme.red }]}>Listeyi Sil</Text>
				</TouchableOpacity>
			)}
		</View>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	iconCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
	},
	title: {
		fontSize: 18,
		marginBottom: 6,
	},
	subtitle: {
		fontSize: 13,
		textAlign: "center",
		lineHeight: 19,
		marginBottom: 28,
	},
	editButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 24,
		borderRadius: 10,
	},
	editButtonText: {
		color: "#fff",
		fontSize: 14,
	},
	removeButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 5,
		marginTop: 14,
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
	},
	removeButtonText: {
		fontSize: 13,
	},
});

export default Blank;
