import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Fundamental from "../components/Fundamental";
import { summarySelector, loadSummary, ScoreSummary } from "../../../modules/fundamentals/summaries";

interface Props {
    code: string;
    onPressScores: (data: ScoreSummary[]) => void;  // ScoreSummary'nin doğru tipini kullanın
    onPressSheets: (type: string) => void;
    onPressMeta: () => void;
    isDemo: boolean;
    navigation: any;
}

const FundamentalContainer: React.FC<Props> = ({
    code,
    onPressScores,
    onPressSheets,
    onPressMeta,
    isDemo,
    navigation
}) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (code) {
            dispatch(loadSummary(code));
        }
    }, [dispatch, code]);

    // `summarySelector` kullanarak state'ten gerekli veriyi alıyoruz
    const summaryData = useSelector((state) => summarySelector(state, code));
    const statsData = useSelector((state) => state.stats);

    return (
        <Fundamental
            code={code}
            data={summaryData.data}
            loading={summaryData.loading}
            error={summaryData.error}
            onPressScores={onPressScores}
            onPressSheets={onPressSheets}
            onPressMeta={onPressMeta}
            isDemo={isDemo}
            statsData={statsData}
        />
    );
};

export default FundamentalContainer;
