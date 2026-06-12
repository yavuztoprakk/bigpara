import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import Text from "../../../../components/Text";
import { changeColor } from "../../../Markets/modules/prices";
import { YieldStats } from "../../../Markets/modules/yieldStats";

interface Props {
    stats: YieldStats;
    price: number;
}

const Chart: React.FC<Props> = ({ stats: { high, low, change }, price }) => {
    const { theme } = useTheme();
    const dotColor = changeColor(change, theme);
    const pos = 99 * ((price - low) / (high - low));

    return (
        <View style={{ marginTop: 15 }}>
            <Text
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    color: theme.primaryText,
                }}
            >
                Dip: {low.toFixed(2)}
            </Text>

            <Text
                style={{
                    position: "absolute",
                    right: 0,
                    top: 0,
                    color: theme.primaryText,
                }}
            >
                Zirve: {high.toFixed(2)}
            </Text>

            <View
                style={{
                    backgroundColor: theme.primaryText,
                    height: 4,
                    marginTop: 35,
                    marginBottom: 0,
                    opacity: 0.2,
                    borderRadius: 2,
                }}
            />

            <View
                style={{
                    position: "absolute",
                    left: `${pos}%`,
                    top: 31,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: dotColor,
                }}
            />
        </View>
    );
};

export default Chart;
