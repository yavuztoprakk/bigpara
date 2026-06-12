import { AppDispatch, RootState } from "../../../store";
import { SEP1 } from "../constants";
import { update } from "../../../screens/Markets/modules/stats";

export const stats = async (
	store: { dispatch: AppDispatch; getState: () => RootState },
	message: string
) => {

	const [
		code,
		_1,
		_2,
		_3,
		_4,
		ceiling,
		floor,
		_5,
		difference,
		high,
		low,
		wavg,
		lot,
		volume,
		eqPrice,
		eqLot,
		eqBidRemaining,
		eqAskRemaining,
		moneyIn,
		moneyOut,
		moneyTotal,
		moneyDifference,
		_6,
		_7,
		ownersEquity,
		paidInCapital,
		marketCap,
		fk,
		outstandingShares,
		...rest
	] = message.split(SEP1);
	/* console.log("öz kaynaklar>>=>=> ", ownersEquity);
	console.log("fiili dolaşım ", outstandingShares);
	console.log("ödenmiş sermaye ", paidInCapital);
 */
	const [
		viopOpenPosition,
		viopOpenPositionDifference,
		viopSettlementPrice,
		viopPrevSettlementPrice,
		_,
		viopTheoreticalPrice,
		varantUnderlying,
		varantDaysUntilExpiration,
		varantExpiration,
		varantType,
		varantExecutionPrice,
		varantUnderwriter,
	] = rest.slice(2);


	const cleanedData = {
		ceiling: ceiling || null,
		floor: floor || null,
		difference: difference || null,
		high: high || null,
		low: low || null,
		wavg: wavg || null,
		lot: lot || null,
		volume: volume || null,
		eqPrice: eqPrice || null,
		eqLot: eqLot || null,
		eqBidRemaining: eqBidRemaining || null,
		eqAskRemaining: eqAskRemaining || null,
		moneyIn: moneyIn || null,
		moneyOut: moneyOut || null,
		moneyTotal: moneyTotal || null,
		moneyDifference: moneyDifference || null,
		varantUnderlying: varantUnderlying || null,
		varantDaysUntilExpiration: varantDaysUntilExpiration || null,
		varantExpiration: varantExpiration || null,
		varantType: varantType || null,
		varantExecutionPrice: varantExecutionPrice || null,
		varantUnderwriter: varantUnderwriter || null,
		viopOpenPosition: viopOpenPosition.trim() || null,
		viopOpenPositionDifference: viopOpenPositionDifference.trim() || null,
		viopSettlementPrice: viopSettlementPrice || null,
		viopPrevSettlementPrice: viopPrevSettlementPrice || null,
		viopTheoreticalPrice: viopTheoreticalPrice || null,
		marketCap: marketCap || null,
		ownersEquity: ownersEquity || null,
		paidInCapital: paidInCapital || null,
		outstandingShares: outstandingShares || null,
		fk: fk || null,
	};

	store.dispatch(
		update({
			code,
			stats: cleanedData,
		})
	);
};
