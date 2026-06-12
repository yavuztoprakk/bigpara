import React from "react";
import { Image, View } from "react-native";
import { useTheme } from "../../../theme/ThemeContext";
import BoldText from "../../../components/BoldText";
import Text from "../../../components/Text";

const RISK_CATEGORIES = [
    { label: "Yüksek riskli", color: "#EE3124", value: "V" },
    { label: "Riskli, kısa vadeli al-sat", color: "#EEE124", value: "H" },
    { label: "Dengeli, yatırım yapılabilir", color: "#13B220", value: "M" },
    { label: "Düşük riskli", color: "#0F81E3", value: "L" },
];

const infoYatirimIcons = {
    dark: require("../../../../assets/icon.png"),
    light: require("../../../../assets/icon.png"),
    infoTheme: require("../../../../assets/icon.png"),
};

const RiskCategories: React.FC = () => {
    const { theme } = useTheme();

    const columns = [
        { label: "Delta Değeri", valueKey: "delta" },
        {
            label: "Kalan Gün 15'ten Az",
            valueKey: "vadeKucuk15",
            render: (val: string | number) => (
                <View
                    style={{
                        height: 11,
                        width: 11,
                        marginRight: 5,
                        borderRadius: 15,
                        backgroundColor: theme[val],
                    }}
                />
            ),
        },
        {
            label: "Kalan Gün 15'ten Fazla",
            valueKey: "vadeBuyuk15",
            render: (val: string | number) => (
                <View
                    style={{
                        height: 11,
                        width: 11,
                        marginRight: 5,
                        borderRadius: 15,
                        backgroundColor: theme[val],
                    }}
                />
            ),
        },
    ];

    const data = [
        { delta: "%10'dan az", vadeKucuk15: "red", vadeBuyuk15: "red" },
        { delta: "%10 - %30", vadeKucuk15: "red", vadeBuyuk15: "yellow" },
        { delta: "%30 - %60", vadeKucuk15: "red", vadeBuyuk15: "green" },
        { delta: "%60 - %100", vadeKucuk15: "red", vadeBuyuk15: "blue" },
    ];

    return (
        <View
            style={{
                paddingTop: 20,
                marginTop: 20,
                paddingBottom: 100,
                paddingHorizontal: 15,
                backgroundColor: theme.darkestBrand,
            }}
        >
            <View
                style={{
                    marginBottom: 15,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <View>
                    <Image
                        source={infoYatirimIcons["dark"]}
                        style={{
                            height: 22,
                            width: 100,
                            marginBottom: 5,
                            resizeMode: "contain",
                        }}
                    />
                    <BoldText style={{ color: theme.white, fontSize: 16 }}>
                        Risk Kategorileri
                    </BoldText>
                </View>
            </View>
            <View
                style={{
                    backgroundColor: theme.darkerBrand,
                    paddingTop: 10,
                }}
            >
                <View style={{ paddingHorizontal: 10 }}>
                    {RISK_CATEGORIES.map((riskCategory) => (
                        <View
                            key={riskCategory.value}
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <View
                                style={{
                                    height: 11,
                                    width: 11,
                                    marginRight: 5,
                                    borderRadius: 15,
                                    backgroundColor: riskCategory.color,
                                }}
                            />
                            <Text
                                style={{
                                    color: theme.primaryText,
                                    flex: 1,
                                }}
                            >
                                {riskCategory.label}
                            </Text>
                        </View>
                    ))}
                </View>

                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            borderBottomWidth: 1,
                            borderColor: theme.darkBrand,
                        }}
                    >
                        {columns.map((col) => (
                            <View
                                key={col.label}
                                style={{
                                    flex: 1,
                                    padding: 10,
                                    justifyContent: "center",
                                }}
                            >
                                <BoldText
                                    style={{
                                        textAlign: "center",
                                        color: theme.primaryText,
                                    }}
                                >
                                    {col.label}
                                </BoldText>
                            </View>
                        ))}
                    </View>

                    {data.map((d, i) => (
                        <View
                            key={i}
                            style={{
                                flexDirection: "row",
                                borderBottomWidth:
                                    i === data.length - 1 ? 0 : 1,
                                borderColor: theme.darkBrand,
                            }}
                        >
                            {columns.map((col) => (
                                <View
                                    key={col.valueKey}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    {col.render ? (
                                        col.render(d[col.valueKey])
                                    ) : (
                                        <Text
                                            style={{
                                                textAlign: "center",
                                                color: theme.primaryText,
                                            }}
                                        >
                                            {d[col.valueKey]}
                                        </Text>
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default RiskCategories;
