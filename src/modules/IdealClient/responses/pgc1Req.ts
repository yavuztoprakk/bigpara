import { AppDispatch } from "../../../store";
import { SEP1, SEP2 } from "../constants";
import {
    update,
    Brokerage,
    BrokerageList1
} from "../../../screens/PGC1/modules/pgc1";

export const pgc1Req = async (
    store: { dispatch: AppDispatch },
    message: string
) => {
    // Mesajı SEP1'e göre bölüyoruz ve ilk öğeyi atlıyoruz
    const stringList = message.split(SEP1).slice(1);

    // Brokerage verilerini ayıklıyoruz
    const brokerages: BrokerageList1 = stringList.map(row => {
        const [pgc, alısToplam, satısToplam, oran, tl, tlalıstoplam, tlsatıstoplam, tloran] = row.split(SEP2);

        return { pgc, alısToplam, satısToplam, oran, tl, tlalıstoplam, tlsatıstoplam, tloran } as Brokerage;
    });

    // Veriyi store'a dispatch ediyoruz
    store.dispatch(update(brokerages));
};
