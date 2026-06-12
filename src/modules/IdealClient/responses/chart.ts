import { AppDispatch } from "../../../store";
import { SEP1, SEP2 } from "../constants";
import { updateChart, ChartDataPoint } from "../../../screens/Markets/modules/chart";

export const chart = async (
	store: { dispatch: AppDispatch },
	message: string
) => {
	const [code, _pages, period, ...points] = message.split(SEP1);

	let data: ChartDataPoint[] = points.map((point) => {
		const [date, open, high, low, close, volume] = point.split(SEP2);


		return {
			date,
			open: parseFloat(open),
			high: parseFloat(high),
			low: parseFloat(low),
			close: parseFloat(close),
			volume: parseFloat(volume),
		};
	});

	store.dispatch(updateChart({ code, period, data: data.reverse() }));
};
