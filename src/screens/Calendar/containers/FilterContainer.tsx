import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Filter from "../components/Filter";
// import { load } from "../modules/list";
import { close } from "../../../modules/bottomSheet";

const FilterContainer = ({ EkonomikTakvim, attachment }) => {
    const filter = useSelector((state: any) => state.calendar.list.filter);
    const dispatch = useDispatch();

    const filterProps = {
        EkonomikTakvim,
        attachment,
        ...filter,
        close: () => dispatch(close()),

    };

    return <Filter {...filterProps} />;
};

export default FilterContainer;