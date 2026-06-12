import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import ScoreCard from "./ScoreCard";
import { TouchableOpacity } from "react-native-gesture-handler";
import { ScoreSummary } from "../../../../modules/fundamentals/summaries";
import Text from "../../../../components/Text";

interface Props {
    data: ScoreSummary[];
    onPress: () => void;
}

const Score: React.FC<Props> = ({ data, onPress }) => {
    const { theme } = useTheme(); // theme'i useTheme ile çekiyoruz
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {data.map((score, i) => (
                    <View key={`${i}`} style={{ width: i === 1 ? "40%" : "30%" }}>
                        <ScoreCard title={score.title} score={score.value} />
                    </View>
                ))}
            </View>
            <TouchableOpacity onPress={onPress}>
                <Text style={styles.linkText}>Tüm Kriterleri Görüntüle</Text>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.darkerBrand,
            marginHorizontal: 15,
            padding: 15,
            paddingBottom: 0,
        },
        row: {
            flexDirection: "row",
        },
        linkText: {
            textAlign: "center",
            color: theme.red,
            paddingVertical: 15,
            marginTop: 5,
        },
    });

export default Score;
