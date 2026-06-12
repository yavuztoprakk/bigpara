import AsyncStorage from "@react-native-async-storage/async-storage";
import { SEP2 } from "./IdealClient/constants";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { request, wssControl } from "./IdealClient";
import store from "../store";
import symbolSend from "./IdealClient/request/symbolSend";
import { updatePageLastBrokerages } from "./pageStatus";
import deleteDetailOrderBook from "./IdealClient/request/deleteDetailOrderBook";
import analytics from "@react-native-firebase/analytics";
import { getScreenName } from "./screenNames";

// Capra native modülü henüz prebuild edilmemiş cihazda fail-safe import.
// Native modül yoksa Capra çağrıları sessizce no-op olur, Firebase Analytics
// tarafı çalışmaya devam eder.
let CapraAnalytics: any = null;
try {
  // require çünkü import statement'ları top-level olur ve modül yoksa app crash eder.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  CapraAnalytics = require("../../modules/capra-analytics").default;
} catch (e) {
  if (__DEV__) {
    console.warn("[analytics] Capra native module bulunamadı:", (e as Error)?.message);
  }
}

// Aynı ekran için ardışık screen_view event'i göndermemek için dedup.
let lastScreenName: string | null = null;

export const handleUserChange = (username) => {
  /* mixpanel.identify(username);
  mixpanel.people_set({
    $email: `${username}@idealdata.com.tr`,
    Name: username,
    $name: username,
    Company: WHITELABEL.id,
  }); */
};

type PurchaseItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type PurchasePayload = {
  transaction_id: string;
  value: number;
  currency: string;
  items: PurchaseItem[];
};

const safeCapra = (label: string, fn: () => void) => {
  if (!CapraAnalytics) return;
  try {
    fn();
  } catch (e) {
    if (__DEV__) console.warn(`[analytics] Capra ${label} hatası:`, e);
  }
};

// Manuel screen_view — Firebase Analytics + Capra'ya paralel push.
// Aynı screen_name ardışık geldiyse skip (çift sayım engeli).
export const trackScreenView = async ({
  screen_name,
  screen_class,
}: {
  screen_name: string;
  screen_class?: string;
}) => {
  if (lastScreenName === screen_name) return;
  lastScreenName = screen_name;

  try {
    await analytics().logScreenView({
      screen_name,
      screen_class: screen_class ?? screen_name,
    });
  } catch (e) {
    if (__DEV__) console.warn("[analytics] Firebase logScreenView hatası:", e);
  }

  safeCapra("trackScreen", () =>
    CapraAnalytics.trackScreen(screen_name, screen_name, screen_name)
  );
};

// Alt tab tıklamalarında — her tıklama bir event (focused olsa bile).
export const trackBottomMenu = async (bottom_name: string) => {
  try {
    await analytics().logEvent("bottom_menu", { bottom_name });
  } catch (e) {
    if (__DEV__) console.warn("[analytics] Firebase bottom_menu hatası:", e);
  }

  safeCapra("trackEvent bottom_menu", () =>
    CapraAnalytics.trackEvent("bottom_menu", { bottom_name })
  );
};

// Lisans satın alma tamamlandığında.
export const trackPurchase = async (payload: PurchasePayload) => {
  try {
    await analytics().logEvent("Purchases", payload as any);
  } catch (e) {
    if (__DEV__) console.warn("[analytics] Firebase Purchases hatası:", e);
  }

  safeCapra("trackConversion", () =>
    CapraAnalytics.trackConversion(
      payload.transaction_id,
      "purchase",
      payload.value,
      payload.currency
    )
  );
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
    // BI isteği: her ekran geçişinde manuel screen_view (Firebase otomatik
    // tracking ios/android tarafında kapalı; çift sayım önlenir).
    const screen_name = getScreenName(currentRoute);
    trackScreenView({ screen_name, screen_class: currentRoute });

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
