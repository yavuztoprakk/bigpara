import React from "react";
import { View, Image, StyleSheet } from "react-native";
import BoldText from "../../../../components/BoldText";
import { useTheme } from "../../../../theme/ThemeContext";

const Title: React.FC = () => {
    const { theme } = useTheme(); // theme'i useTheme ile çekiyoruz
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <Image
                source={require("../../../../../assets/bigParaSplash.png")}
                style={styles.image}
            />
            <BoldText style={styles.text}>Temel Analiz</BoldText>
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            padding: 15,
            paddingTop: 17,
            paddingLeft: 53,
        },
        image: {
            width: 25,
            height: 25,
            resizeMode: "contain",
            position: "absolute",
            left: 15,
            top: 15,
        },
        text: {
            color: theme.white,
            fontSize: 16,
        },
    });

export default Title;
