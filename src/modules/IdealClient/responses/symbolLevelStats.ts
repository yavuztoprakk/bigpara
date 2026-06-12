import { SEP1, SEP2 } from "../constants";
import store from "../../../store";
import {
    fetchKademeSuccess,
    fetchKademeFailure,
    type KademeLevel,
} from "../../../screens/Tools/modules/kademeAnalizi";

export const symbolLevelStats = (
    _store: any,
    message: string
) => {
    console.log("message", message)
    try {
        const [code, ...levels] = message.split(SEP1);

        const data: KademeLevel[] = levels
            .filter((lvl) => lvl.length > 0)
            .map((lvl) => {
                const [price, lot, percent, buy, sell] = lvl.split(SEP2);
                return { price, lot, percent, buy, sell };
            });

        store.dispatch(fetchKademeSuccess({ code, data }));
    } catch {
        store.dispatch(fetchKademeFailure("Kademe verisi çözümlenemedi."));
    }
};
