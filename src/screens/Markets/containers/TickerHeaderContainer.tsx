import React from "react";
import { useDispatch } from "react-redux";
import { open } from "../modules/columnForm";
import TickerHeader from "../../../components/TickerHeader";
interface Props {
  disableOpen?: boolean;
  // Liste tarafından (compact mode vb.) override edilen kolonlar.
  columns?: string[];
}

const TickerHeaderContainer: React.FC<Props> = ({ disableOpen, columns }) => {
  const dispatch = useDispatch();
  // Function to handle opening a column based on its index

  const handleOpen = (colIndex: number) => {
    dispatch(open(colIndex));
  };

  return <TickerHeader open={handleOpen} disableOpen={disableOpen} columns={columns} />;
};

export default TickerHeaderContainer;