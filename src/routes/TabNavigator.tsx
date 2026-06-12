import React, { useMemo } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { View, TouchableOpacity, Image, Platform, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useTheme } from "../theme/ThemeContext";
// import { createDrawerNavigator } from "@react-navigation/drawer";
import Animated, {
  Easing,
  LinearTransition,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
import WatchListScreen from "../screens/WatchList";
import MarketsScreen from "../screens/Markets/components/MarketsHome";
import MarketsListScreen from "../screens/Markets/components/MarketsList";
import HeaderSwitcher from "../components/HeaderSwitcher";
import DelayedHeaderBadge from "../components/DelayedHeaderBadge";

//import CustomDrawerContent from "../screens/Drawer/components/Drawer";
import { createStackOptions } from "./common";
import WatchListEditorContainer from "../screens/Markets/containers/WatchListEditorContainer";
import WatchListEditorAddContainer from "../screens/Markets/containers/WatchListEditorAddContainer";
import Detail from "../screens/Detail/components/Detail";
import CalendarContainer from "../screens/Calendar/containers/CalendarContainer";
import AlarmsContainer from "../screens/Alarms/containers/AlarmsContainer";
import Account from "../screens/Account/components/Account";
import Register from "../screens/Account/components/Register";
import Hakkimizda from "../screens/Account/components/Hakkimizda";
import KullaniciSozlesmesi from "../screens/Account/components/KullaniciSozlesmesi";
import GizlilikPolitikasi from "../screens/Account/components/GizlilikPolitikasi";
import BizeYazin from "../screens/Account/components/BizeYazin";
import News from "../screens/News/components/News";
import NewsDetail from "../screens/News/components/NewsDetail";
import Tools from "../screens/Tools/components/Tools";
import YatirimlarimScreen from "../screens/Tools/screens/YatirimlarimScreen";
import ParamNeOlurduScreen from "../screens/Tools/screens/ParamNeOlurduScreen";
import KademeAnaliziScreen from "../screens/Tools/screens/KademeAnaliziScreen";
import SicaklikHaritasiScreen from "../screens/Tools/screens/SicaklikHaritasiScreen";
import PivotAnaliziScreen from "../screens/Tools/screens/PivotAnaliziScreen";
import MaliTablolarScreen from "../screens/Tools/screens/MaliTablolarScreen";
import PerformansAnaliziScreen from "../screens/Tools/screens/PerformansAnaliziScreen";
import ElliottAnaliziScreen from "../screens/Tools/screens/ElliottAnaliziScreen";
import BinTLNeOlduScreen from "../screens/Tools/screens/BinTLNeOlduScreen";
import DovizCeviricisiScreen from "../screens/Tools/screens/DovizCeviricisiScreen";
import AltinHesaplayiciScreen from "../screens/Tools/screens/AltinHesaplayiciScreen";
import YeniYatirimScreen from "../screens/Tools/screens/YeniYatirimScreen";
import SembolSecimScreen from "../screens/Tools/screens/SembolSecimScreen";
import { trackBottomMenu } from "../modules/analytics";
import { getScreenName } from "../modules/screenNames";

const HEADER_LOGO_SOURCE = require("../../assets/bigpara/headerLogo.png");

const HeaderLogo = () => (
  <Image
    source={HEADER_LOGO_SOURCE}
    style={{ width: 130, height: 32 }}
    resizeMode="contain"
    fadeDuration={0}
  />
);

// import { useSelector } from "react-redux";
const Tab = createBottomTabNavigator();
const WatchListStack = createNativeStackNavigator();
const MarketsStack = createNativeStackNavigator();
const ToolsStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();
const NewsStack = createNativeStackNavigator();
// const Drawer = createDrawerNavigator();

function WatchListStackScreen() {
  const { theme } = useTheme();

  const screenOptions = useMemo(() => ({
    ...createStackOptions(theme),
    animation: "none",
    headerTitle: () => <HeaderLogo />,
    headerTitleAlign: "center" as const,
  }), [theme]);

  return (
    <WatchListStack.Navigator screenOptions={screenOptions}>
      <WatchListStack.Screen
        name="WatchListScreen"
        component={WatchListScreen}
        options={({ navigation }) => ({
          title: "",
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
          headerLeft: () => <DelayedHeaderBadge />,
          headerRight: () => (
            <View style={{ paddingRight: 15 }}>
              <HeaderSwitcher
                onSelect={(code: any) => navigation.navigate("Detail", { code })}
                code={""}
              />
            </View>
          ),
        })}
      />
      <WatchListStack.Screen name="WatchListEditor" component={WatchListEditorContainer} />
      <WatchListStack.Screen name="WatchListEditorAdd" component={WatchListEditorAddContainer} options={{ headerShown: false }} />
      <WatchListStack.Screen name="Detail" component={Detail} />
      <WatchListStack.Screen name="Calendar" component={CalendarContainer} />
      <WatchListStack.Screen name="Alarms" component={AlarmsContainer} />
      <WatchListStack.Screen name="NewsDetail" component={NewsDetail} options={{ headerBackTitle: "" }} />
    </WatchListStack.Navigator>
  );
}

function MarketsStackScreen() {
  const { theme } = useTheme();

  const screenOptions = useMemo(() => ({
    ...createStackOptions(theme),
    animation: "none",
    headerTitle: () => <HeaderLogo />,
    headerTitleAlign: "center" as const,
  }), [theme]);

  return (
    <MarketsStack.Navigator screenOptions={screenOptions}>
      <MarketsStack.Screen
        name="Markets"
        component={MarketsScreen}
        options={{
          title: "",
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      />
      <MarketsStack.Screen
        name="MarketsList"
        component={MarketsListScreen}
        options={{
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      />
      <MarketsStack.Screen name="Detail" component={Detail} />
      <MarketsStack.Screen name="Calendar" component={CalendarContainer} />
      <MarketsStack.Screen name="Alarms" component={AlarmsContainer} />
    </MarketsStack.Navigator>
  );
}

function ToolsStackScreen() {
  const { theme } = useTheme();

  const screenOptions = useMemo(() => ({
    ...createStackOptions(theme),
    animation: "none",
    headerTitle: () => <HeaderLogo />,
    headerTitleAlign: "center" as const,
  }), [theme]);

  return (
    <ToolsStack.Navigator screenOptions={screenOptions}>
      <ToolsStack.Screen
        name="ToolsScreen"
        component={Tools}
        options={{
          title: "",
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      />
      <ToolsStack.Screen name="Yatirimlarim" component={YatirimlarimScreen} options={{ headerTitle: "Yatırımlarım", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="ParamNeOlurdu" component={ParamNeOlurduScreen} options={{ headerTitle: "Param Ne Olurdu", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="KademeAnalizi" component={KademeAnaliziScreen} options={{ headerTitle: "Kademe Analizi", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="SicaklikHaritasi" component={SicaklikHaritasiScreen} options={{ headerTitle: "Sıcaklık Haritası", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="PivotAnalizi" component={PivotAnaliziScreen} options={{ headerTitle: "Pivot Analizi", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="MaliTablolar" component={MaliTablolarScreen} options={{ headerTitle: "Mali Tablolar", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="PerformansAnalizi" component={PerformansAnaliziScreen} options={{ headerTitle: "Performans Analizi", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="ElliottAnalizi" component={ElliottAnaliziScreen} options={{ headerTitle: "Elliott Analizi", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="BinTLNeOldu" component={BinTLNeOlduScreen} options={{ headerTitle: "1000TL Ne Oldu?", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="DovizCeviricisi" component={DovizCeviricisiScreen} options={{ headerTitle: "Döviz Çeviricisi", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="AltinHesaplayici" component={AltinHesaplayiciScreen} options={{ headerTitle: "Altın Hesaplayıcı", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="YeniYatirim" component={YeniYatirimScreen} options={{ headerTitle: "Yeni Yatırım Ekle", headerTitleAlign: "center" }} />
      <ToolsStack.Screen name="SembolSecim" component={SembolSecimScreen} options={{ headerTitle: "Sembol Seçimi", headerTitleAlign: "center" }} />
    </ToolsStack.Navigator>
  );
}

function NewsStackScreen() {
  const { theme } = useTheme();

  const screenOptions = useMemo(() => ({
    ...createStackOptions(theme),
    animation: "none",
    headerTitle: () => <HeaderLogo />,
    headerTitleAlign: "center" as const,
  }), [theme]);

  return (
    <NewsStack.Navigator screenOptions={screenOptions}>
      <NewsStack.Screen
        name="NewsScreen"
        component={News}
        options={{
          title: "",
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      />
      <NewsStack.Screen
        name="NewsDetail"
        component={NewsDetail}
        options={({ route }: any) => ({
          headerTitle: route.params?.title ?? "Haber Detay",
          headerTitleAlign: "center",
        })}
      />
    </NewsStack.Navigator>
  );
}

function AccountStackScreen() {
  const { theme } = useTheme();

  const screenOptions = useMemo(() => ({
    ...createStackOptions(theme),
    animation: "none",
    headerTitle: () => <HeaderLogo />,
    headerTitleAlign: "center" as const,
  }), [theme]);

  return (
    <AccountStack.Navigator screenOptions={screenOptions}>
      <AccountStack.Screen
        name="AccountScreen"
        component={Account}
        options={{
          title: "",
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "center",
        }}
      />
      <AccountStack.Screen
        name="Register"
        component={Register}
        options={{
          headerTitle: "ÜYE OL",
          headerTitleAlign: "center",
        }}
      />
      <AccountStack.Screen
        name="Hakkimizda"
        component={Hakkimizda}
        options={{
          headerTitle: "Hakkımızda",
          headerTitleAlign: "center",
        }}
      />
      <AccountStack.Screen
        name="KullaniciSozlesmesi"
        component={KullaniciSozlesmesi}
        options={{
          headerTitle: "Kullanıcı Sözleşmesi",
          headerTitleAlign: "center",
        }}
      />
      <AccountStack.Screen
        name="GizlilikPolitikasi"
        component={GizlilikPolitikasi}
        options={{
          headerTitle: "Gizlilik Politikası",
          headerTitleAlign: "center",
        }}
      />
      <AccountStack.Screen
        name="BizeYazin"
        component={BizeYazin}
        options={{
          headerTitle: "Bize Ulaşın",
          headerTitleAlign: "center",
        }}
      />
    </AccountStack.Navigator>
  );
}

const TAB_ICONS: Record<string, { type: "mci" | "ion"; name: string; nameOutline?: string }> = {
  WatchList: { type: "mci", name: "list-box" },
  Markets: { type: "mci", name: "chart-areaspline" },
  News: { type: "ion", name: "newspaper", nameOutline: "newspaper-outline" },
  Tools: { type: "mci", name: "home-analytics" },
  Account: { type: "ion", name: "person", nameOutline: "person-outline" },
};

const TAB_LABELS: Record<string, string> = {
  WatchList: "Ekranım",
  Markets: "Piyasalar",
  News: "Haberler",
  Tools: "Analiz",
  Account: "Hesabım",
};

function CustomTabBar({ state, navigation, theme }: any) {
  const isDark = theme.themeDetail === "dark";
  const ACTIVE_ACCENT = "#F07400";
  const INACTIVE_ICON = theme.tabBarInactiveIcon;
  const INACTIVE_LABEL = theme.tabBarInactiveLabel;
  const BAR_BG = theme.tabBarBg;
  const BAR_BORDER = theme.tabBarBorder;
  const CONTAINER_BG = isDark ? "#0F1419" : theme.darkerBrand;

  return (
    <View style={[tabStyles.container, { backgroundColor: CONTAINER_BG }]}>
      <View
        style={[
          tabStyles.bar,
          {
            backgroundColor: BAR_BG,
            borderColor: BAR_BORDER,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: isDark ? 0.3 : 0.08,
                shadowRadius: 12,
              },
              android: { elevation: 12 },
            }),
          },
        ]}
      >
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;
          const iconConfig = TAB_ICONS[route.name];
          const label = TAB_LABELS[route.name] ?? route.name;

          const onPress = () => {
            // BI isteği: alt menüye her tıklamada bottom_menu event'i,
            // bottom_name = ekranın canonical screen_name değeri.
            trackBottomMenu(getScreenName(route.name));
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const renderIcon = () => {
            const size = focused ? 20 : 19;
            const color = focused ? "#FFFFFF" : INACTIVE_ICON;
            if (iconConfig.type === "mci") {
              return <MaterialCommunityIcons name={iconConfig.name as any} size={size} color={color} />;
            }
            return <Ionicons name={(focused ? iconConfig.name : (iconConfig.nameOutline || iconConfig.name)) as any} size={size} color={color} />;
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.7}
              onPress={onPress}
              style={tabStyles.tabItem}
            >
              {/* Aktif tab — yukarı taşan daire */}
              {focused && (
                <View
                  style={[
                    tabStyles.activeGlow,
                    {
                      backgroundColor: isDark
                        ? "rgba(240,116,0,0.12)"
                        : "rgba(240,116,0,0.08)",
                    },
                  ]}
                />
              )}
              <View
                style={[
                  tabStyles.iconCircle,
                  focused
                    ? [
                        tabStyles.activeCircle,
                        {
                          backgroundColor: ACTIVE_ACCENT,
                          ...Platform.select({
                            ios: {
                              shadowColor: ACTIVE_ACCENT,
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.45,
                              shadowRadius: 10,
                            },
                            android: { elevation: 8 },
                          }),
                        },
                      ]
                    : {
                        backgroundColor: "transparent",
                      },
                ]}
              >
                {renderIcon()}
              </View>
              <Animated.Text
                style={[
                  tabStyles.label,
                  {
                    color: focused ? ACTIVE_ACCENT : INACTIVE_LABEL,
                    fontFamily: focused ? theme.boldFont : theme.regularFont,
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Animated.Text>
              {focused && (
                <View style={[tabStyles.activeDot, { backgroundColor: ACTIVE_ACCENT }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function TabNavigator() {
  const { theme } = useTheme();
  // const isDemo = useSelector((state: any) => state.auth.demo); // Redux'tan demo modunu al
  // Açılış sekmesi — kullanıcı tercihi PersistGate ile hidrate edildikten sonra
  // mount olur, initialRouteName mount anında okunduğu için flicker olmaz.
  const initialTab = useSelector((state: any) => state.preferences.initialTab);
  return (
    <>
      <Tab.Navigator
        initialRouteName={initialTab}
        tabBar={(props) => <CustomTabBar {...props} theme={theme} />}
        sceneContainerStyle={{ backgroundColor: theme.darkerBrand }}
        screenOptions={{
          headerShown: false,
          lazy: true,
          animation: "none",
        }}
      >
        {/*
          Reklam yenileme stratejisi: tab unmount edilmez (state korunur).
          Banner reklamlar useAdReloadKey hook'u ile her ekran focus'unda
          kendi başlarına remount olup yeni ad request atar — tüm stack'i
          yıkmaya gerek kalmadan tab geçişi ve stack pop senaryoları kapsanır.
        */}
        <Tab.Screen
          name="WatchList"
          component={WatchListStackScreen}
          options={{ tabBarLabel: "Ekranım" }}
        />
        <Tab.Screen
          name="Markets"
          component={MarketsStackScreen}
          options={{ tabBarLabel: "Piyasalar" }}
        />
        <Tab.Screen
          name="News"
          component={NewsStackScreen}
          options={{ tabBarLabel: "Haberler" }}
        />
        <Tab.Screen
          name="Tools"
          component={ToolsStackScreen}
          options={{ tabBarLabel: "Analiz" }}
        />
        <Tab.Screen
          name="Account"
          component={AccountStackScreen}
          options={{ tabBarLabel: "Hesabım" }}
        />
      </Tab.Navigator>
    </>
  );
}

const ICON_SIZE = 38;

const tabStyles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingHorizontal: 12,
  },
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 22,
    borderWidth: 1,
    paddingTop: 6,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  iconCircle: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  activeCircle: {
    marginTop: -14,
    width: ICON_SIZE + 4,
    height: ICON_SIZE + 4,
    borderRadius: (ICON_SIZE + 4) / 2,
  },
  activeGlow: {
    position: "absolute",
    top: -20,
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  label: {
    fontSize: 9.5,
    letterSpacing: 0.2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});

export default TabNavigator;
