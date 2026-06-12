import React from "react";
import { View, StyleSheet } from "react-native";
import Text from "../../../components/Text";
import BoldText from "../../../components/BoldText";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
    label: string;
    value: string;
    color?: string;
}

const StatsRow: React.FC<Props> = ({ label, value, color }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={[styles.container, { borderBottomColor: theme.darkBrand }]}>
            <Text style={[styles.label, { color: theme.primaryText }]}>{label}</Text>
            <BoldText style={[styles.value, color ? { color } : { color: "white" }]}>{value}</BoldText>
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        borderBottomWidth: 1,
        alignItems: "center",
        height: 35,
        marginBottom: 10,
    },
    label: {
        flexGrow: 1,
        paddingLeft: 15,
    },
    value: {
        textAlign: "right",
        paddingRight: 15,
    },
});

export default StatsRow;
