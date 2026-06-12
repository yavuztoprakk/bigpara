import React from "react";
import DateForm from "../components/DateForm";

const DateFormContainer = ({ open, attachment, changeAttachment }) => {
  return <DateForm open={open} attachment={attachment} changeAttachment={changeAttachment} />;
};

export default DateFormContainer;
