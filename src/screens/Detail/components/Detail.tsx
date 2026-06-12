import React, { useCallback, useEffect } from "react";
import { ScrollView, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import Header from "./Header";
import MinMaxReport from "./MinMaxReport";
import FundamentalContainer from "../containers/FundamentalContainer";
import { Portal } from "react-native-paper";
import AlarmsCreateTriggerContainer from "../../AlarmsCreate/containers/AlarmsCreateTriggerContainer";
import StatsRow from "../../../screens/KurumAnalizDetail/components/StatsRow";
import RiskCategories from "./RiskCategories";
import { symbolSelector } from "../../Markets/modules/symbols";
import { formatLot } from "../../Markets/modules/prices";
import Stats from "./Stats";
import store from "../../../store";
import { request } from "../../../modules/IdealClient";
import stats from "../../../modules/IdealClient/request/stats";
import pgc1Req from "../../../modules/IdealClient/request/pgc1Req";
import { BrokerageList1 } from "../../PGC1/modules/pgc1";
import turevListReq from "../../../modules/IdealClient/request/turevListReq";
import { resetBrokerages } from '../../TUREVLIST/modules/turevlist';
// import BoldText from "../../../components/BoldText";
// import { Ionicons } from '@expo/vector-icons';
import SymbolWatchListTogglerButton from "./SymbolWatchListTogglerButton";
import ListDelayedBadge from "../../Markets/components/ListDelayedBadge";
import withSymbolChanger from "../../../containers/withSymbolChanger";
import ActionsContainer from "../containers/ActionsContainer";
import { updatePageLastBrokerages } from "../../../modules/pageStatus";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import Loading from "../../../components/Loading";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import MastheadBanner from "../../../modules/ads/MastheadBanner";
import MediumBanner from "../../../modules/ads/MediumBanner";
import LazyAdSlot from "../../../modules/ads/LazyAdSlot";
import type { AdTargeting } from "../../../modules/ads/config";

const Detail: React.FC<{ navigation: any, route: any }> = ({ route, navigation }) => {
	const { theme } = useTheme();
	const { code } = route.params;
	const dispatch = useDispatch();
	const isFocused = useIsFocused();

	// Targeting: tüm piyasa detayları için sabit "detail" slug.
	const adTargeting: AdTargeting = React.useMemo(
		() => ({ bigpara_kategori: "detail", catlist: ["detail"] }),
		[]
	);

	/* const activeState = store.getState().pageLastBrokerages
	const controlCode = activeState?.code || code; */
	// 🔹 `useSelector` her zaman çağrılacak, kod bazen `undefined` olursa bile
	const symbol = useSelector((state: any) => symbolSelector(state, code || ""));
	const isDemo = useSelector((state: any) => state.auth.demo);
	const hasPiteLicense = useSelector((state: any) => state.auth?.user?.licences.includes("PITE"));
	const data = useSelector((state: { pgc1Brokerages: BrokerageList1 }) => state.pgc1Brokerages);
	// const data1 = useSelector((state: { turevlistBrokerages: BrokerageList }) => state.turevlistBrokerages);

	//console.log("asdASDADSA=D>=>= ", activeState, code);

	useEffect(() => {
		console.log("[DEBUG] Detail MOUNTED");
		return () => console.log("[DEBUG] Detail UNMOUNTED");
	}, []);

	useFocusEffect(
		useCallback(() => {
			if (!code) return;
			store.dispatch(updatePageLastBrokerages({ page: "Detail", code: code }));
			request(symbolSend, "", code)
		}, [code])
	);

	useEffect(() => {
		if (symbol) {
			if (symbol.prefix === "IMKBH" && !isDemo) {
				if (store.getState().turevlistBrokerages) {
					dispatch(resetBrokerages());
				}
				request(turevListReq, symbol.code);
			}
			if (hasPiteLicense) {
				request(pgc1Req, symbol.composite);
			}
		}
	}, [symbol, hasPiteLicense, isDemo]);
	useEffect(() => {
		if (!isFocused) return; // Sayfa odakta değilse hiçbir işlem yapma

		let isMounted = true;

		const fetchStatsData = async () => {
			try {
				request(stats, symbol?.composite);
				if (isMounted) {
					// İstek sonrası işlem yapabilirsiniz
				}
			} catch (error) {
				console.error("Error fetching stats data:", error);
			}
		};

		fetchStatsData(); // İlk yükleme
		const intervalId = setInterval(fetchStatsData, 30000);

		return () => {
			isMounted = false;
			clearInterval(intervalId); // Sayfa odaktan çıktığında interval durdurulur
		};
	}, [isFocused, symbol?.composite]);


	const renderContent = () => {
		// const styles = createStyles(theme);
		return (
			<ScrollView style={{ flex: 1, backgroundColor: theme.darkmanBrand }}>
				<MastheadBanner bucket="diger" targeting={adTargeting} />
				<Header code={symbol.code} navigation={navigation} />
				<View style={{ backgroundColor: theme.darkerBrand }}>
					{symbol.code && <Stats code={symbol.code} />}
					{hasPiteLicense && data && data[0] && symbol.prefix === "IMKBH" && symbol.seriNo === "E" ? (
						<StatsRow
							label="Para Giriş Çıkışı"
							value={data[0] ? formatLot(data[0].tl) : ""}
							color={data[0] && parseFloat(data[0].tl) === 0
								? theme.primaryText
								: parseFloat(data[0].tl) > 0
									? theme.green
									: theme.red}
						/>
					) : null}

					{/* {symbol.prefix === "IMKBH" && !isDemo && data1 && data1.length > 2 && (
						<View style={styles.turevListContainer}>
							<TurevListNavigation
								code={symbol.code}
								navigation={navigation}
							/>
						</View>
					)} */}
					{symbol.code && <MinMaxReport code={symbol.code} />}
					{symbol.seriNo === "V" && <RiskCategories />}
					{symbol.prefix === "IMKBH" && symbol.seriNo === "E" && (
						<FundamentalContainer
							isDemo={isDemo}
							code={symbol.code}
							navigation={navigation}
							onPressMeta={() =>
								navigation.navigate("DetailFundamentalMeta", {
									code: symbol.code,
								})
							}
							onPressSheets={(type) =>
								navigation.navigate("DetailFundamentalSheets", {
									code: symbol.code,
									type,
								})
							}
							onPressScores={(data) =>
								navigation.navigate("DetailFundamentalScore", {
									data,
								})
							} />
					)}
					<LazyAdSlot reservedHeight={250}>
						<MediumBanner bucket="diger" targeting={adTargeting} />
					</LazyAdSlot>
				</View>
			</ScrollView>
		);
	}


	const isLoading = !symbol;

	return isLoading ? (
		<Loading />
	) : (
		<Portal.Host>
			<View style={{ flex: 1 }}>
				{renderContent()}
			</View>
			{/* <ActionsContainer code={symbol.code} navigation={navigation} /> */}
			{isDemo && <ListDelayedBadge navigation={navigation} />}
		</Portal.Host>
	);
};

// const _TurevListNavigation = ({ code, navigation }) => {
// 	const { theme } = useTheme();
// 	return (
// 		<>
// 			<NavigationButton
// 				label="Vadeli"
// 				color={theme.red}
// 				onPress={() => navigation.navigate("TurevList", { code, deger: "vadeli" })}
// 			/>
// 			<NavigationButton
// 				label="Opsiyon"
// 				color={theme.red}
// 				onPress={() => navigation.navigate("TurevList", { code, deger: "opsiyon" })}
// 			/>
// 			<NavigationButton
// 				label="Varant"
// 				color={theme.red}
// 				onPress={() => navigation.navigate("TurevList", { code, deger: "varant" })}
// 			/>
// 		</>
// 	);
// };

// const NavigationButton = ({ label, color, onPress }) => {
// 	const { theme } = useTheme();
// 	const styles = createStyles(theme);
// 	return (
// 		<TouchableOpacity onPress={onPress} style={styles.navigationButton}>
// 			<BoldText style={{ color }}>{label}</BoldText>
// 			<Ionicons name="chevron-forward" size={20} color={color} />
// 		</TouchableOpacity>
// 	);
// };

const HeaderRight = (props: { code: string; }) => {
	return (
		<View style={{ flexDirection: "row" }}>
			<AlarmsCreateTriggerContainer icon="notifications" size={24} code={props.code} />
			<SymbolWatchListTogglerButton code={props.code} />
		</View>
	);
};

export default withSymbolChanger(Detail, HeaderRight);


// const createStyles = (theme: any) => StyleSheet.create({
// 	turevListContainer: {
// 		marginHorizontal: 15,
// 		marginTop: 25,
// 		padding: 10,
// 		borderRadius: 5,
// 		alignItems: "center",
// 		justifyContent: "space-between",
// 		flexDirection: "row",
// 		borderWidth: 1,
// 		borderColor: "#ff5555",
// 	},
// 	navigationButton: {
// 		flexDirection: "row",
// 		alignItems: "center",
// 		justifyContent: "center",
// 	},
// });
