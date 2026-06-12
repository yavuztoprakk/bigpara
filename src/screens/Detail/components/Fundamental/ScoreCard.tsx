import React from "react";
import { ProgressCircle } from "react-native-svg-charts";
import BoldText from "../../../../components/BoldText";
import { useTheme } from "../../../../theme/ThemeContext";

interface Props {
    title: string;
    score: number;
}

const ScoreCard: React.FC<Props> = ({ title, score }) => {
    const { theme } = useTheme(); // theme'i useTheme ile çekiyoruz

    return (
        <React.Fragment>
            <ProgressCircle
                style={{ height: 50 }}
                strokeWidth={6}
                progress={score / 6}
                progressColor={theme.green}
                backgroundColor={theme.red}
            />
            <BoldText
                style={{
                    textAlign: "center",
                    color: theme.white,
                    marginTop: 10,
                }}
            >
                {title}
            </BoldText>
        </React.Fragment>
    );
};

export default ScoreCard;
