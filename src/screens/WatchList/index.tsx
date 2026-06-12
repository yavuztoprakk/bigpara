import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import HeaderSwitcherResultsContainer from "../../containers/HeaderSwitcherResultsContainer";
import flashMessage from "../../modules/flashMessage";
import ListContainer from "../Markets/containers/ListContainer";
import Blank from "./Blank";
import { remove } from "./modules/watchlists";
import SelectorTrigger from "./SelectorTrigger";
import { wssControl, request } from "../../modules/IdealClient";
import { SEP2 } from "../../modules/IdealClient/constants";
import symbolSend from "../../modules/IdealClient/request/symbolSend";
import { syncWatchlists } from "../../modules/FintablesClient";
import { useTheme } from "../../theme/ThemeContext";
import PushNotificationRedirector from "../Markets/components/PushNotificationRedirector";
import MastheadBanner from "../../modules/ads/MastheadBanner";
import type { AdTargeting } from "../../modules/ads/config";
import { NewsCarousel, API_URL as NEWS_API_URL, type NewsItem } from "../News/components/News";

// Ekranım = WatchList ekranı → anasayfa bucket (Excel'deki ad unit'ler)
const AD_TARGETING: AdTargeting = {
  bigpara_kategori: "ekranim",
  catlist: ["ekranim"],
};

const WatchList = ({ navigation }: { navigation: any }) => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";
  const styles = createStyles(theme);
  const [oldCount, setOldCount] = useState<number | null>(null);
  const dispatch = useDispatch();

  // Manşet slider'ı için haber listesi (Haberler ekranındaki carousel ile aynı API).
  const [headlines, setHeadlines] = useState<NewsItem[]>([]);
  useEffect(() => {
    let active = true;
    axios
      .get(NEWS_API_URL, { timeout: 7000 })
      .then((res) => {
        if (active) setHeadlines(res.data?.DataSourceContent?.Contents ?? []);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const openNewsDetail = useCallback(
    (item: NewsItem) => {
      // WatchList stack'i içinde NewsDetail aç — header'da geri butonu ve
      // geri tıklayınca Ekranım'a döner.
      navigation.navigate("NewsDetail", { url: item.Url, title: item.Title });
    },
    [navigation]
  );

  // Redux state'lerini alıyoruz
  const lists = useSelector((state: any) => state.watchLists.lists);
  const selectedIndex = useSelector((state: any) => state.watchLists.selectedIndex);
  const username = useSelector((state: any) => state.auth?.user?.username);
  const query = useSelector((state: any) => state.ui.search.query.trim());

  const canRemove = selectedIndex > 0;

  const handleRemove = (cb: Function) => {
    Alert.alert(
      "Takip Listesi",
      `Silmek istediğinize emin misiniz?`,
      [
        {
          text: "Evet",
          onPress: () => {
            flashMessage({
              type: "success",
              message: "Takip listeniz başarıyla silindi.",
            });

            if (cb) {
              cb();
            }

            dispatch(remove(lists[selectedIndex]));
          },
        },
        { text: "Vazgeç", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const navigateToEdit = () =>
    navigation.navigate("WatchListEditor", {
      watchList: lists[selectedIndex],
      canRemove,
      onPressRemove: handleRemove,
    });

  useEffect(() => {
    setOldCount(lists.length);

    if (oldCount !== null && lists.length !== oldCount) {

      syncWatchlists({ username: username, data: lists })
        .catch(() =>
          flashMessage({
            duration: 10000,
            message: "Takip listeniz senkronize edilirken hata oluştu.",
            type: "danger",
          })
        );
    }
  }, [lists]);


  useEffect(() => {
    if (wssControl === "connect") {
      const prefixler = lists[selectedIndex]?.codes
        // undefined ve boş string’leri de filtrelemek için:
        .filter((symbol: string) => !!symbol && !symbol.startsWith("separator"));
      const formattedString = prefixler?.join(SEP2);
      if (formattedString) {
        request(symbolSend, " ", formattedString);
      }
    }
  }, [lists[selectedIndex]?.codes]);
  return (
    <View style={styles.container}>
      <PushNotificationRedirector navigation={navigation} />

      <MastheadBanner bucket="anasayfa" targeting={AD_TARGETING} />

      {headlines.length > 0 && (
        <NewsCarousel
          data={headlines}
          isDark={isDark}
          theme={theme}
          onItemPress={openNewsDetail}
        />
      )}

      <View style={styles.filterBar}>
        <SelectorTrigger
          list={lists[selectedIndex]}
          navigation={navigation}
          canRemove={canRemove}
          onPressRemove={handleRemove}
        />
      </View>

      <View style={styles.listArea}>
        {lists[selectedIndex]?.codes?.length === 0 ? (
          <Blank
            onPressEdit={navigateToEdit}
            canRemove={canRemove}
            onPressRemove={handleRemove}
          />
        ) : (
          <ListContainer
            watchlist
            codes={lists[selectedIndex]?.codes}
            contentLoader={username === "akgck" ? null : true}
            navigation={navigation}
          />
        )}
      </View>

      {query ? (
        <HeaderSwitcherResultsContainer
          position="right"
          onSelect={(code: string) => {
            navigation.navigate("Detail", { code: code });
          }}
        />
      ) : null}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1 },
  filterBar: {
    borderTopWidth: 1,
    borderTopColor: theme.darkBrand,
  },
  // Liste alanı kalan boşluğu kaplasın; badge altında doğal yer açılır.
  listArea: { flex: 1 },
});

export default WatchList;
