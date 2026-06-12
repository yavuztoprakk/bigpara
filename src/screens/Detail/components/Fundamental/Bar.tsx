import React from "react";
import { BarChart } from "react-native-svg-charts";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../../../theme/ThemeContext";
import SectionTitle from "../SectionTitle";
import Text from "../../../../components/Text";
import { BarData } from "../../../../modules/fundamentals/summaries";

const Bar: React.FC<BarData> = ({ title, labels, values }) => {
    const { theme } = useTheme();
    // createStyles fonksiyonuna labels.length'i geçiriyoruz
    const styles = createStyles(theme, labels.length);

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <SectionTitle title={title} />
            </View>

            <View style={styles.chartContainer}>
                <BarChart
                    style={{ flex: 1 }}
                    data={values.map((v, i) => ({
                        svg: {
                            fill: v >= 0 ? theme.lightBlue : theme.red
                        },
                        key: `${i}`,
                        value: v
                    }))}
                    gridMin={0}
                    contentInset={{ top: 0, bottom: 5 }}
                    spacingInner={0.2}
                    yAccessor={({ item }) => item.value}
                >
                    {/*   <Grid /> */}
                </BarChart>

                <View style={styles.labelsContainer}>
                    {labels.map((label, i) => (
                        <Text
                            key={`${i}`}
                            style={styles.labelText}
                        >
                            {label}
                        </Text>
                    ))}
                </View>
            </View>
        </View>
    );
};

const createStyles = (theme: { darkerBrand: any; primaryText: any; }, labelCount: number) => StyleSheet.create({
    container: {
        height: 150,
        backgroundColor: theme.darkerBrand,
        paddingBottom: 15,
        marginTop: 15,
        marginHorizontal: 15
    },
    titleContainer: {
        height: 60,
    },
    chartContainer: {
        paddingHorizontal: 15,
        flex: 1,
    },
    labelsContainer: {
        flexDirection: "row",
    },
    labelText: {
        textAlign: "center",
        width: `${(100 / labelCount).toFixed(2)}%`, // labelCount burada kullanılıyor
        fontSize: 10,
        color: theme.primaryText
    }
});

export default Bar;
