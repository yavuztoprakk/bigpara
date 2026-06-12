import { SEP1 } from "../constants";
import store from "../../../store";
import {
    fetchBilancoRaporSuccess,
    fetchBilancoRaporFailure,
} from "../../../screens/Tools/modules/bilancoRapor";

export const bilancoRapor = (
    _store: any,
    message: string
): boolean => {
    const fields = message.split(SEP1);
    if (fields.length < 3) {
        return false;
    }

    const [, , rawResult] = fields;

    if (!rawResult) {
        return false;
    }

    let payload: any = null;
    try {
        payload = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
    } catch {
        return false;
    }

    if (!payload) {
        return false;
    }

    if (payload?.s === "0" && payload?.m) {
        store.dispatch(fetchBilancoRaporFailure(payload.m));
        return true;
    }

    // BilancoRapor yanıtı olduğunu doğrula
    const data = Array.isArray(payload) ? payload : (payload?.data ?? payload?.result ?? null);

    if (Array.isArray(data) && data.length > 0) {
        const firstItem = data[0];
        // SenetsBilgi verisi değilse ve tablo formatında bir veri ise bilancoRapor
        if (firstItem && 'a' in firstItem) {
            return false;
        }
    }

    console.log("[BilancoRapor] Veri alındı:", JSON.stringify(payload, null, 2));
    store.dispatch(fetchBilancoRaporSuccess(payload));
    return true;
};
