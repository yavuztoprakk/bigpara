import store from "../../../store";
import {
    fetchParamNeOlduSuccess,
    fetchParamNeOlduFailure,
} from "../../../screens/Tools/modules/paramNeOldu";

export const paramNeOldu = (
    _store: any,
    message: string
) => {
    console.log("[SRV_PARAM_NE_OLDU] Ham yanıt:", message);

    if (!message || message.trim().length === 0) {
        store.dispatch(fetchParamNeOlduFailure("Boş yanıt alındı."));
        return;
    }

    const jsonStart = message.indexOf("{");
    const jsonEnd = message.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd < 0) {
        store.dispatch(fetchParamNeOlduFailure("JSON bulunamadı."));
        return;
    }
    // Kontrol karakterlerini temizle (chr(0)-chr(31) hariç tab/newline/cr)
    const raw = message
        .substring(jsonStart, jsonEnd + 1)
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");

    let payload: any = null;
    try {
        payload = JSON.parse(raw);
    } catch (e) {
        console.log("[SRV_PARAM_NE_OLDU] Parse hatası:", (e as Error).message);
        console.log("[SRV_PARAM_NE_OLDU] raw charCodes:", Array.from(raw.substring(0, 50)).map(c => c.charCodeAt(0)));
        store.dispatch(fetchParamNeOlduFailure("Yanıt çözümlenemedi."));
        return;
    }

    if (!payload) {
        store.dispatch(fetchParamNeOlduFailure("Geçersiz yanıt."));
        return;
    }

    if (payload?.s === "0" && payload?.m) {
        store.dispatch(fetchParamNeOlduFailure(payload.m));
        return;
    }

    console.log("[ParamNeOldu] Veri alındı:", JSON.stringify(payload));
    store.dispatch(fetchParamNeOlduSuccess(payload));
};
