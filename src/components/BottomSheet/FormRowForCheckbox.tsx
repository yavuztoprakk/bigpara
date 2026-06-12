import React from "react";
import { View, StyleSheet } from "react-native";
import SwitchField from "../Forms/SwitchField";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useTheme } from "../../theme/ThemeContext";

interface Props {
	label: string;
	value: boolean;
	onChange: (value: boolean) => void;
}

const FormRowForCheckbox: React.FC<Props> = ({ label, value, onChange }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	return (
		<TouchableOpacity onPress={() => onChange(!value)} style={styles.row}>
			<View style={styles.content}>
				<SwitchField label={label} input={{ onChange, value }} />
			</View>
		</TouchableOpacity>
	);
}


const createStyles = (theme: any) => StyleSheet.create({
	row: {
		paddingHorizontal: 15,
		borderBottomColor: theme.darkBrand,
		borderBottomWidth: 1,
		height: 45,
		justifyContent: "center",
	},
	content: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});

export default FormRowForCheckbox;
