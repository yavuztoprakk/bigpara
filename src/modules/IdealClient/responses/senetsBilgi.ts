import { SEP1 } from "../constants";
import store from "../../../store";
import { fetchSenetsBilgiSuccess, fetchSenetsBilgiFailure } from "../../../screens/Tools/modules/senetsBilgi";

export const senetsBilgi = (
    _store: any,
    message: string
) => {
    const fields = message.split(SEP1);
    if (fields.length < 3) {
        return;
    }

    const [, , rawResult] = fields;

    if (!rawResult) {
        store.dispatch(fetchSenetsBilgiFailure("Boş yanıt alındı."));
        return;
    }

    let payload: any = null;
    try {
        payload = typeof rawResult === "string" ? JSON.parse(rawResult) : rawResult;
    } catch {
        store.dispatch(fetchSenetsBilgiFailure("Yanıt çözümlenemedi."));
        return;
    }

    if (!payload) {
        store.dispatch(fetchSenetsBilgiFailure("Geçersiz yanıt."));
        return;
    }

    // Hata kontrolü
    if (payload?.s === "0" && payload?.m) {
        store.dispatch(fetchSenetsBilgiFailure(payload.m));
        return;
    }

    const data = Array.isArray(payload) ? payload : (payload?.data ?? payload?.result ?? []);

    if (!Array.isArray(data)) {
        store.dispatch(fetchSenetsBilgiFailure("Beklenmeyen veri formatı."));
        return;
    }

    // SenetsBilgi verisini doğrula (a, b, c, d, e, f alanları olmalı)
    const firstItem = data.length > 0 ? data[0] : null;
    if (firstItem && !('a' in firstItem)) {
        return; // Bu bizim beklediğimiz veri değil, başka bir SRV_SERVIS_API yanıtı
    }

    console.log("[SenetsBilgi] Veri alındı:", data.length, "kayıt");
    console.log("[SenetsBilgi] Response:", JSON.stringify(data.slice(0, 3), null, 2));

    store.dispatch(fetchSenetsBilgiSuccess(data));
};
