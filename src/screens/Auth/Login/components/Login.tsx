import React, { useEffect, useState } from "react";
import Form from "./Form";
import { View, Image, StyleSheet, ScrollView, Linking, Platform, PermissionsAndroid, Modal, Dimensions, Pressable } from "react-native";
import { User } from "../../modules/auth";
import { WHITELABEL } from "../../../../modules/IdealClient/constants";
import flashMessage from "../../../../modules/flashMessage";
import AkBanner from "./AkBanner";
import DemoBanner from "../../Demo/Banner";
import * as Network from "expo-network";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../../../theme/ThemeContext";
// import logoThemeChange from "../../../../routes/logoThemeChange";
import store from "../../../../store";
import { reset } from "../../modules/login";
import { persistToken, updateToken } from "../../../../modules/pushNotifications";
import PushNotificationRedirector from "../../../Markets/components/PushNotificationRedirector";
import Loading from "../../../../components/Loading";
// const loginImg = require("../../../../../assets/colendi/logo.png");
import { login as idealClientLogin } from "../../../../modules/IdealClient";
// import { addAccount as addAccountAuth } from "../../../Auth/modules/auth";
import ColendiBanner from "./ColendiBanner";
import messaging from "@react-native-firebase/messaging";


interface Props {
  demo: boolean;
  loading: boolean;
  navigation: any;
  user?: User;
  login: Function;
}

const Login: React.FC<Props> = ({
  user,
  demo,
  loading,
  navigation,
  login,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [username, setUserName] = useState("");
  // const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  useEffect(() => {
    symbolLocalLength();
    store.dispatch(reset());
    getUserInfo();

  }, []);

  const getUserInfo = async () => {
    const username = await AsyncStorage.getItem("@username");
    console.log("username=>=>=>=>=>=>=> ", username);
    // const _password = await AsyncStorage.getItem("@password");
    setUserName(username || "");
    // setPassword(password || "");
    setIsLoading(false);
  };


  useEffect(() => {
    if (user) {
      //navigation.navigate("App");
    } else {
      try {
        // `persistToken` thunk'ını çağır
        console.log("[PUSH-DEBUG] Login.tsx useEffect (user yok) => tokenUsername:", username);
        store.dispatch(persistToken({ clear: true, tokenUsername: username }));
      } catch (error: any) {
        console.error("Token kaydedilirken hata oluştu:", error.toString());
      }
    }
  }, [user]);

  const [length, setLength] = useState(" ");

  const symbolLocalLength = async () => {
    const controlNetwrok = await Network.getNetworkStateAsync();
    if (!controlNetwrok.isConnected) {
      flashMessage({
        type: "danger",
        message:
          "Lütfen ağ bağlantınızı kontrol ediniz!",
      });
    }
    const symbolLength = await AsyncStorage.getItem('@symbolDefinationlength') || "0";
    setLength(symbolLength);
  };

  if (isLoading) {
    return <Loading />;
  }

  // FCM token kontrolu: izin verili ise token al ve Redux'a yaz
  const checkTokenAvailability = async () => {
    let token: string | undefined;
    if (Platform.OS === "android" && Platform.Version > 32) {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        token = await messaging().getToken();
        if (token && store.getState().pushNotifications?.token?.data !== token) {
          store.dispatch(updateToken({ data: token }));
        }
      }
    } catch (error: any) {
      console.log("[PUSH-DEBUG] Login checkTokenAvailability hata:", error?.toString?.());
    }
  };
  const onSubmit = async (values: any) => {

    const controlNetwrok = await Network.getNetworkStateAsync();
    if (!controlNetwrok.isConnected) {
      flashMessage({
        type: "danger",
        message:
          "Lütfen ağ bağlantınızı kontrol ediniz!",
      });
      return
    }
    await checkTokenAvailability();

    console.log("dasdADAD=AD=> ", WHITELABEL.brokerage);

    if (length && length.toString() !== undefined) {
              setTimeout(() => {
                idealClientLogin(values.username, values.password, false, length?.toString(), "1");
              }, 400);
            } else {
              setTimeout(() => {
                idealClientLogin(values.username, values.password, false, "0", "1");
              }, 400);
            }

  };

  return (
    <View style={styles.container}>

      <PushNotificationRedirector navigation={navigation} />

      <Modal
        visible={popupVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPopupVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPopupVisible(false)}
          />
          <View style={styles.popupContainer} pointerEvents="box-none">
            <Pressable
              onPress={() => {
                setPopupVisible(false);
                Linking.openURL("https://indir.colendimenkul.com");
              }}
            >
              <Image
                source={require("../../../../../assets/icon.png")}
                style={styles.popupImage}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Image style={styles.logo} source={
        theme.themeDetail === "dark" ?
          require("../../../../../assets/icon.png")
          :
          require("../../../../../assets/icon.png")
      } />
      <ScrollView style={styles.container1}>
        <View style={styles.formContainer}>
          <ColendiBanner
            onPress={() => setPopupVisible(true)}
          />
          <Form loading={!demo && loading} onSubmit={onSubmit} navigation={navigation} />
        </View>
        <View style={{ marginTop: 15 }}>
          <DemoBanner
            loading={demo && loading}
            login={login}
            navigation={navigation}
          />
        </View>
      </ScrollView>
      {WHITELABEL.id === "colendi" && <AkBanner />}
      {/* <FlashMessage position="top" /> */}
    </View>
  );
};

const { width: screenWidth } = Dimensions.get("window");

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.darkestBrand,
  },
  container1: {
    flex: 1,
    backgroundColor: theme.black,
    marginTop: 1
  },
  logo: {
    width: "100%",
    height: theme.logoLoginHeight || 35,
    marginBottom: 30,
    alignSelf: "center",
    resizeMode: "contain",
  },
  logo1: {
    width: 90,
    height: 30,
    marginBottom: 5,
    resizeMode: "contain",
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.darkerBrand,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  popupImage: {
    width: screenWidth * 0.85,
    height: screenWidth * 0.85,
    borderRadius: 12,
  },
});

export default Login;
