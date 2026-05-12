import React, { useLayoutEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import ListContainer from "../containers/ListContainer";
import HeaderSwitcher from "../../../components/HeaderSwitcher";
import HeaderSwitcherResultsContainer from "../../../containers/HeaderSwitcherResultsContainer";
import PushNotificationRedirector from "./PushNotificationRedirector";
import ListDelayedBadge from "./ListDelayedBadge";

interface Props {
  navigation: any;
}

const MarketsList: React.FC<Props> = ({ navigation }) => {
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
    <>
      <PushNotificationRedirector navigation={navigation} />
      {isDemo && <ListDelayedBadge navigation={navigation} />}
      <ListContainer />
      <HeaderSwitcherResultsContainer
        position="right"
        onSelect={onSelectSymbol}
      />
    </>
  );
};

const s = StyleSheet.create({
  headerRight: { paddingRight: 15 },
});

export default MarketsList;
