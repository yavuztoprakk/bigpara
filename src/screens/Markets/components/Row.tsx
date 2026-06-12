// Row.tsx
import React from "react";
import { TouchableHighlight } from "react-native";
import TickerRow from "../../../components/TickerRow";
import TickerRowSquare from "../../../components/TickerRowSquare";
import { Option } from "../../../components/BottomSheet/Select";

interface RowProps {
    code: string;
    columns: string[];
    symbol: any;
    onPress: () => void;
    onSwipeLeftOpen: () => void;
    rightSwipeOption: Option;
    navigation: any;
}

export const Row: React.FC<RowProps> = ({
    code,
    columns,
    symbol,
    onPress,
}) => {
    return (
        <TouchableHighlight onPress={onPress}>
            <TickerRow columns={columns} code={code} symbol={symbol} />
        </TouchableHighlight>
    );
};

export const RowSquare: React.FC<RowProps> = ({
    code,
    columns,
    symbol,
    onPress,
}) => {
    return (
        <TouchableHighlight onPress={onPress}>
            <TickerRowSquare columns={columns} code={code} symbol={symbol} />
        </TouchableHighlight>
    );
};
