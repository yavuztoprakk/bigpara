import React from "react";
import { useSelector } from "react-redux";
import WatchListEditorTrigger from "../components/WatchListEditorTrigger";

interface WatchListEditorTriggerContainerProps {
    watchList: { title: string; codes: string[] };
    navigation: any;
}

const WatchListEditorTriggerContainer: React.FC<WatchListEditorTriggerContainerProps> = ({ watchList, navigation }) => {
    const show = useSelector((state: any) =>
        watchList ? true : state.markets.lists.selected.value === "watchlist"
    );

    return <WatchListEditorTrigger
        show={show}
        watchList={watchList}
        navigation={navigation}
    />;
};

export default WatchListEditorTriggerContainer;
