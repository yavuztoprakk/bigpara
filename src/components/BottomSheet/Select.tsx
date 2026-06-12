import React, { useState, useEffect, useRef, useMemo } from "react";
import { FlatList, StyleSheet } from "react-native";
import SelectRow from "./SelectRow";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { FlashList } from "@shopify/flash-list";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

const ROW_HEIGHT = 40;

export interface Option {
	value: string;
	title: string;
}

interface Props {
	options: Option[];
	value: string;
	onChange: (type: string) => void;
	filter?: boolean;
	noPadding?: boolean;
	onDelete?: (index: number) => void;
	showDeleteIcon?: boolean;
	EkonomikTakvim?: boolean;
}

const getItemLayout = (_: any, index: number) => ({
	length: ROW_HEIGHT,
	offset: ROW_HEIGHT * index,
	index,
});

const filterOptions = (options: any[], query: string) =>
	options
		.filter((option) => option.title.startsWith(query.toUpperCase()))
		.slice(0, 10);

const Select: React.FC<Props> = ({ options, value, onChange, filter, onDelete, showDeleteIcon = false, EkonomikTakvim }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);
	const [filteredOptions, setFilteredOptions] = useState(options);
	const [query, setQuery] = useState("");
	const filterInputRef = useRef();

	// Arama sırasında query değiştiğinde filtreleme yap
	useEffect(() => {
		if (filter) {
			setFilteredOptions(
				query.trim().length < 2 && options.length > 1000
					? []
					: filterOptions(options, query)
			);
		} else {
			setFilteredOptions(options);
		}
	}, [options, query]);

	// Bileşen her açıldığında veya options değiştiğinde query ve filteredOptions'u sıfırlayın
	useEffect(() => {
		setQuery("");  // Query'yi temizle
		//setFilteredOptions(options);  // Filtrelenmiş seçenekleri sıfırla
	}, [value, options]);
	// Seçili değerin indeksini güvenli bir şekilde al
	const selectedIndex = useMemo(() => {
		const index = options.map((o) => o.value).indexOf(value);
		return index !== -1 ? index : 0; // Eğer bulunamazsa varsayılan 0 ata
	}, [options, value]);

	const renderItem = ({ item, index }) =>
		EkonomikTakvim ? (
			<SelectRow
				onPress={() => onChange(item)}
				active={
					EkonomikTakvim ? value.includes(item.value) : item.value === value
				}
				option={item}
			/>
		) : (
			<SelectRow
				onPress={onChange}
				active={item.value === value}
				option={item}
				onDelete={onDelete ? () => onDelete(index) : undefined}
				showDeleteIcon={showDeleteIcon}
			/>
		);

	if (EkonomikTakvim) {
		return (
			<>
				{filter && (
					<TouchableOpacity
						style={styles.textInputContainer}
						onPress={() => filterInputRef.current.focus()}
					>
						<Ionicons
							style={styles.icon}
							name="search"
							size={20}
							color={theme.darkBrand}
						/>
						<TextInput
							ref={filterInputRef}
							value={query}
							onChangeText={setQuery}
							style={styles.textInput}
							placeholderTextColor={theme.darkBrand}
							placeholder="Ara..."
							//autoFocus={!!autoFocus}
							autoCapitalize="characters"
							onSubmitEditing={() =>
								filteredOptions.length > 0 && onChange(filteredOptions[0])
							}
						/>
					</TouchableOpacity>
				)}

				<FlatList
					windowSize={10}
					data={filteredOptions}
					keyExtractor={(item) => `${item.value}`}
					getItemLayout={getItemLayout}
					initialNumToRender={20}
					contentContainerStyle={{ paddingBottom: 110 }}
					initialScrollIndex={Math.max(
						0,
						options.map((o) => o.value).indexOf(value as string) - 4
					)}
					renderItem={renderItem}
				/>
			</>
		);
	} else {
		return (
			<>
				{filter && (
					<TouchableOpacity
						style={styles.textInputContainer}
						onPress={() => filterInputRef.current.focus()}
					>
						<Ionicons
							style={styles.icon}
							name="search"
							size={20}
							color={theme.darkBrand}
						/>
						<BottomSheetTextInput
							ref={filterInputRef}
							value={query}
							onChangeText={(text: any) => {
								setQuery(text);
							}}
							style={styles.textInput}
							placeholderTextColor={theme.darkBrand}
							placeholder="Ara..."
							autoCorrect={false}
							autoCapitalize="characters"
						/>
					</TouchableOpacity>
				)}

				<FlashList
					data={filteredOptions}
					keyExtractor={(item) => `${item.value}`}
					contentContainerStyle={{ paddingBottom: 110 }}
					initialScrollIndex={Math.min(filteredOptions.length - 1, selectedIndex)}

					renderItem={renderItem}
					extraData={filteredOptions}
					estimatedItemSize={50}
					initialNumToRender={15}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews={true}
					maintainVisibleContentPosition={{
						minIndexForVisible: 0,
						autoscrollToTopThreshold: 10,
					}}
					overrideItemLayout={(layout, item) => {
						layout.size = 50;
					}}
				/>
			</>
		);
	}
};

const createStyles = (theme: any) => StyleSheet.create({
	textInput: {
		backgroundColor: "white",
		flex: 1,
		color: "black",
		paddingLeft: 30,
		borderRadius: 5,
	},
	textInputContainer: {
		height: 45,
		padding: 10,
		paddingBottom: 0,
	},
	icon: {
		position: "absolute",
		left: 20,
		top: "50%",
		marginTop: -1,
		zIndex: 2,
	},
});

export default Select;
