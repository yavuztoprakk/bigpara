import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import SectionTitle from "../SectionTitle";
import StatsRow from "../StatsRow";
import { Summary, ScoreSummary } from "../../../../modules/fundamentals/summaries";
import Title from "./Title";
import Score from "./Score";
import Bar from "./Bar";
import Text from "../../../../components/Text";
import { useTheme } from "../../../../theme/ThemeContext";
import { Stats as StatsModel } from "../../../Markets/modules/stats";
import store from "../../../../store";

const numeral = require("numeral");

interface FundamentalProps extends Summary {
    onPressScores: (data: ScoreSummary[]) => void;
    onPressSheets: (type: string) => void;
    onPressMeta: () => void;
    isDemo: boolean;
    statsData?: StatsModel;
    code: string;

}

const Fundamental: React.FC<FundamentalProps> = ({
    data,
    loading,
    error,
    onPressScores,
    onPressSheets,
    onPressMeta,
    isDemo,
    statsData,
    code
}) => {

    const fkValue = statsData && statsData[code] && statsData[code].fk
        ?
        statsData[code].fk :
        "";

    const updatedInfo = [
        {
            title: "Fiili Dolaşım",
            value: statsData[code]?.outstandingShares ?? "-"
        },
        {
            title: "Ödenmiş Sermaye",
            value: statsData[code]?.paidInCapital ?? "-"
        },
        {
            title: "Özkaynaklar",
            value: statsData[code]?.ownersEquity ?? "-"
        }
    ];

    const { theme } = useTheme();  // theme'i useTheme ile çekiyoruz
    const styles = createStyles(theme);
    return (
        <View style={styles.container}>
            <Title />

            {data && data.info && (
                <View style={styles.infoContainer}>
                    <SectionTitle title={data.info[0].value} />
                    {updatedInfo.slice(0).map((row) => {
                        const cleanValue =
                            typeof row.value === "string"
                                ? row.value.replace(/,/g, "") // "400,000,000" => "400000000"
                                : row.value;

                        return (
                            <StatsRow
                                key={row.title}
                                label={row.title}
                                value={
                                    cleanValue > 1000
                                        ? numeral(cleanValue).format("0.00 a").toString()
                                        : cleanValue
                                }
                            />
                        );
                    })}
                    <TouchableOpacity onPress={onPressMeta}>
                        <Text style={styles.linkText}>Şirket Profilini Görüntüle</Text>
                    </TouchableOpacity>
                </View>
            )}

            {data && data.scores && !isDemo && (
                <Score onPress={() => onPressScores(data.scores)} data={data.scores} />
            )}

            {data && data.multiples && (
                <View style={styles.multiplesContainer}>
                    <SectionTitle title="Çarpanlar" />
                    {data.multiples.map((row) => {
                        return (
                            <StatsRow
                                key={row.title}
                                label={row.title}
                                value={
                                    row.title === "F/K"
                                        ? fkValue?.includes(".")
                                            ? fkValue?.replace(".", ",")
                                            : fkValue
                                        : row.title === "PD/DD"
                                            ? store.getState().prices[code]?.S?.toFixed(2) || numeral(row.value).format("0.00").toString()
                                            : numeral(row.value).format("0.00").toString()
                                }
                            />
                        );
                    })}
                </View>
            )}

            {data && data.income && !isDemo && (
                <TouchableOpacity onPress={() => onPressSheets("income")}>
                    <View style={styles.incomeContainer}>
                        <SectionTitle title="Özet Gelir Tablosu" right={data.income.period} />
                        {data.income.data.map((row) => (
                            <StatsRow
                                key={row.title}
                                label={row.title}
                                value={numeral(row.value).format("0.00 a").toString()}
                            />
                        ))}
                        <Text style={styles.linkText}>Tüm Gelir Tablosunu Görüntüle</Text>
                    </View>
                </TouchableOpacity>
            )}

            {data && data.balance && !isDemo && (
                <TouchableOpacity onPress={() => onPressSheets("balance")}>
                    <View style={styles.balanceContainer}>
                        <SectionTitle title="Özet Bilanço" right={data.balance.period} />
                        {data.balance.data.map((row, index) => (
                            <StatsRow
                                key={`${row.title}-${index}`}
                                label={row.title}
                                value={numeral(row.value).format("0.00 a").toString()}
                            />
                        ))}
                        <Text style={styles.linkText}>Tüm Bilançoyu Görüntüle</Text>
                    </View>
                </TouchableOpacity>
            )}

            {data && data.bars && !isDemo && data.bars.map((bar, i) => <Bar key={`${i}`} {...bar} />)}
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.darkestBrand,
        marginTop: 15,
        paddingBottom: 100,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    infoContainer: {
        marginHorizontal: 15,
        marginBottom: 15,
        backgroundColor: theme.darkerBrand,
    },
    multiplesContainer: {
        marginHorizontal: 15,
        marginTop: 15,
        backgroundColor: theme.darkerBrand,
    },
    incomeContainer: {
        marginHorizontal: 15,
        marginTop: 15,
        backgroundColor: theme.darkerBrand,
    },
    balanceContainer: {
        marginHorizontal: 15,
        marginTop: 15,
        backgroundColor: theme.darkerBrand,
    },
    linkText: {
        textAlign: "center",
        color: theme.red,
        paddingVertical: 15,
    },
});

export default Fundamental;
