import React, { memo } from "react";
import { View, StyleSheet } from "react-native";
import { GAMBannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { AD_UNITS, AdBucket, AdTargeting, buildTargeting } from "./config";
import { useAdReloadKey } from "./useAdReloadKey";

type Props = {
  bucket: AdBucket;
  // Liste içinde kaçıncı feed reklamı (1..5)
  slot: 1 | 2 | 3 | 4 | 5;
  targeting: AdTargeting;
};

// Liste içine inject edilen 300x250 feed reklamı.
// Brief: "3 kartta 1 feed reklam, max 5" (Piyasa Özeti)
//        "5 haberde 1 feed reklam" (Haberler)
const FeedAd: React.FC<Props> = ({ bucket, slot, targeting }) => {
  const unitId = AD_UNITS.feed(bucket, slot);
  const reloadKey = useAdReloadKey();
  return (
    <View style={styles.container}>
      <GAMBannerAd
        key={reloadKey}
        unitId={unitId}
        sizes={[BannerAdSize.MEDIUM_RECTANGLE]}
        requestOptions={{ customTargeting: buildTargeting(targeting) }}
        onAdLoaded={() => console.log("[ADS] FeedAd loaded:", unitId)}
        onAdFailedToLoad={(err) =>
          console.warn("[ADS] FeedAd FAILED:", unitId, err?.message)
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    width: "100%",
  },
});

export default memo(FeedAd);
