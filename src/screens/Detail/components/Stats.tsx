import React, { useMemo } from "react";
import { View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import { useSelector } from "react-redux";
import StatsRow from "./StatsRow";
import {
    formatPrice,
    formatLot,
    changeColorStats,
} from "../../Markets/modules/prices";
import BoldText from "../../../components/BoldText";
import { statsSelector } from "../../Markets/modules/stats";
import { symbolSelector } from "../../Markets/modules/symbols";

const Separator: React.FC = () => {
    const { theme } = useTheme();
    return (
        <View
            style={{
                width: 15,
                height: 35,
                borderBottomWidth: 1,
                borderBottomColor: theme.darkBrand,
            }}
        />
    );
};

const equilibriumTitles = {
    4: "Açılış Seansı",
    5: "Kapanış Seansı",
    6: "Eşleşme Seansı",
    8: "Tek Fiyat İşlem",
    13: "Devre Kesici",
};

const marketGroupTitles = {
    ALT: "Alt Pazar",
    A: "Ana Pazar",
    Y: "Yıldız Pazar",
};

const fixVarantUnderlying = (val: string) => {
    if (val === "SLV") {
        return "GÜMÜŞ ONS";
    } else if (val === "GLD") {
        return "ALTIN ONS";
    } else {
        return val;
    }
};

const formatCertificateDate = (dateString: string) => {
    if (!dateString) return "";

    // YYYY-MM-DD formatını DD.MM.YYYY formatına çevir
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
};

const Stats: React.FC<{ code: string }> = ({ code }) => {
    const { theme } = useTheme();

    // Redux verilerini çekiyoruz
    const symbol = useSelector((state: any) => symbolSelector(state, code));
    const stats = useSelector((state: any) => statsSelector(state, code));
    const price = useSelector((state: any) => state.prices[code]);
    const licences = useSelector((state: any) => state.auth.user.licences);
    //const certificateData = useSelector((state: any) => getCertificateByCode(state, code));

    const hasWavgLicence = useMemo(() => {
        if (!symbol || !licences) return false;
        return symbol.prefix === "IMKBX"
            ? licences.indexOf("IMKBX") > -1 ||
            ((code === "XU030" || "XU100") && licences.indexOf("COMEX") > -1)
            : symbol.prefix === "IMKBH"
                ? licences.indexOf("IMKBL1P") > -1 ||
                licences.indexOf("IMKBL2") > -1
                : licences.indexOf("VIPL1P") > -1 ||
                licences.indexOf("VIPL2") > -1;
    }, [symbol, licences]);

    if (!symbol || !price) {
        return null; // Gerekli veriler olmadığında null döndür
    }


    // SeriNo "C" için özel durum
    if (symbol.prefix === "IMKBH" && symbol.seriNo === "C") {
        return (
            <React.Fragment>
                <View style={{ flexDirection: "row" }}>
                    <StatsRow label="Alış" value={formatPrice(price.bid, symbol)} />
                    <Separator />
                    <StatsRow label="Satış" value={formatPrice(price.ask, symbol)} />
                </View>
                <StatsRow
                    label="Ö. Kapanış"
                    value={formatPrice(price.dayClose, symbol)}
                />
                {/* <View style={{ flexDirection: "row" }}>
                    <StatsRow
                        label="P.Yapıcı Alışı"
                        value={price.marketMakerBid ? formatPrice(price.marketMakerBid, symbol) : ""}
                    />
                    <Separator />
                    <StatsRow
                        label="P.yapıcı Satış"
                        value={price.marketMakerAsk ? formatPrice(price.marketMakerAsk, symbol) : ""}
                    />
                </View> */}

                {/* Aşağıda ki Vade ve Çarpan alanları Veli abiyle kontrol edilecek. */}
                <View style={{ flexDirection: "row" }}>
                    <StatsRow
                        label="Günlük Fark"
                        value={stats?.difference}
                        color={stats && changeColorStats(parseFloat(stats.difference), theme)}
                    />
                    <Separator />
                    <StatsRow
                        label="A. Ort."
                        value={stats && hasWavgLicence && stats.wavg}
                    />
                </View>
                <View style={{ flexDirection: "row" }}>
                    <StatsRow label="Düşük" value={stats && stats.low} />
                    <Separator />
                    <StatsRow label="Yüksek" value={stats && stats.high} />
                </View>
                <View style={{ flexDirection: "row" }}>
                    {/* <StatsRow
                        label="Çarpan"
                        value={certificateData ? certificateData.multiplier.toString() : ""}
                    />
                    <Separator />
                    <StatsRow
                        label="Vade"
                        value={certificateData ? formatCertificateDate(certificateData.expiry) : ""}
                    /> */}
                </View>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            {hasWavgLicence &&
                price["V"] &&
                [4, 5, 6, 8, 13, 59, 62].indexOf(price["V"]) > -1 && (
                    <View style={{ backgroundColor: theme.darkerBrand }}>
                        <BoldText
                            style={{
                                color: theme.white,
                                paddingHorizontal: 15,
                                paddingVertical: 10,
                            }}
                        >
                            {equilibriumTitles[price["V"]]}
                        </BoldText>
                        <View
                            style={{
                                borderTopWidth: 1,
                                borderTopColor: theme.darkBrand,
                            }}
                        >
                            <StatsRow
                                label="Denge Fiyatı"
                                value={formatPrice(price["K"], symbol)}
                            />
                            <StatsRow
                                label="Denge Miktarı"
                                value={formatLot(price["M"])}
                            />
                            <StatsRow
                                label="Alışta Kalan Lot"
                                value={formatLot(price["T"])}
                            />
                            <StatsRow
                                label="Satışta Kalan Lot"
                                value={price["U"] !== 0 && formatLot(price["U"])}
                            />
                        </View>
                    </View>
                )}
            <View style={{ flexDirection: "row" }}>
                <StatsRow label="Alış" value={formatPrice(price.bid, symbol)} />
                <Separator />
                <StatsRow label="Satış" value={formatPrice(price.ask, symbol)} />
            </View>
            <View style={{ flexDirection: "row" }}>
                <StatsRow
                    label="Ö. Kapanış"
                    value={formatPrice(price.dayClose, symbol)}
                />
                <Separator />
                <StatsRow
                    label="A. Ort."
                    value={stats && hasWavgLicence && stats.wavg}
                />
            </View>
            <View style={{ flexDirection: "row" }}>
                <StatsRow label="Düşük" value={stats && stats.low} />
                <Separator />
                <StatsRow label="Yüksek" value={stats && stats.high} />
            </View>
            {symbol.canBeTraded && (
                <View style={{ flexDirection: "row" }}>
                    <StatsRow label="Taban" value={stats && stats.floor} />
                    <Separator />
                    <StatsRow label="Tavan" value={stats && stats.ceiling} />
                </View>
            )}

            {symbol.prefix === "IMKBH" && marketGroupTitles[symbol.group] && (
                <StatsRow
                    label="Pazar Grubu"
                    value={marketGroupTitles[symbol.group]}
                />
            )}

            {(symbol.prefix === "IMKBH" || symbol.prefix === "VIP") &&
                hasWavgLicence && (
                    <React.Fragment>
                        <StatsRow label="Hacim (Lot)" value={stats && stats.lot} />
                        <StatsRow label="Hacim" value={stats && stats.volume} />
                    </React.Fragment>
                )}

            {symbol.prefix === "IMKBH" && (
                <>
                    <StatsRow label="Piyasa Değeri" value={stats?.marketCap} />

                    {licences && licences.includes("PITE") === -1 && (
                        <StatsRow
                            label="Aktif İşlem Net"
                            value={stats && stats.moneyDifference}
                            color={stats && changeColorStats(parseInt(stats.moneyDifference), theme)}
                        />
                    )}
                </>
            )}

            {symbol.prefix === "VIP" && (
                <>
                    <StatsRow
                        label="Açık Pozisyon"
                        value={stats && formatLot(stats.viopOpenPosition)}
                    />
                    <StatsRow
                        label="Açık Pozisyon Fark"
                        value={stats && formatLot(stats.viopOpenPositionDifference)}
                    />
                    <StatsRow
                        label="Uzlaşı Fiyatı"
                        value={
                            stats &&
                            formatPrice(
                                parseFloat(stats.viopSettlementPrice),
                                symbol
                            )
                        }
                    />
                    <StatsRow
                        label="Önceki Uzlaşı Fiyatı"
                        value={
                            stats &&
                            formatPrice(
                                parseFloat(stats.viopPrevSettlementPrice),
                                symbol
                            )
                        }
                    />
                    <StatsRow
                        label="Teorik Fiyat"
                        value={
                            stats &&
                            formatPrice(
                                parseFloat(stats.viopTheoreticalPrice),
                                symbol
                            )
                        }
                    />
                </>
            )}

            {symbol.prefix === "IMKBH" && symbol.seriNo === "V" && (
                <React.Fragment>
                    <StatsRow
                        label="Dayanak Varlık"
                        value={stats && fixVarantUnderlying(stats.varantUnderlying)}
                    />
                    <StatsRow
                        label="İhraççı"
                        value={stats && stats.varantUnderwriter}
                    />
                    <StatsRow
                        label="Vadeye Kalan Gün"
                        value={stats && stats.varantDaysUntilExpiration}
                    />
                    <StatsRow
                        label="Vade Sonu"
                        value={stats && stats.varantExpiration}
                    />
                    <StatsRow label="Tür" value={stats && stats.varantType} />
                    <StatsRow
                        label="Kullanım Fiyatı"
                        value={stats && stats.varantExecutionPrice}
                    />
                </React.Fragment>
            )}
        </React.Fragment>
    );
};

export default Stats;
