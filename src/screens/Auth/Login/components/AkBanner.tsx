import React from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import BoldText from "../../../../components/BoldText";
import { useTheme } from "../../../../theme/ThemeContext";
import { updateVersionIfAvailable } from "../../../../modules/updates";
import { useDispatch, useSelector } from "react-redux";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
const AkBanner = ({ navigation, login, loading }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const dispatch = useDispatch();
  const { checkingAvailableUpdates, checkingAvailableUpdatesTriggeredBy } =
    useSelector((state) => state.updates);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Pressable
          disabled={checkingAvailableUpdates}
          style={styles.versionContainer}
          onPress={() => updateVersionIfAvailable("user", dispatch)}
        >
          <ActivityIndicator animating={false} color={theme.white} />
          <BoldText style={styles.label}>
            {Constants.expoConfig?.version}
          </BoldText>
          <ActivityIndicator
            animating={
              checkingAvailableUpdates &&
              checkingAvailableUpdatesTriggeredBy === "user"
            }
            color={theme.white}
          />
        </Pressable>
        <BoldText style={styles.label}>
          {Updates.updateId?.split('-')[0] || ""}
        </BoldText>
      </View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      position: "absolute",
      backgroundColor: "black",
      bottom: 0,
      paddingBottom: 20,
      left: 0,
      right: 0,
      alignItems: "center",
      paddingTop: 15,
    },
    logo: {
      width: 140,
      height: 35,
      marginBottom: 5,
      resizeMode: "contain",
    },
    label: {
      paddingHorizontal: 10,
      flex: 1,
      textAlign: "center",
      color: "#d6d6d6ba",
      fontSize: 13,
    },
    contentContainer: {
      width: '100%',
      alignItems: 'center',
      gap: 10,
    },
    versionContainer: {
      marginHorizontal: 20,
      alignItems: "center",
      flexDirection: "row",
    },
    freeDataText: {
      color: theme.white,
      fontSize: 13,
    },
  });

export default AkBanner;
