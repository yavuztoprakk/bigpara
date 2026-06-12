import { AppDispatch } from "../../../store";
import { SEP1, SEP2 } from "../constants";
import {
    update,
    Brokerage,
    BrokerageList
} from "../../../screens/PGC/modules/pgc";

export const pgcReq = async (
    store: { dispatch: AppDispatch; getState: () => any },
    message: string
) => {
    // Split the message by SEP1 to extract rows
    const stringList = message.split(SEP1).slice(1); // Skip the first element if necessary

    // Map over each row to parse and construct Brokerage objects
    const brokerages: BrokerageList = stringList.map(row => {
        const [sembol, pgc, alısToplam, satısToplam, oran] = row.split(SEP2);
        return { sembol, pgc, alısToplam, satısToplam, oran } as Brokerage
    });

    // Dispatch the parsed data to the Redux store
    store.dispatch(update(brokerages));
};