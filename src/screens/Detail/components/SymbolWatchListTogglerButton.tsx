import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../../theme/ThemeContext";
import { getWatchlists, syncWatchlists } from "../../../modules/FintablesClient";
import { update } from "../../WatchList/modules/watchlists";
import store from "../../../store";

interface Props {
    code: string;
}

const SymbolWatchListTogglerButton: React.FC<Props> = ({ code }) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const dispatch = useDispatch();

    const watchList = useSelector((state: any) => state.watchLists.lists[state.watchLists.selectedIndex]);
    const inWatchList = watchList?.codes?.includes(code);
    const username = useSelector((state: any) => state.auth.user.username);

    const handlePress = () => {
        const updatedCodes = inWatchList
            ? watchList.codes.filter((v: string) => v !== code)
            : [...watchList.codes, code];

        dispatch(update(updatedCodes));

        const lists = store.getState().watchLists.lists;
        getWatchlists({ username })
            .then(() => syncWatchlists({ username: username, data: lists }))
            .then(() => console.log("Watchlist başarıyla senkronize edildi"))
            .catch((error) => {
                console.error('Error while syncing watchlists:', error);
            });
    };


    return (
        <TouchableOpacity
            onPress={handlePress}
            hitSlop={{ bottom: 10, top: 10 }}
            style={styles.button}
        >
            <Ionicons
                name={"star"}
                color={inWatchList ? theme.yellow : theme.onBlue}
                size={24}
            />
        </TouchableOpacity>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        button: {
            paddingRight: 15,
        },
    });

export default SymbolWatchListTogglerButton;
