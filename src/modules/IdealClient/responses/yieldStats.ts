import { AppDispatch } from "../../../store"; // AppDispatch projenize göre ayarlanmalı
import { SEP1, SEP2 } from "../constants";
import { updateYieldStats, YieldStats } from "../../../screens/Markets/modules/yieldStats";

export const yieldStats = async (
    store: { dispatch: AppDispatch },
    message: string
) => {
    const [_1, _2, code, changes, _avgs, highs, lows] = message.split(SEP1);

    const changesParsed = changes.split(SEP2);
    // const avgsParsed = avgs.split(SEP2);
    const highsParsed = highs.split(SEP2);
    const lowsParsed = lows.split(SEP2);

    const titles = [
        "_",
        "_",
        "Haftalık Getiri",
        "_",
        "1 Aylık Getiri",
        "3 Aylık Getiri",
        "6 Aylık Getiri",
        "_",
        "Yıllık Getiri",
    ];

    const rows: YieldStats[] = changesParsed
        .map((change, i) => ({
            high: parseFloat(highsParsed[i]),
            low: parseFloat(lowsParsed[i]),
            change: parseFloat(change),
            title: titles[i],
        }))
        .filter((stats) => stats.title !== "_");

    store.dispatch(updateYieldStats({ code, stats: rows }));
};
