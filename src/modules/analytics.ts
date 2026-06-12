import AsyncStorage from "@react-native-async-storage/async-storage";
import { SEP2 } from "./IdealClient/constants";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { request, wssControl } from "./IdealClient";
import store from "../store";
import symbolSend from "./IdealClient/request/symbolSend";
import { updatePageLastBrokerages } from "./pageStatus";
import deleteDetailOrderBook from "./IdealClient/request/deleteDetailOrderBook";
// import analytics from "@react-native-firebase/analytics";


export const handleUserChange = (username) => {
  /* mixpanel.identify(username);
  mixpanel.people_set({
    $email: `${username}@idealdata.com.tr`,
    Name: username,
    $name: username,
    Company: WHITELABEL.id,
  }); */
};

export const handleNavigationStateChange = async (test) => {
  const currentRoute = test[0].current;
  const prevRoute = test[0].prev;
  console.log("currentRoute => ", currentRoute);
  console.log("prevRoute => ", prevRoute);

  if (currentRoute !== "Detail") {
    store.dispatch(updatePageLastBrokerages({ page: currentRoute, code: "" }));
  }

  if (currentRoute === "WatchListScreen" && prevRoute !== "WatchListScreen") {
    if (prevRoute === "Markets" || prevRoute === "NewsScreen" || prevRoute === "PortfolioContainer" || prevRoute === "LoginScreen") {

    } else {
      if (wssControl === "connect") {
        const symbolsIndex = store.getState().watchLists?.selectedIndex;
        const symbolsCodes = store.getState().watchLists?.lists;
        const prefixler = symbolsCodes[symbolsIndex]?.codes
          .map((sembol) => {
            const composite = sembol; //symbols[sembol]?.composite;
            return composite; // Her bir sembolün composite değerini diziye ekliyoruz.
          })
          .filter((composite) => composite !== undefined);
        const formattedString = prefixler?.join(SEP2);
        formattedString ? request(symbolSend, " ", formattedString) : null;
      }
    }

  }
  // Eskiden Markets route'una her girildiğinde default seçili liste için
  // otomatik symbolSend atılıyordu (default: BIST 30). Yeni akışta Markets
  // ana ekranı kategori seçim grid'i — kullanıcı bir kategoriye tıklayana
  // dek hiçbir request atılmamalı. Markets.tsx#handleSelect kullanıcı
  // tıklamasında symbolSend'i kendisi gönderiyor.
  //Derinlik ekranından çıktıktan sonra derinlik verisinin gelmesinin engellenmesini sağlamak için şart
  if (currentRoute !== "DetailOrderBook" && prevRoute === "DetailOrderBook") {
    request(deleteDetailOrderBook);
  }
  if (currentRoute === "Detail" && prevRoute === "Detail") {
    //  store.dispatch(updatePageLastBrokerages(1 + currentRoute?.routeName + currentRoute?.params?.code));
    //request(symbolSend, " ", currentRoute?.params?.code);
  }
  await AsyncStorage.getItem("SLEEP_TIME_CONTROL")
    .then((val) => {
      if (val === "1") {
        deactivateKeepAwake();
      } else {
        activateKeepAwakeAsync();
      }
    })
    .catch((error) => {
      console.error("AsyncStorage getItem error:", error);
    });
  if (prevRoute !== currentRoute) {
    // Firebase Analytics

    // Firebase Analytics devre dışı
    // if (!__DEV__) {
    //   await analytics().logScreenView({
    //     screen_name: currentRoute,
    //     screen_class: currentRoute,
    //   });
    // }
    /* if (!__DEV__) {
      mixpanel.track(currentRoute.routeName, currentRoute.params);
    } */
    await AsyncStorage.getItem("SLEEP_TIME_CONTROL")
      .then((val) => {
        if (val === "1") {
          deactivateKeepAwake();
        } else {
          activateKeepAwakeAsync();
        }
      })
      .catch((error) => {
        console.error("AsyncStorage getItem error:", error);
      });
  }
};

