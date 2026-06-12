import { loadSuccess } from "../../../screens/Markets/modules/lists";
import { SEP2 } from "../constants";
import { AppDispatch, RootState } from "../../../store"; // Proje yapınıza göre yolu ayarlayın
import { request } from "..";
import symbolSend from "../request/symbolSend";

// Parser fonksiyonu
export const devrekesici = (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {
	// Mesajdaki JSON verisini ayıkla
	const jsonData = message.slice(message.indexOf("["));
	try {
		const data = JSON.parse(jsonData); // JSON formatında çözümle
		const symbols = data?.map((item: { s: string }) => item.s); // `s` alanlarını al
		const prefixler = symbols
			?.map((sembol: string) => sembol)
			.filter((composite: string) => composite !== undefined);
		const formattedString = prefixler?.join(SEP2);
		if (formattedString) {
			request(symbolSend, " ", formattedString);
		}
		store.dispatch(loadSuccess({ type: "devrekesici", codes: symbols })); // loadSuccess'i çağır

	} catch (error) {
		//console.log("JSON parsing failed: ", error); // JSON hatalarını yakala ve logla
	}
};
