import { update } from "../../../components/symbolTest";
import { AppDispatch, RootState } from "../../../store";
import { SEP1, SEP2 } from "../constants";

export const symbolTest = (
    store: { dispatch: AppDispatch; getState: () => RootState },
    message: string
) => {
    const stringListSEP1 = message.split(SEP1);
    const stringListSEP2 = stringListSEP1[0].split(SEP2);

    const total: string[] = [];
    /* const _processedData: BrokerageList = */ stringListSEP2
        .map((item) => {
            if (!item) return;
            const [symbols, name, deger] = item.split("=");
            const symbol = symbols.substring(symbols.indexOf("'") + 1);
            const fullName = symbol + "|" + name + "=" + deger;

            if (!total.includes(fullName)) {
                total.push(fullName);
            }
            return fullName;
        })
        .filter((item): item is string => item !== undefined);

    store.dispatch(update(total));
};
