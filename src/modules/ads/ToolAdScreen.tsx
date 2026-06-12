import React, { createContext, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import type { AdTargeting } from "./config";

type Props = {
  // bigpara_kategori değeri, örn: "elliott-analizi"
  category: string;
  // Opsiyonel ek catlist segmentleri (varsayılan: sadece [category])
  catlist?: string[];
  children: React.ReactNode;
};

// Tool ekranlarının ScrollView/FlatList sonunda ToolFooterAd üzerinden
// MediumBanner render edebilmesi için context. Bkz: ToolFooterAd.tsx
export const ToolAdContext = createContext<AdTargeting | null>(null);

// Tools/Analiz altındaki tüm ekranlar için ortak reklam sarmalayıcısı.
// Hem masthead hem alttaki MediumBanner artık burada DEĞİL — her tool ekranı
// kendi scroll içeriğinin başına <ToolMastheadAd /> ve sonuna <ToolFooterAd />
// ekler. Böylece masthead scroll edildiğinde yukarı kayıp gizlenebilir.
const ToolAdScreen: React.FC<Props> = ({ category, catlist, children }) => {
  const targeting = useMemo<AdTargeting>(
    () => ({
      bigpara_kategori: category,
      catlist: ["c1_analiz", `c2_${category}`, ...(catlist ?? [])],
    }),
    [category, catlist]
  );

  return (
    <ToolAdContext.Provider value={targeting}>
      <View style={styles.root}>{children}</View>
    </ToolAdContext.Provider>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default ToolAdScreen;
