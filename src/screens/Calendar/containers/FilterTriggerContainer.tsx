import React from "react";
import { useDispatch } from "react-redux";
import { open } from "../../../modules/bottomSheet";
import FilterTrigger from "../components/FilterTrigger";

const FilterTriggerContainer = () => {
    const dispatch = useDispatch();

    const handleOpen = () => {
        dispatch(open({ type: "calendarFilterEkonomikTakvim" }));
    };

    return <FilterTrigger open={handleOpen} />;
};

export default FilterTriggerContainer;