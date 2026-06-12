import React, { useEffect, useLayoutEffect, useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import FlashMessage from "react-native-flash-message";
import flashMessage from "../../../../modules/flashMessage";
import Form from "./Form";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { login } from "../../../../modules/IdealClient";
import { useTheme } from "../../../../theme/ThemeContext";
import { useDispatch } from "react-redux";
import { addAccount as addAccountAuth } from "../../../Auth/modules/auth";
interface Props {
	navigation: any;
	route: any;
}

const SMSGGO: React.FC<Props> = ({
	navigation,
	route
}) => {
	const { theme } = useTheme();
	const styles = createStyles(theme)
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const account: any = route.params.account;
	const otpcheck = route.params.otp;
	const credentials = route.params.credentials;
	const [otp, setotp] = useState(otpcheck);
	const [length, setLength] = useState(" ");


	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitleAlign: "center",
			headerTitle: () => {
				const brokerage = account?.brokerage;
				if (!brokerage) return null;

				return (
					<Image
						source={brokerage.logo}
						style={{
							height: 25,
							width: (25 / brokerage.logoHeight) * brokerage.logoWidth,
							marginLeft: 15,
						}}
					/>
				);
			},
		});
	}, [navigation, account?.brokerage]);


	const symbolLocalLength = async () => {
		const symbolLength = await AsyncStorage.getItem(
			"@symbolDefinationlength"
		);
		setLength(symbolLength || "0");
	};

	useEffect(() => {
		symbolLocalLength();
	}, []);

	const softSmsReq = () => {
		setotp("1");
		account.adapter.verifySendSMS().then(() => {
			console.log("verifySendSMS logu auth smsggo =>=>=>=>=>=>=Z=");
		});
	};

	useEffect(() => {
		if (route.params.smsSent !== true) {
			account.adapter.login(...credentials);
		}
	}, []);

	const onSubmit = (values) => {
		setLoading(true);

		account.adapter
			.verifySMS(values.code)
			.then((accounts) => {
				const accountData = {
					account: {
						...account,
						status: 0,
						noViop: accounts[0]?.noViop,
						subAccounts: accounts,
					},
					credentials: credentials,
					remember: true,
					byPassSMS: false,
				};

				dispatch(addAccountAuth(accountData));
				if (length && length.toString() !== undefined) {
					setTimeout(() => {
						login(
							credentials[0],
							credentials[1],
							false,
							"1",
							length?.toString()
						);
					}, 400);
				} else {
					setTimeout(() => {
						login(
							credentials[0],
							credentials[1],
							false,
							"1",
							"0"
						);
					}, 400);
				}
				//setLoading(false)
			})
			.catch((e) => {
				flashMessage({
					type: "danger",
					message: e.toString(),
				});
				setLoading(false);
			});
	};

	return (
		<KeyboardAvoidingView style={styles.container}>
			<ScrollView style={styles.formContainer}>
				<Form loading={loading} onSubmit={onSubmit} otpkey={otp} />
				{otp === "SOFT_OTP" ? (
					<TouchableOpacity onPress={() => softSmsReq()}>
						<View style={styles.button}>
							<Text style={{ color: theme.onBlue }}>
								SMS İLE GİRİŞ YAP
							</Text>
						</View>
					</TouchableOpacity>
				) : null}
			</ScrollView>
			<FlashMessage position="top" />
		</KeyboardAvoidingView>
	);
};


const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: theme.darkestBrand,
	},
	formContainer: {
		flex: 1,
		padding: 15,
	},
	button: {
		borderWidth: 1,
		borderColor: "gray",
		borderStyle: "dashed",
		marginTop: "5%",
		alignItems: "center",
		justifyContent: "center",
		height: 50,
	},
});

export default SMSGGO;
