import React from "react";
import { useDispatch, useSelector } from "react-redux";
import ListSelector from "../components/ListSelector";
import { close } from "../../../modules/bottomSheet";
import { select } from "../modules/lists";

const ListSelectorContainer: React.FC = ({ navigation, open }) => {
  const dispatch = useDispatch();
  const selected = useSelector((state: any) => state.markets.lists.selected);

  const handleClose = () => {
    dispatch(close());
  };

  const handleSelect = (selection: any) => {
    dispatch(select(selection));
  };

  return (
    <ListSelector
      selected={selected}
      close={handleClose}
      select={handleSelect} open={open} navigation={navigation} />
  );
};

export default ListSelectorContainer;
