import React, { useEffect, useMemo, useCallback } from "react";
import { View, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import Chart from "./Chart";
import Carousel from "react-native-reanimated-carousel";
import { useTheme } from "../../../../theme/ThemeContext";
import ChangePercentLabel from "../../../../components/ChangePercentLabel";
import BoldText from "../../../../components/BoldText";
import { yieldStatsSelector } from "../../../Markets/modules/yieldStats";
import { request } from "../../../../modules/IdealClient";
import { symbolSelector } from "../../../Markets/modules/symbols";
import yieldStats from "../../../../modules/IdealClient/request/yieldStats";

const MinMaxReport: React.FC<{ code: string }> = ({ code }) => {
    const width = Dimensions.get("window").width;

    // `useTheme` ve stil hesaplamaları
    const { theme } = useTheme();
    const styles = useMemo(
        () => ({
            container: {
                marginTop: 25,
                padding: 15,
                backgroundColor: theme.darkBrand,
                borderRadius: 20,
                marginHorizontal: 5,
            },
            changeLabel: {
                position: "absolute",
                right: 15,
                top: 15,
                textAlign: "center",
            },
            boldText: {
                color: theme.white,
            },
            carouselStyle: {
                width: width,
                height: width * 0.4,
            },
        }),
        [theme, width]
    );

    // Redux verilerini seçme
    const price = useSelector((state: any) => state.prices[code]?.lastPrice);
    const symbol = useSelector((state: any) => symbolSelector(state, code));
    const data = useSelector((state) => yieldStatsSelector(state, code));

    // Verileri yükleme
    useEffect(() => {
        if (symbol) {
            request(yieldStats, symbol.composite);
        }
    }, [symbol?.composite]);

    // Render fonksiyonunu optimize etme
    const renderItem = useCallback(
        ({ item }) => (
            <View style={styles.container}>
                <ChangePercentLabel
                    change={item.change}
                    textStyle={styles.changeLabel}
                />
                <BoldText style={styles.boldText}>{item.title}</BoldText>
                <Chart price={price} stats={item} />
            </View>
        ),
        [price, styles]
    );

    // Veri yoksa erken çıkış
    if (!data || data.length === 0) {
        return null;
    }

    // Carousel bileşeni
    return (
        <Carousel
            style={styles.carouselStyle}
            width={width - 50}
            height={width}
            loop={false}
            autoPlay={false}
            scrollAnimationDuration={500}
            data={data}
            renderItem={renderItem}
        />
    );
};

export default MinMaxReport;
