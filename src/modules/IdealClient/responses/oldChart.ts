import { AppDispatch, RootState } from "../../../store";
import { SEP1, SEP2 } from "../constants";
import { updateChart } from "../../../screens/Markets/modules/chart";

export const oldChart = async (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {

	const [code, period, ...points] = message.split(SEP1);

	const data = points.map((point) => {
		const [date, _open, _high, _low, close] = point.split(SEP2);

		return {
			date,
			close: parseFloat(close),
		};
	});

	store.dispatch(updateChart({ code, period, data }));
};

