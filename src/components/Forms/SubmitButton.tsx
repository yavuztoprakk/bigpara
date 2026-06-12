import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Button } from "react-native-paper";
import { View } from "react-native";
import { useTheme } from "../../theme/ThemeContext";

interface Props {
	label: string;
	onPress: () => void;
	loading?: boolean;
	disabled?: boolean;
	margin?: any;
	color?: string;
}

const SubmitButton: React.FC<Props> = ({
	disabled,
	loading,
	label,
	onPress,
	margin,
	color,
}) => {
	const { theme } = useTheme();

	return (
		<View pointerEvents={loading ? "none" : "auto"}>
			<TouchableOpacity disabled={disabled} onPress={onPress}>
				<Button
					loading={loading}
					buttonColor={color || theme.portfolio}
					mode="contained"
					style={[
						{ padding: 5, borderRadius: 4 },
						margin && { marginHorizontal: 15, marginTop: 15 },
						disabled && { opacity: 0.5 },
					]}
				>
					{label}
				</Button>
			</TouchableOpacity>
		</View>
	);
}


export default SubmitButton;
