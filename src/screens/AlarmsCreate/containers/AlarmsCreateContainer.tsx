import React from "react";
import { useSelector, useDispatch } from "react-redux";
import AlarmsCreate from "../components/AlarmsCreate";
import { save } from "../modules/create";
import { close } from "../../../modules/bottomSheet";

const AlarmsCreateContainer: React.FC = () => {
  const dispatch = useDispatch();
  // Redux state'e erişim
  const alarmsCreateState = useSelector((state: any) => state.alarms.create);

  const handleClose = () => {
    dispatch(close());
  };

  const handleSave = (data: any) => {
    dispatch(save(data));
  };

  return (
    <AlarmsCreate
      {...alarmsCreateState}
      close={handleClose}
      save={handleSave}
    />
  );
};

export default AlarmsCreateContainer;
