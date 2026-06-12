import { Platform } from "react-native";
import {
  requestTrackingPermissionsAsync,
  getTrackingPermissionsAsync,
} from "expo-tracking-transparency";

// iOS 14.5+ App Tracking Transparency izin akışı.
// Android'de no-op döner (status "granted" varsayılır).
export type ATTStatus = "granted" | "denied" | "restricted" | "undetermined";

export const requestATT = async (): Promise<ATTStatus> => {
  if (Platform.OS !== "ios") return "granted";

  try {
    const current = await getTrackingPermissionsAsync();
    if (current.status !== "undetermined") {
      return current.status as ATTStatus;
    }
    const result = await requestTrackingPermissionsAsync();
    return result.status as ATTStatus;
  } catch (error) {
    console.warn("[ADS] ATT request failed:", error);
    return "denied";
  }
};
