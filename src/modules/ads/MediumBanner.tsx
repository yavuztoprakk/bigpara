import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { GAMBannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_UNITS, AdBucket, AdTargeting, buildTargeting } from "./config";
import { useAdReloadKey } from "./useAdReloadKey";

type Props = {
  bucket: AdBucket;
  targeting: AdTargeting;
};

// Sayfa sonuna eklenen 300x250 reklam.
// Brief: "Piyasalar / Piyasa detay / Ekranım / Analiz sayfa sonunda 300x250"
const MediumBanner: React.FC<Props> = ({ bucket, targeting }) => {
  const unitId = AD_UNITS.medium(bucket);
  const reloadKey = useAdReloadKey();
  return (
    <View style={styles.container}>
      <GAMBannerAd
        key={reloadKey}
        unitId={unitId}
        sizes={[BannerAdSize.MEDIUM_RECTANGLE]}
        requestOptions={{ customTargeting: buildTargeting(targeting) }}
        onAdLoaded={() => console.log("[ADS] MediumBanner loaded:", unitId)}
        onAdFailedToLoad={(err) =>
          console.warn("[ADS] MediumBanner FAILED:", unitId, err?.message)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    width: "100%",
  },
});

export default memo(MediumBanner);
