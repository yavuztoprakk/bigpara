import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import BoldText from "../../../../components/BoldText";
import ChangePercentLabel from "../../../../components/ChangePercentLabel";
import { useTheme } from "../../../../theme/ThemeContext";
import { useSelector } from "react-redux";
import { formatPrice } from "../../../Markets/modules/prices";
import { symbolSelector } from "../../../Markets/modules/symbols";
import TickerTime from "../../../../components/TickerTime";
import Text from "../../../../components/Text";

interface PriceProps {
    code: string;
    navigation: any;
}

const Price: React.FC<PriceProps> = ({ code, navigation }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const price = useSelector((state: any) => state.prices[code]);
    const symbol = useSelector((state: any) => symbolSelector(state, code));

    const WHITELABEL = { id: "ideal" };

    const formattedPrice = useMemo(() => {
        if (!price || isNaN(price.lastPrice)) {
            return "-";
        }
        return formatPrice(
            price.lastPrice === 0 && price.ask > 0 ? price.ask : price.lastPrice,
            symbol
        );
    }, [price, symbol]);

    const priceDifference = useMemo(() => {
        if (!!price.lastPrice && !!price.dayClose) {
            const diff = price.lastPrice - price.dayClose;
            return `${price.lastPrice > price.dayClose ? "+" : ""}${formatPrice(diff, symbol)}`;
        }
        return null;
    }, [price, symbol]);

    return (
        <>
            <BoldText style={styles.price}>{formattedPrice}</BoldText>
            <View style={{ flex: 1, flexDirection: "row" }}>
                <ChangePercentLabel change={price?.changePercent} textStyle={styles.change} />
                {WHITELABEL.id === "ideal" && priceDifference && (
                    <Text style={{ color: theme.primaryText, marginTop: 2, marginLeft: 5 }}>
                        {priceDifference}
                    </Text>
                )}
                {!!price["Y"] && (
                    <TickerTime textStyle={styles.change} time={price["Y"]} />
                )}
            </View>
        </>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    price: {
        fontSize: 30,
        marginTop: 5,
        paddingLeft: 15,
        color: theme.white,
    },
    change: {
        fontSize: 18,
        paddingLeft: 15,
        marginBottom: 15,
    },
});

export default Price;
