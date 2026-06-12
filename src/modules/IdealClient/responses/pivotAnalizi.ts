import store from "../../../store";
import {
    fetchPivotAnaliziSuccess,
    fetchPivotAnaliziFailure,
} from "../../../screens/Tools/modules/pivotAnalizi";

export const pivotAnalizi = (
    _store: any,
    message: string
) => {
    let payload: any = null;
    try {
        const cleaned = message.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "");
        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");
        if (jsonStart === -1 || jsonEnd === -1) {
            store.dispatch(fetchPivotAnaliziFailure("JSON bulunamadı."));
            return;
        }
        payload = JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
    } catch {
        store.dispatch(fetchPivotAnaliziFailure("Yanıt çözümlenemedi."));
        return;
    }

    if (!payload) {
        store.dispatch(fetchPivotAnaliziFailure("Geçersiz yanıt."));
        return;
    }

    if (payload?.s === "0" && payload?.m) {
        store.dispatch(fetchPivotAnaliziFailure(payload.m));
        return;
    }

    console.log("[PivotAnalizi] Veri alındı:", JSON.stringify(payload).substring(0, 200));
    store.dispatch(fetchPivotAnaliziSuccess(payload));
};
