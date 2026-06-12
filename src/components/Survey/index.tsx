import React from "react";
import { useDispatch } from "react-redux";
import { close } from "../../modules/bottomSheet";
import { submitSurvey as submitSurveyEmoji } from "../../modules/survey";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import BottomSheetLayer from "../BottomSheet/BottomSheetLayer";
import BoldText from "../BoldText";
import { useTheme } from "../../theme/ThemeContext";
import { submitSurvey } from "../../screens/Auth/modules/preferences";

const Survey: React.FC<{ open: boolean }> = ({ open }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const dispatch = useDispatch();

	const handleSurveySubmit = (emoji: string) => {
		dispatch(submitSurveyEmoji(emoji));
		dispatch(submitSurvey())
		dispatch(close());
	};
	return (
		<BottomSheetLayer
			title="Beklenti anketi"
			open={open}
			onCancel={() => dispatch(close())}
			contentHeight={250}
		>
			<View style={styles.container}>
				<View style={styles.emojis}>
					{["😢", "🙁", "😐", "🙂", "😀"].map((emoji) => (
						<TouchableOpacity
							key={emoji}
							onPress={() => handleSurveySubmit(emoji)}
							style={styles.emojiButton}
						>
							<BoldText style={styles.emoji}>{emoji}</BoldText>
						</TouchableOpacity>
					))}
				</View>
				<BoldText style={styles.label}>
					Bugün nasıl bir piyasa bekliyorsunuz?
				</BoldText>
			</View>
		</BottomSheetLayer>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		paddingTop: 30,
	},
	label: {
		color: theme.primaryText,
		fontSize: 16,
		marginHorizontal: 25,
		textAlign: "center",
	},
	emojis: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 35,
	},
	emojiButton: {
		marginBottom: 15,
		width: "20%",
	},
	emoji: {
		textAlign: "center",
		fontSize: 40,
	},
});

export default Survey;
