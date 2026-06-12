import React, { useState, useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Viewed durumunu depolamak için bir state tanımlıyoruz
const useViewed = (p0: string) => {
	const [viewed, setViewed] = useState({});

	// AsyncStorage'dan veriyi yükleme
	const loadViewed = async () => {
		try {
			const data = await AsyncStorage.getItem("B_COPILOT");
			setViewed(JSON.parse(data) || {});
		} catch (e) {
			console.error("Error loading viewed data:", e);
			setViewed({});
		}
	};

	// Viewed durumunu AsyncStorage'a kaydetme
	const saveViewed = async (newViewed: React.SetStateAction<{}>) => {
		try {
			await AsyncStorage.setItem("B_COPILOT", JSON.stringify(newViewed));
			setViewed(newViewed);
		} catch (e) {
			console.error("Error saving viewed data:", e);
		}
	};

	// Belirli bir öğenin gösterilip gösterilmediğini kontrol etme ve durumu güncelleme
	const canStart = (type: string) => {
		if (viewed[type]) {
			return false;
		} else {
			const newViewed = { ...viewed, [type]: true };
			saveViewed(newViewed);
			return true;
		}
	};

	// Bileşen yüklendiğinde veriyi yükle
	useEffect(() => {
		loadViewed();
	}, []);

	return { viewed, canStart, loadViewed };
};

export default useViewed;
