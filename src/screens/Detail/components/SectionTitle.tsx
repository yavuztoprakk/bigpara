import React from "react";
import { View, StyleSheet } from "react-native";
import BoldText from "../../../components/BoldText";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
    title: string;
    right?: string;
}

const SectionTitle: React.FC<Props> = ({ title, right }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <BoldText style={styles.title}>{title}</BoldText>
            {right && (
                <BoldText style={styles.rightText}>{right}</BoldText>
            )}
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        flexDirection: "row",
        flex: 1,
    },
    title: {
        color: theme.white,
        flexGrow: 1,
    },
    rightText: {
        color: theme.white,
        textAlign: "right",
    },
});

export default SectionTitle;
