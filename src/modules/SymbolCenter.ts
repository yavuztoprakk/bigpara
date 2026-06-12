import { SymbolMap, Symbol } from "../screens/Markets/modules/symbols";


class SymbolCenter {
	listeners: { [code: string]: ((symbol: Symbol) => void)[] } = {};

	subscribe(code: string, callback: (symbol: Symbol) => void): () => void {
		if (!this.listeners.hasOwnProperty(code)) {
			this.listeners[code] = [];
		}

		this.listeners[code].push(callback);

		return () => {
			this.listeners[code] = this.listeners[code].filter((c) => c !== callback);
		};
	}

	dispatch(symbolMap: SymbolMap) {
		for (let code in symbolMap) {
			if (this.listeners[code]) {
				this.listeners[code].forEach((cb) => cb(symbolMap[code]));
			}
		}
	}
}

const symbolCenter = new SymbolCenter();

export default symbolCenter;
