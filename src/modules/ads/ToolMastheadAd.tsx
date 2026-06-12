import React, { useContext } from "react";
import MastheadBanner from "./MastheadBanner";
import { ToolAdContext } from "./ToolAdScreen";

// Tool ekranlarının ScrollView/FlatList içeriğinin EN BAŞINA yerleştirilir.
// Targeting'i parent ToolAdScreen Context'inden alır; böylece her tool ekranı
// kendi scroll içeriğinin başında masthead reklam gösterebilir.
// Scroll edildiğinde içerikle birlikte yukarı kayar ve gözden kaybolur.
// (Eskiden ToolAdScreen Masthead'i sabit üstte render ediyordu.)
const ToolMastheadAd: React.FC = () => {
  const targeting = useContext(ToolAdContext);
  if (!targeting) return null;
  return <MastheadBanner bucket="diger" targeting={targeting} />;
};

export default ToolMastheadAd;
