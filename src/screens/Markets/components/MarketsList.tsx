import React, { useLayoutEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import ListContainer from "../containers/ListContainer";
import HeaderSwitcher from "../../../components/HeaderSwitcher";
import HeaderSwitcherResultsContainer from "../../../containers/HeaderSwitcherResultsContainer";
import PushNotificationRedirector from "./PushNotificationRedirector";

interface Props {
  navigation: any;
}

const MarketsList: React.FC<Props> = ({ navigation }) => {
  // theme deps array'de gereksizdi, useTheme çağrısı da kaldırıldı.
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
