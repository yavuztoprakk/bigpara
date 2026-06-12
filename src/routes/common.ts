import { Platform } from "react-native";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const createStackOptions = (theme: any): NativeStackNavigationOptions => ({
  contentStyle: {
    backgroundColor: theme.darkerBrand,
  },
  headerTitleStyle: {
    fontFamily: theme.boldFont,
    color: theme.headerTint,
  },
  headerStyle: {
    backgroundColor: theme.darkestBrand,
  },
  headerShadowVisible: false,
  headerTintColor: theme.headerTint,
  headerBackTitle: "",
  headerBackButtonDisplayMode: "minimal",
  ...(Platform.OS === "android" && {
    animation: "none",
  }),
});
