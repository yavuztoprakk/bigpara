import React, { useEffect, useState } from "react";
import { View, Platform, StyleSheet, Keyboard } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { FontAwesome } from "@expo/vector-icons";
import HeaderSwitcherResultsRow from "./HeaderSwitcherResultsRow";
import HeaderSwitcherResultsMessage from "./HeaderSwitcherResultsMessage";
import { request } from "../modules/IdealClient";
import symbolSend from "../modules/IdealClient/request/symbolSend";
import { useTheme } from "../theme/ThemeContext";
// import store from "../store";

export type HeaderSwitcherSelectHandler = (code: string) => void;

interface Props {
	onSelect: (code: string) => void;
	data: string[];
	data1: any;
	query: string;
	position: string;
	onQueryChange: (newQuery: string) => void;
}

const HeaderSwitcherResults: React.FC<Props> = ({
	onSelect,
	data,
	data1,
	query,
	position,
	onQueryChange,
}) => {

	const { theme } = useTheme();
	const styles = createStyles(theme);
	const [filteredData, setFilteredData] = useState<string[]>([]);

	// const user = store.getState().auth?.user;
	// const [test, setTest] = useState([])
	// const mkkLicenceControl = user.licences.indexOf("MKK") > -1;


	// useEffect(() => {
	// 	if (data1.length < 1 && query.length > 0) {
	// 		if (wssControl === "connect") {
	// 			request(symbolTest);
	// 		}

	// 	}
	// }, [data1, query, wssControl]);

	useEffect(() => {
		if (data1.length > 0) {
			if (data1 && data1 !== undefined || data1 !== null) {
				setFilteredData(data1
					.filter((code: string) => {
						// MKK lisansı olmayan kullanıcılar için TKSYBNCI ve TKSYERLI'yi filtrele
						if ((code.includes('TKSYBNCI') || code.includes('TKSYERLI'))) {
							return false;
						}
						return code?.toUpperCase().includes(query?.toUpperCase());
					})
					.sort((a: string, b: string) => parseInt(a?.split("=")[1]) - parseInt(b?.split("=")[1]))
					.map((code: string) => code?.split("--")[0].replace("=", "  "))
				);
			}
		}
	}, [query, data1]);

	const handleSelect = (code: string) => {
		if (code) {
			request(symbolSend, " ", code);
		}
		setTimeout(() => {
			onQueryChange("");
			onSelect(code);
			Keyboard.dismiss();
		}, 150);
	};

	const renderItem = ({ item, index }) => (
		<HeaderSwitcherResultsRow
			isLast={data.length <= index + 1}
			code={data1.length <= 0 ? item : item.slice(0, item.length - 1)}
			onSelect={handleSelect}
		/>
	);

	const left =
		position === "left" || (position !== "right" && Platform.OS !== "ios");
	const right = position === "right";

	const dynamicStyles = StyleSheet.create({
		container: {
			alignSelf: right ? "flex-end" : left ? "flex-start" : "center",
			left: left ? 15 : "auto",
			right: right ? 15 : "auto",
			...(position === "center" && {
				left: "5%",
				right: "5%",
			}),
		},
		caret: {
			alignSelf: right ? "flex-end" : left ? "flex-start" : "center",
			left: left ? 10 : "auto",
			right: right ? 10 : "auto",
			...(position === "center" && {
				left: "45%",
				right: "auto",
			}),
		},
	});

	if (query.length < 1) {
		return null
	}

	return (
		<View style={[styles.container, dynamicStyles.container]}>
			<FontAwesome
				name="caret-up"
				color={theme.separator}
				size={30}
				style={[styles.caret, dynamicStyles.caret]}
			/>

			{query && query?.length < 2 && (
				<HeaderSwitcherResultsMessage message="Sembol ara" />
			)}
			<FlatList
				data={data1.length <= 0 ? data : filteredData}
				keyboardShouldPersistTaps="always"
				renderItem={renderItem}
				keyExtractor={(item) =>
					data1.length <= 0 ? item : item.split("|")[0]
				}
			/>
		</View>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		position: "absolute",
		width: "93%",
		marginTop: "3%",
		maxHeight: 230,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: theme.separator,
		backgroundColor: theme.darkerBrand,
	},
	caret: {
		position: "absolute",
		top: -22,
	},
});

export default HeaderSwitcherResults;
