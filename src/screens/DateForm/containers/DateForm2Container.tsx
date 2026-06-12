import React from "react";
import DateFormTrigger from "../components/DateFrom2Trigger";

const DateFormContainer = ({ open, attachment, changeAttachment }) => {
  return <DateFormTrigger open={open} attachment={attachment} changeAttachment={changeAttachment} />;
};

export default DateFormContainer;
