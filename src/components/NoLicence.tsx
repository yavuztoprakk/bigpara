import React from "react";
import { StyleSheet, View } from "react-native";
import BoldText from "./BoldText";
import { useTheme } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const contents = {
	ak: {
		text: "Detaylar için müşteri temsilcinizle görüşebilirsiniz.",
		phone: null,
	},
	info: {
		text: "Detaylar için müşteri temsilcinizle görüşebilirsiniz.",
		phone: null,
	},
	ideal: {
		text: "Sahip olmak için iDeal destek hattına şu numaradan ulaşabilirsiniz:",
		phone: "0212 385 35 35",
	},
	colendi: {
		text: "Sahip olmak için Colendi Menkul destek hattına şu numaradan ulaşabilirsiniz:",
		phone: "0216 599 02 46",
	},
	osmanli: {
		text: "Detaylar için bizimle görüşebilirsiniz.",
		phone: "444 1 730",
	},
};

interface Props {
	licenceTitle?: string;
}

const NoLicence: React.FC<Props> = ({ licenceTitle }) => {
	const { theme } = useTheme(); // Yeni yapı ile theme kullanımı
	const styles = createStyles(theme);

	return (
		<View style={styles.container}>
			<Ionicons name="warning" size={65} color={theme.primaryText} />
			<BoldText style={styles.title}>
				{licenceTitle ? `${licenceTitle} lisansınız` : "Lisansınız"}{" "}
				bulunmamaktadır. {contents["colendi"].text}
			</BoldText>
			{contents["colendi"].phone && (
				<BoldText style={styles.phone}>{contents["colendi"].phone}</BoldText>
			)}
		</View>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		padding: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		textAlign: "center",
		color: theme.primaryText, // theme.primaryText kullanımı
		fontSize: 15,
		marginVertical: 20,
	},
	phone: {
		textAlign: "center",
		color: theme.white,
		fontSize: 17,
	},
});

export default NoLicence;
