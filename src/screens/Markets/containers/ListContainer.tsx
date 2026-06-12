import React, { useEffect, useState, useMemo } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";
import { useSelector, shallowEqual } from "react-redux";
import List from "../components/List";
import { selectedListCodesSelector } from "../modules/lists";
import { request } from "../../../modules/IdealClient";
import { columnsSelector, rightSwipeOptions } from "../../Auth/modules/preferences";
import AsyncStorage from "@react-native-async-storage/async-storage";
import topGainers from "../../../modules/IdealClient/request/topGainers";
import topLosers from "../../../modules/IdealClient/request/topLosers";
import topVolume from "../../../modules/IdealClient/request/topVolume";
import xBank from "../../../modules/IdealClient/request/xBank";
import xarku from "../../../modules/IdealClient/request/xarku";
import xGida from "../../../modules/IdealClient/request/xGida";
import xharz from "../../../modules/IdealClient/request/xharz";
import xhold from "../../../modules/IdealClient/request/xhold";
import xk030 from "../../../modules/IdealClient/request/xk030";
import xk050 from "../../../modules/IdealClient/request/xk050";
import xk100 from "../../../modules/IdealClient/request/xk100";
import xktum from "../../../modules/IdealClient/request/xktum";
import xmana from "../../../modules/IdealClient/request/xmana";
import xu050 from "../../../modules/IdealClient/request/xu050";
import xuSin from "../../../modules/IdealClient/request/xuSin";
import xutek from "../../../modules/IdealClient/request/xutek";
import bruttakas from "../../../modules/IdealClient/request/bruttakas";
import devrekesici from "../../../modules/IdealClient/request/devrekesici";
import { useTheme } from "../../../theme/ThemeContext";
import { SEP2 } from "../../../modules/IdealClient/constants";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";

interface Props {
	codes?: string[];
	navigation: any;
	watchlist?: boolean;
	headerAd?: React.ReactNode;
	footerAd?: React.ReactNode;
}

const ListContainer: React.FC<Props> = ({ codes, navigation, watchlist, headerAd, footerAd }) => {
	const { theme } = useTheme();
	const [contentLoader, setContentLoader] = useState(true);


	// Seçilen liste ve ilgili kodları memoize ediyoruz.
	const selectedList = useSelector(
		(state: any) => state.markets.lists.selected,
		shallowEqual
	);
	const codesFromSelector = useSelector(
		(state: any) => selectedListCodesSelector(state),
		shallowEqual
	);
	const codes1 = useMemo(() => codes || codesFromSelector, [codes, codesFromSelector]);

	const columns = useSelector((state: any) => columnsSelector(state), shallowEqual);
	const symbols = useSelector((state: any) => state.symbols, shallowEqual);

	const rightSwipeAction = useSelector((state: any) => state.preferences.rightSwipeAction);
	const rightSwipeOption = useMemo(
		() =>
			rightSwipeAction
				? rightSwipeOptions.find((o) => o.value === rightSwipeAction) || rightSwipeOptions[0]
				: rightSwipeOptions[0],
		[rightSwipeAction]
	);

	const demo = useSelector((state: any) => state.auth.demo);
	const squareOrListValueWatchlist = useSelector(
		(state: any) => state.preferences.butonClickValue.butonClickValue
	);
	const squareOrListValueMarket = useSelector(
		(state: any) => state.preferences.butonClickValueMarket.butonClickValueMarket
	);
	const showFilterBar = useMemo(() => !codes, [codes]);

	// GARAN fiyatını da selector üzerinden alarak store.getState() kullanımını azaltıyoruz.
	// const garanPrice = useSelector((state: any) => state.prices?.GARAN);

	// Eğer seçilen liste "bruttakas" veya "BYF" ise, ilgili sembollerin birleşik string'ini gönderiyoruz.
	useEffect(() => {
		if (codes1 && (selectedList.value === "bruttakas" || selectedList.value === "BYF")) {
			const prefixler = codes1.filter((sembol: string) => sembol !== undefined);
			const formattedString = prefixler.join(SEP2);
			if (formattedString) {
				request(symbolSend, " ", formattedString);
			}
		}
	}, [codes1, selectedList.value]);

	// Seçilen listeye göre istekleri asenkron olarak gönderiyoruz.
	useEffect(() => {
		const handleRequest = async () => {
			switch (selectedList.value) {
				case "topGainers":
					setTimeout(() => request(topGainers), 150);
					break;
				case "devrekesici":
					setTimeout(() => request(devrekesici), 150);
					break;
				case "bruttakas":
					setTimeout(() => request(bruttakas), 150);
					break;
				case "topLosers":
					setTimeout(() => request(topLosers), 150);
					break;
				case "topVolume":
					setTimeout(() => request(topVolume), 150);
					break;
				case "xBank":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xBank");
					setTimeout(() => request(xBank), 150);
					break;
				case "xGida":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xGida");
					setTimeout(() => request(xGida), 150);
					break;
				case "xuSin":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xuSin");
					setTimeout(() => request(xuSin), 150);
					break;
				case "xutek":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xutek");
					setTimeout(() => request(xutek), 150);
					break;
				case "xhold":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xhold");
					setTimeout(() => request(xhold), 150);
					break;
				case "xmana":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xmana");
					setTimeout(() => request(xmana), 150);
					break;
				case "xktum":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xktum");
					setTimeout(() => request(xktum), 150);
					break;
				case "xk030":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xk030");
					setTimeout(() => request(xk030), 150);
					break;
				case "xu050":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xu050");
					setTimeout(() => request(xu050), 150);
					break;
				case "xk050":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xk050");
					setTimeout(() => request(xk050), 150);
					break;
				case "xk100":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xk100");
					setTimeout(() => request(xk100), 150);
					break;
				case "xharz":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xharz");
					request(xharz);
					break;
				case "xarku":
					await AsyncStorage.setItem("SELECTED_LIST_VALUE_INDEX_SYMBOL", "xarku");
					request(xarku);
					break;
				default:
					break;
			}
			setContentLoader(false);
		};
		if (watchlist) {
			setContentLoader(false);
		} else {
			handleRequest();
		}

	}, [selectedList]);

	// Eğer GARAN fiyatı henüz yüklenmemişse Loading gösterelim
	/* if (codes1 && !garanPrice) {
	  return <Loading />;
	} */

	const loadingContainer = (
		<View style={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
			<LottieView
				source={require("../../../../assets/lottie/loading-dots.json")}
				autoPlay
				loop
				renderMode="HARDWARE"
				style={{ width: 80, height: 80 }}
			/>
		</View>
	);

	return contentLoader ? (
		loadingContainer
	) : (
		<List
			codes={codes1}
			columns={columns}
			symbols={symbols}
			rightSwipeOption={rightSwipeOption}
			demo={demo}
			squareOrListValueWatchlist={squareOrListValueWatchlist}
			squareOrListValueMarket={squareOrListValueMarket}
			loading={false}
			showFilterBar={showFilterBar}
			selectedList={selectedList}
			watchlist={watchlist}
			headerAd={headerAd}
			footerAd={footerAd}
		/>
	);
};

export default ListContainer;