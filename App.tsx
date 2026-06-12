import React, { Suspense, useEffect } from "react";
import BaseApp from "./BaseApp";
import ThemeProvider from "./src/theme/ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, BackHandler } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import * as Notifications from "expo-notifications";

// Uygulama başlatıldığında console fonksiyonlarını override et
// Bu sayede tüm console.log çağrıları config.enableLogs değerine göre gösterilir/gizlenir


// Foreground popup/balon
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {


  // Ekran yön kilitleme
  const handleOrientationLock = async (
    orientation = ScreenOrientation.OrientationLock.PORTRAIT_UP
  ) => {
    await ScreenOrientation.lockAsync(orientation);
  };

  useEffect(() => {
    handleOrientationLock();
  }, []);



  // Android: kanal (1 kez)
  useEffect(() => {
    if (Platform.OS === "android") {
      void Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
      });
    }
  }, []);

  // RN >= 0.65: bazı eski lib'ler removeEventListener arıyor
  if (typeof (BackHandler as any).removeEventListener !== "function") {
    (BackHandler as any).removeEventListener = function () { };
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <BaseApp />
          </Suspense>
        </ThemeProvider>
    </GestureHandlerRootView>

  );
}

