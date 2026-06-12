import React, { useLayoutEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import ListContainer from "../containers/ListContainer";
import HeaderSwitcher from "../../../components/HeaderSwitcher";
import HeaderSwitcherResultsContainer from "../../../containers/HeaderSwitcherResultsContainer";
import PushNotificationRedirector from "./PushNotificationRedirector";
import ListDelayedBadge from "./ListDelayedBadge";
import MastheadBanner from "../../../modules/ads/MastheadBanner";
import MediumBanner from "../../../modules/ads/MediumBanner";
import LazyAdSlot from "../../../modules/ads/LazyAdSlot";
import type { AdTargeting } from "../../../modules/ads/config";

interface Props {
  navigation: any;
}

// Türkçe başlığı GAM-uyumlu slug'a çevirir: "BIST 100" → "bist100"
const slugify = (s: string) =>
  s
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "");

const MarketsList: React.FC<Props> = ({ navigation }) => {
  const route = useRoute<any>();
  const categorySlug = useMemo(
    () => slugify(route.params?.title ?? "liste"),
    [route.params?.title]
  );
  const targeting: AdTargeting = useMemo(
    () => ({
      bigpara_kategori: categorySlug,
      catlist: ["c1_piyasalar", `c2_${categorySlug}`],
    }),
    [categorySlug]
  );

  // theme deps array'de gereksizdi, useTheme çağrısı da kaldırıldı.
  const isDemo = useSelector((state: any) => state.auth.demo);

  const onSelectSymbol = useCallback(
    (code: any) => navigation.navigate("Detail", { code }),
    [navigation]
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={s.headerRight}>
          <HeaderSwitcher onSelect={onSelectSymbol} code={""} />
        </View>
      ),
    });
  }, [navigation, onSelectSymbol]);

  return (
    <View style={s.container}>
      <PushNotificationRedirector navigation={navigation} />
      <View style={s.listArea}>
        <ListContainer
          headerAd={<MastheadBanner bucket="diger" targeting={targeting} />}
          footerAd={
            <LazyAdSlot reservedHeight={250}>
              <MediumBanner bucket="diger" targeting={targeting} />
            </LazyAdSlot>
          }
        />
      </View>
      {isDemo && <ListDelayedBadge navigation={navigation} />}
      <HeaderSwitcherResultsContainer
        position="right"
        onSelect={onSelectSymbol}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: { flex: 1 },
  // Liste, badge ve tab bar üstüne kalan tüm alanı doldursun.
  listArea: { flex: 1 },
  headerRight: { paddingRight: 15 },
});

export default MarketsList;
