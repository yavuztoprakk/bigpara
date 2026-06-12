import React from "react";
import { View } from "react-native";
import BottomSheetComponent from "../../components/BottomSheet/BottomSheet";

const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<View style={{ flex: 1, zIndex: 999 }}>
			{children}
			<BottomSheetComponent />
		</View>
	);
}

export default BottomSheetProvider;
