import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Chart from "../../components/Header/Chart";
import { symbolSelector } from "../../../Markets/modules/symbols";
import { changeColor } from "../../../Markets/modules/prices";
import { request } from "../../../../modules/IdealClient";
import chart from "../../../../modules/IdealClient/request/oldChart";
import { defaultChartPreferences, updateChartPreferences } from "../../../Auth/modules/preferences";
import { DetailChartPreferences, } from "../../../Auth/modules/preferences";
import store from "../../../../store";
import { useTheme } from "../../../../theme/ThemeContext";

const ChartContainer: React.FC<{ code: string, navigation: any }> = ({ code, navigation }) => {
    const dispatch = useDispatch();
    const { theme } = useTheme();

    // Redux store'dan gerekli verileri çekiyoruz
    const symbol = useSelector((state: any) => symbolSelector(state, code));
    const color = changeColor(store.getState().prices[code]?.changePercent, theme);
    const isDemo = useSelector((state: any) => state.auth.demo);
    const chartPreferences = useSelector((state: any) => state.preferences.detailChart || defaultChartPreferences);

    const previousSymbol = useRef(null);
    const previousCount = useRef(null);

    useEffect(() => {
        if (
            symbol !== previousSymbol.current ||
            chartPreferences.count !== previousCount.current
        ) {
            previousSymbol.current = symbol;
            previousCount.current = chartPreferences.count;

            if (symbol && chartPreferences.count) {
                loadData();
            }
        }
    }, [symbol?.code, chartPreferences.count]);
    const loadData = () => {
        if (symbol) {
            request(
                chart,
                symbol.composite,
                chartPreferences?.period,
                chartPreferences?.count
            );
        }
    };

    const handleUpdateChartPreferences = (preferences: DetailChartPreferences) => {
        dispatch(updateChartPreferences(preferences));
    };

    return (
        <Chart
            symbol={symbol}
            color={color}
            isDemo={isDemo}
            code={code}
            chartPreferences={chartPreferences}
            updateChartPreferences={handleUpdateChartPreferences}
            navigation={navigation}
        />
    );
};

export default ChartContainer;
