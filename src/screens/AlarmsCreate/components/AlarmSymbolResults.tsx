import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useSelector } from "react-redux";
import BoldText from "../../../components/BoldText";
import { useTheme } from "../../../theme/ThemeContext";
import { request } from "../../../modules/IdealClient";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";

interface Props {
    query: string;
    onSelect: (code: string) => void;
    onQueryChange: (query: string) => void;
}

const AlarmSymbolResults: React.FC<Props> = ({ query, onSelect, onQueryChange }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [filteredSymbols, setFilteredSymbols] = useState<string[]>([]);

    const symbols = useSelector((state: any) => state.symbols);
    const data1 = useSelector((state: any) => state.symbolBrokerages);
    const isDemo = useSelector((state: any) => state.auth.demo);

    useEffect(() => {
        if (query.length >= 2) {
            /* if (!isDemo && data1.length > 0) {
                // Real broker data - filtrele sadece IMKBH ve E
                const filtered = data1
                    .filter((code: string) => {
                        const symbolCode = code.split('--')[0].replace('=', '');
                        const symbol = symbols[symbolCode];
                        return symbol &&
                            symbol.prefix === "IMKBH" &&
                            symbol.seriNo === "E" &&
                            symbolCode.toUpperCase().startsWith(query.toUpperCase());
                    })
                    .sort((a: string, b: string) => {
                        const aOrder = parseInt(a.split("=")[1]) || 0;
                        const bOrder = parseInt(b.split("=")[1]) || 0;
                        return aOrder - bOrder;
                    })
                    .slice(0, 10) // Maksimum 10 sonuç
                    .map((code: string) => code.split('--')[0].replace('=', ''));

                setFilteredSymbols(filtered);
            } else { */
            // Demo data - codeSearchSelector mantığını kullan ve sonra filtrele
            const allCodes = Object.keys(symbols)
                .filter((code: string) =>
                    code.toUpperCase().startsWith(query.toUpperCase())
                );

            // Sonra sadece IMKBH prefix ve E seriNo olanları filtrele
            const filtered = allCodes
                // .filter((code: string) => {
                // 	const symbol = symbols[code];
                // 	return symbol &&
                // 		symbol.prefix === "IMKBH" &&
                // 		symbol.seriNo === "E";
                // })
                .sort((a, b) => a.localeCompare(b))

            setFilteredSymbols(filtered);
            //}
        } else {
            setFilteredSymbols([]);
        }
    }, [query, symbols, data1, isDemo]);

    const handleSelect = (code: string) => {
        if (code) {
            request(symbolSend, " ", code);
        }
        setTimeout(() => {
            //Keyboard.dismiss();
            onQueryChange("");
            onSelect(code);
        }, 150);
    };

    const renderItem = ({ item }: { item: string }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelect(item)}
        >
            <BoldText style={styles.itemText}>{item}</BoldText>
        </TouchableOpacity>
    );

    // Query 2 karakterden az ise hiçbir şey gösterme
    if (query.length < 2) {
        return null;
    }

    // Sonuç yoksa mesaj göster
    if (filteredSymbols.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.noResults}>
                    <BoldText style={styles.noResultsText}>
                        Sonuç bulunamadı.
                    </BoldText>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredSymbols}
                renderItem={renderItem}
                keyExtractor={(item) => item}
                style={styles.list}
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        backgroundColor: theme.darkerBrand,
        borderRadius: 8,
        marginHorizontal: 15,
        marginTop: 5,
        maxHeight: 200,
        borderWidth: 1,
        borderColor: theme.separator,
    },
    list: {
        maxHeight: 200,
    },
    item: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.separator,
    },
    itemText: {
        color: theme.white,
        fontSize: 16,
    },
    noResults: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        alignItems: "center",
    },
    noResultsText: {
        color: theme.primaryText,
        fontSize: 14,
    },
});

export default AlarmSymbolResults;