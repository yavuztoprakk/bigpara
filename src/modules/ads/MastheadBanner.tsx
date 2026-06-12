import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { GAMBannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_UNITS, AdBucket, AdTargeting, buildTargeting } from "./config";
import { useAdReloadKey } from "./useAdReloadKey";

type Props = {
  bucket: AdBucket;
  targeting: AdTargeting;
};

// Sayfa başına eklenen masthead reklam (multi-size).
// - anasayfa (Ekranım): 320x50 + 320x100
// - diger (tüm diğer ekranlar): 320x50 + 320x100 + 300x250
const SIZES_BY_BUCKET: Record<AdBucket, BannerAdSize[]> = {
  anasayfa: [BannerAdSize.BANNER, BannerAdSize.LARGE_BANNER],
  diger: [
    BannerAdSize.BANNER,
    BannerAdSize.LARGE_BANNER,
    BannerAdSize.MEDIUM_RECTANGLE,
  ],
};

const MastheadBanner: React.FC<Props> = ({ bucket, targeting }) => {
  const reloadKey = useAdReloadKey();
  return (
    <View style={styles.container}>
      <GAMBannerAd
        key={reloadKey}
        unitId={AD_UNITS.masthead(bucket)}
        sizes={SIZES_BY_BUCKET[bucket]}
        requestOptions={{ customTargeting: buildTargeting(targeting) }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});

export default memo(MastheadBanner);
