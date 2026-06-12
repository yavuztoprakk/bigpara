import React, { useContext } from "react";
import MediumBanner from "./MediumBanner";
import LazyAdSlot from "./LazyAdSlot";
import { ToolAdContext } from "./ToolAdScreen";

// Tool ekranlarının ScrollView/FlatList içeriğinin EN SONUNA yerleştirilir.
// Targeting'i parent ToolAdScreen Context'inden alır; böylece her tool ekranı
// kendi içerik scroll'u sonunda 300x250 MediumBanner gösterebilir.
// LazyAdSlot ile sarılı — banner viewport'a girene kadar request atılmaz.
const ToolFooterAd: React.FC = () => {
  const targeting = useContext(ToolAdContext);
  if (!targeting) return null;
  return (
    <LazyAdSlot reservedHeight={250}>
      <MediumBanner bucket="diger" targeting={targeting} />
    </LazyAdSlot>
  );
};

export default ToolFooterAd;
