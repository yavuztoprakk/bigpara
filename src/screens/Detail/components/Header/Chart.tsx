import React, { useMemo, useState } from "react";
import Svg, { Path } from "react-native-svg";
import { View, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import { Symbol } from "../../../Markets/modules/symbols";
import ChartOptions from "./ChartOptions";
import { DetailChartPreferences } from "../../../Auth/modules/preferences";
import { modulusTimeframeOptions } from "../../../DateForm/modules/dateForm";
import flashMessage from "../../../../modules/flashMessage";
import { useSelector } from "react-redux";
import { chartSelector } from "../../../Markets/modules/chart";
import { Text } from "react-native";
import LottieView from "lottie-react-native";
export interface ChartProps {
    color: string;
    symbol: Symbol;
    chartPreferences: DetailChartPreferences;
    updateChartPreferences: (preferences: DetailChartPreferences) => void;
    navigation: any;
    isDemo: boolean;
    code: string;
}

const Chart: React.FC<ChartProps> = ({
    color,
    symbol,
    chartPreferences,
    updateChartPreferences,
    navigation,
    isDemo,
    code
}) => {
    const data = useSelector((state: any) =>
        chartSelector(
            state,
            code,
            chartPreferences.period,
            chartPreferences.count,
            "close"
        )
    );
    const { theme } = useTheme(); // theme'i useTheme ile çekiyoruz
    const styles = createStyles(theme);
    const [isLoading, _setIsLoading] = useState(true);



    const chartData = useMemo(() => {
        try {
            if (!Array.isArray(data)) return null;

            const values = data
                .map((d) => (typeof d === "number" ? d : Number(d)))
                .filter((v) => typeof v === "number" && !isNaN(v));

            if (values.length <= 1) return null;

            const width = Dimensions.get("window").width;
            const height = 135;
            const padding = 5;

            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const range = maxValue - minValue || 1;

            const xStep = (width - padding * 2) / (values.length - 1);

            const points = values
                .map((value, index) => {
                    const x = padding + index * xStep;
                    const y =
                        height -
                        padding -
                        ((value - minValue) / range) * (height - padding * 2);
                    return `${x},${y}`;
                })
                .join(" ");

            return {
                width,
                height,
                areaPath: `M${padding},${height - padding} ${points} L${width - padding},${height - padding} Z`,
                linePath: `M${points}`,
            };
        } catch (error) {
            console.error("Chart veri işleme hatası:", error);
            return null;
        }
    }, [data]);

    if (!chartData) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                {isLoading ? (
                    <LottieView
                        source={require("../../../../../assets/lottie/loading-dots.json")}
                        autoPlay
                        loop
                        renderMode="HARDWARE"
                        style={{ width: 50, height: 50 }}
                    />
                ) : (
                    <Text style={styles.errorText}>Yeterli veri bulunamadı</Text>
                )}
            </View>
        );
    }
    return (
        <View style={styles.container}>
            <Svg width={chartData.width} height={chartData.height}>
                <Path d={chartData.areaPath} fill={theme.darkerBrand} opacity={0.5} />
                <Path
                    d={chartData.linePath}
                    stroke={color}
                    strokeWidth={2}
                    fill="none"
                />
            </Svg>
            <View style={[styles.optionsContainer, { backgroundColor: theme.darkerBrand }]}>
                <ChartOptions
                    chartPreferences={chartPreferences}
                    updateChartPreferences={updateChartPreferences}
                    navigateToTechnicalAnalysis={
                        isDemo
                            ? () =>
                                flashMessage({
                                    type: "danger",
                                    message:
                                        "Bu sayfayı görüntülemek için Müşteri Girişi yapmanız gerekmektedir.",
                                })
                            : () =>
                                navigation.navigate("DetailTradingView", {
                                    code: symbol.code,
                                    days: "G",
                                    options: modulusTimeframeOptions,
                                })
                    }
                    navigatePivot={
                        isDemo
                            ? () =>
                                flashMessage({
                                    type: "danger",
                                    message:
                                        "Bu sayfayı görüntülemek için Müşteri Girişi yapmanız gerekmektedir.",
                                })
                            : () =>
                                navigation.navigate("PivotDetail", {
                                    code: symbol.code,
                                })
                    }
                />
            </View>
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            height: 193,
        },
        chart: {
            height: 135,
            marginRight: -1,
            marginLeft: -1,
            marginBottom: -2,
        },
        optionsContainer: {
            height: 60,
            paddingTop: 20,
            marginBottom: 15,
        },
        centerContent: {
            justifyContent: "center",
            alignItems: "center",
        },
        errorText: {
            color: theme.white,
            fontSize: 14,
            textAlign: "center",
        },
    });

export default Chart;
