import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import SearchBar from "./SearchBar";
import Header from "./Header";

const DEFAULT_TINT_COLOR = Platform.OS === "ios" ? "#007AFF" : "white";

const SearchLayout = ({
	debounce = 500,
	headerBackgroundColor = "#fff",
	headerTintColor = DEFAULT_TINT_COLOR,
	cancelButtonText,
	onSubmit,
	onChangeQuery,
	searchInputPlaceholderTextColor,
	searchInputTextColor,
	searchInputSelectionColor,
	searchInputUnderlineColorAndroid,
	searchInputTintColor,
	renderResults,
	children,
}) => {
	const [query, setQuery] = useState("");

	const handleSubmit = (q) => {
		onSubmit && onSubmit(q);
	};

	const handleChangeQuery = (q) => {
		onChangeQuery && onChangeQuery(q);
		setQuery(q);
	};

	return (
		<View style={styles.container}>
			<Header
				backgroundColor={headerBackgroundColor}
				tintColor={headerTintColor}
				backButton={Platform.OS === "android"}
			>
				<SearchBar
					cancelButtonText={Platform.OS === "ios" ? cancelButtonText : null}
					onChangeQuery={handleChangeQuery}
					onSubmit={handleSubmit}
					placeholderTextColor={searchInputPlaceholderTextColor}
					textColor={searchInputTextColor}
					selectionColor={searchInputSelectionColor}
					underlineColorAndroid={
						searchInputUnderlineColorAndroid || headerBackgroundColor
					}
					tintColor={searchInputTintColor || headerTintColor}
				/>
			</Header>

			{renderResults ? renderResults(query) : children}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default SearchLayout;
