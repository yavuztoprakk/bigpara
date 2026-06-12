
import { loadSuccess } from "../../../screens/Markets/modules/lists";
import { AppDispatch, RootState } from "../../../store";
// Parser fonksiyonu
export const bruttakas = (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {

	// Mesajdan JSON verisini ayıkla
	const jsonData = message.slice(message.indexOf("["));
	try {
		const data = JSON.parse(jsonData); // JSON formatında çözümle
		const symbols = data.map((item: { s: string }) => item.s); // `s` alanlarını al		
		store.dispatch(loadSuccess({ type: "bruttakas", codes: symbols })); // loadSuccess'i çağır
	} catch (error) {
		//console.log("JSON parsing failed: ", error); // JSON hatalarını yakala ve logla
	}
};
