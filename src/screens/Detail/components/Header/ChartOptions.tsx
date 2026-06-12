import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import BoldText from "../../../../components/BoldText";
import { useTheme } from "../../../../theme/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DetailChartPreferences } from "../../../Auth/modules/preferences";

interface ButtonProps {
    label: string;
    active?: boolean;
    style?: any;
    onPress: () => void;
}

const Button: React.FC<ButtonProps> = ({ label, active, style, onPress }) => {
    const { theme } = useTheme(); // theme'i useTheme ile çekiyoruz
    const styles = createStyles(theme);

    return (
        <TouchableOpacity onPress={onPress}>
            <View style={[styles.buttonContainer, active && styles.active, style]}>
                {style && (
                    <MaterialCommunityIcons
                        name="phone-rotate-landscape"
                        style={styles.icon}
                        color={theme.primaryText}
                        size={17}
                    />
                )}
                <BoldText style={[styles.buttonLabel, active && styles.active]}>
                    {label}
                </BoldText>
            </View>
        </TouchableOpacity>
    );
};

const options: (DetailChartPreferences & { label: string })[] = [
    { period: "G", count: 255, label: "1Y" },
    { period: "G", count: 126, label: "6A" },
    { period: "G", count: 63, label: "3A" },
    { period: "G", count: 30, label: "1A" },
];

interface Props {
    chartPreferences: DetailChartPreferences;
    updateChartPreferences: (preferences: DetailChartPreferences) => void;
    navigateToTechnicalAnalysis: () => void;
    navigatePivot: () => void;
}

const ChartOptions: React.FC<Props> = ({
    chartPreferences,
    updateChartPreferences,
    navigateToTechnicalAnalysis,
    navigatePivot,
}) => {
    const { theme } = useTheme(); // theme'i useTheme ile çekiyoruz
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {options.map(({ label, period, count }) => (
                <Button
                    key={label}
                    label={label}
                    active={
                        period === chartPreferences.period &&
                        count === chartPreferences.count
                    }
                    onPress={() => updateChartPreferences({ period, count })}
                />
            ))}
            {/* <View>
                <Button label="Pivot" onPress={navigatePivot} />
            </View> */}
            <View style={{ flexGrow: 1 }} />
            <Button
                label="Teknik"
                style={styles.rightButton}
                onPress={navigateToTechnicalAnalysis}
            />
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "row",
            paddingLeft: 5,
        },
        buttonContainer: {
            flexDirection: "row",
            marginLeft: 10,
            borderWidth: 1,
            borderColor: theme.separator,
            paddingVertical: 5,
            paddingHorizontal: 8,
            borderRadius: 5,
        },
        buttonLabel: {
            color: theme.primaryText,
            fontSize: 13,
        },
        active: {
            borderColor: theme.white,
            color: theme.white,
        },
        rightButton: {
            marginRight: 15,
        },
        icon: {
            marginRight: 5,
        },
    });

export default ChartOptions;
