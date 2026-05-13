import { SEP1 } from "../constants";
import { AppDispatch, RootState } from "../../../store";

export const dividendCalendar = async (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {

	try {
		// Response formatı: username|sessionId|[JSON_DATA]
		const parts = message.split(SEP1);

		if (parts.length >= 3) {
			// JSON kısmını al (parts[2]'den itibaren)
			const jsonDataPart = parts.slice(2).join(SEP1);

			if (jsonDataPart && jsonDataPart.trim()) {
				try {
					// JSON formatını düzelt - eksik virgül sorunlarını çöz
					let fixedJsonString = jsonDataPart.trim();

					// Pattern: "value""field" -> "value","field"
					// Bu, eksik virgül problemini çözer
					fixedJsonString = fixedJsonString.replace(/""([a-zA-Z])/g, '","$1');


					const dividendData = JSON.parse(fixedJsonString);

					// Redux store'a kaydet
					store.dispatch({
						type: 'DIVIDEND_CALENDAR_SUCCESS',
						payload: {
							data: dividendData,
							timestamp: Date.now()
						}
					});


					return {
						success: true,
						data: dividendData
					};
				} catch (parseError) {
					console.error("Dividend Calendar JSON Parse Error:", parseError);

					store.dispatch({
						type: 'DIVIDEND_CALENDAR_ERROR',
						payload: {
							error: 'Veri formatı hatalı',
							timestamp: Date.now()
						}
					});

					return {
						success: false,
						error: 'Veri formatı hatalı'
					};
				}
			} else {
				// Boş veri
				store.dispatch({
					type: 'DIVIDEND_CALENDAR_SUCCESS',
					payload: {
						data: [],
						timestamp: Date.now()
					}
				});

				return {
					success: true,
					data: []
				};
			}
		} else {
			console.error("Invalid dividend calendar response format - Expected at least 3 parts, got:", parts.length);
			console.error("Parts:", parts);

			store.dispatch({
				type: 'DIVIDEND_CALENDAR_ERROR',
				payload: {
					error: 'Geçersiz response formatı',
					timestamp: Date.now()
				}
			});

			return {
				success: false,
				error: 'Geçersiz response formatı'
			};
		}
	} catch (error) {
		console.error("Dividend Calendar Response Error:", error);

		store.dispatch({
			type: 'DIVIDEND_CALENDAR_ERROR',
			payload: {
				error: 'Beklenmeyen hata oluştu',
				timestamp: Date.now()
			}
		});

		return {
			success: false,
			error: 'Beklenmeyen hata oluştu'
		};
	}
};