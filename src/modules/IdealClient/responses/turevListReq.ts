import { AppDispatch } from "../../../store";
import { SEP1 } from "../constants";
import { updateBrokerages, Brokerage, BrokerageList } from "../../../screens/TUREVLIST/modules/turevlist";

export const turevList = async (
    store: { dispatch: AppDispatch },
    message: string
) => {
    const stringList = message.split(SEP1);

    const brokerages: BrokerageList = stringList.map(row => {
        return { values: row } as Brokerage;
    });

    store.dispatch(updateBrokerages(brokerages));
};

