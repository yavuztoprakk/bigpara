import React from "react";
import { TouchableOpacity, View, Platform } from "react-native";
import { Button } from "react-native-paper";
import * as Network from "expo-network";
import flashMessage from "../../../modules/flashMessage";
import { useTheme } from "../../../theme/ThemeContext";
import { login as IdealClientLogin } from "../../../modules/IdealClient/index";
import store from "../../../store";
import { initiateLogin } from "../modules/login";
import * as Application from 'expo-application';



const Banner = ({ navigation, login, loading }) => {
	const { theme } = useTheme();

	const handleLogin = (credentials: { remember: boolean; demo: boolean }) => {
		store.dispatch(initiateLogin(credentials.remember, credentials.demo));
	};



	const loginToDemo = async () => {
		const controlNetwrok = await Network.getNetworkStateAsync();
		if (!controlNetwrok.isConnected) {
			flashMessage({
				type: "danger",
				message:
					"Lütfen ağ bağlantınızı kontrol ediniz!",
			});
			return
		}


		const getApplicationId = async () => {
			if (Platform.OS === 'ios') {
				if (Application.getIosIdForVendorAsync) {
					const iosId = await Application.getIosIdForVendorAsync();
					const lastPart = iosId?.split("-").pop(); // sadece son parçayı al
					return lastPart;
				}
			} else if (Platform.OS === 'android') {
				const androidId = Application.getAndroidId();
				return androidId;
			}
		};


		const deviceId = await getApplicationId();
		const userId = `usergck_${deviceId}`;

		/* demo = true;
		const generateRandomId = () => (Math.random() * 1000).toFixed(0);
		const randomId = generateRandomId();
		const username = `gck${randomId}`;
		const password = `idealgck${randomId}`;
 */
		IdealClientLogin(userId, "password1", true, "0", "0");
		handleLogin({ remember: true, demo: true });
	};

	return (
		<View>
			<TouchableOpacity
				style={{
					flex: 1,
					marginHorizontal: 15,
					marginVertical: 5,
				}}
				onPress={loginToDemo}
				disabled={loading}
			>
				<Button
					loading={loading}
					buttonColor={theme.white}
					textColor={theme.black}
					mode="contained"
					style={[{ borderRadius: 4 }]}
				>
					ÜCRETSİZ 15DK GECİKMELİ VERİ
				</Button>
			</TouchableOpacity>
			{/* <TouchableOpacity onPress={() => navigation.navigate("Welcome")}>
				<Button
					buttonColor={theme.white}
					textColor={theme.black}
					mode="contained"
					style={[{ borderRadius: 4, marginTop: 30, width: "80%", alignSelf: "center" }]}
				>
					HESAP AÇ
				</Button>
			</TouchableOpacity> */}
		</View>
	);
};

export default Banner;
