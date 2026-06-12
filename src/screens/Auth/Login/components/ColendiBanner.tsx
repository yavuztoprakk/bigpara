import React from "react";
import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";
import BoldText from "../../../../components/BoldText";
import { useTheme } from "../../../../theme/ThemeContext";


const ColendiBanner = ({ onPress }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
            <AntDesign
                name="login"
                size={20}
                color={theme.black}
                style={styles.icon}
            />
            <BoldText style={styles.label}>Colendi Menkul hesabınız yok mu?</BoldText>
        </TouchableOpacity>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        height: 40,
        paddingHorizontal: 15,
        backgroundColor: theme.white,
        flexDirection: "row",
        alignItems: "center",
    },
    icon: {
        marginRight: 10,
    },
    label: {
        flexGrow: 1,
        color: theme.black,
    },
});

export default ColendiBanner;
