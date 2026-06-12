import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

// Banner reklam bileşenlerinin her ekran focus'unda yeni ad request atması
// için kullanılan key. Banner'a key={reloadKey} verilince focus geldiğinde
// GAMBannerAd remount olur ve fresh request gönderilir.
// İlk mount zaten request atar; ilk focus'u atlayarak çift request'i engeller.
export const useAdReloadKey = (): number => {
  const [reloadKey, setReloadKey] = useState(0);
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      setReloadKey((k) => k + 1);
    }, [])
  );

  return reloadKey;
};
