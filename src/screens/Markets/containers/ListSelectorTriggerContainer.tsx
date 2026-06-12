import React from "react";
import { useSelector } from "react-redux";
import ListSelectorTrigger from "../components/ListSelectorTrigger";
import { RootState } from "../../../store";

const ListSelectorTriggerContainer = ({ navigation }: { navigation: any }) => {
  const selectedListTitle = useSelector((state: RootState) => state.markets.lists.selected.title);

  return <ListSelectorTrigger selectedListTitle={selectedListTitle} navigation={navigation} />;
};

export default ListSelectorTriggerContainer;
