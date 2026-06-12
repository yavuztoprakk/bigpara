import React, { memo, useEffect, useRef, useState } from "react";
import { View, Dimensions } from "react-native";

type Props = {
  // Banner mount edilene kadar yer tutacak yükseklik (dp). Layout
  // zıplamasını (CLS) önler — placeholder ile mount edilmiş hâlin
  // yüksekliği aynı olur.
  reservedHeight: number;
  // Viewport'a girmeden kaç dp önce mount başlatılsın? Default 200.
  // Kullanıcı banner'a yaklaşırken ad request başlamış olur, sayfa
  // sona erişene kadar reklam hazır gelir.
  rootMargin?: number;
  children: React.ReactNode;
};

// Polling interval — banner görünür olana kadar düzenli measure çağrılır.
// 300ms yeterli sıklıkta (kullanıcı algılayamaz) + main thread'i yormaz.
const CHECK_INTERVAL_MS = 300;

// Banner'ı viewport'a girene kadar mount ETMEYEN lazy-load wrapper.
// Bir kez mount edildikten sonra unmount edilmez (kullanıcı geri scroll
// edince banner boş kalmasın).
// Standalone — parent ScrollView/FlatList'e dokunmaz; her ekrana doğrudan
// uygulanabilir.
const LazyAdSlot: React.FC<Props> = ({
  reservedHeight,
  rootMargin = 200,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<View>(null);

  useEffect(() => {
    if (isVisible) return;

    const screenH = Dimensions.get("window").height;

    const check = () => {
      ref.current?.measureInWindow((_x, y, _w, h) => {
        // Banner'ın üst kenarı ekranın alt sınırı + rootMargin içine girdiyse
        // veya alt kenarı üst sınırın - rootMargin üstündeyse → viewport'a yakın.
        if (y < screenH + rootMargin && y + h > -rootMargin) {
          setIsVisible(true);
        }
      });
    };

    // İlk render'da hemen check (sayfa açılır açılmaz viewport içindeyse
    // beklemeden mount et).
    check();

    // Görünür değilse polling başlat.
    const intervalId = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isVisible, rootMargin]);

  return (
    <View ref={ref} style={{ minHeight: reservedHeight }}>
      {isVisible ? children : null}
    </View>
  );
};

export default memo(LazyAdSlot);
