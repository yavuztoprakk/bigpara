import { Price, PriceMap } from "../screens/Markets/modules/prices";

type ListenerCallback = (price: Price) => void;

class PriceCenter {
	private listeners: { [code: string]: ListenerCallback[] } = {};
	private prices: { [code: string]: Price } = {};
	private pendingUpdates: { [code: string]: Price } = {};
	private updateTimeout: NodeJS.Timeout | null = null;

	subscribe(code: string, callback: ListenerCallback): () => void {
		if (!this.listeners[code]) {
			this.listeners[code] = [];
		}

		this.listeners[code].push(callback);

		// Mevcut fiyat varsa hemen gönder
		if (this.prices[code]) {
			Promise.resolve().then(() => {
				if (this.prices[code]) {
					callback(this.prices[code]);
				}
			});
		}

		return () => {
			if (this.listeners[code]) {
				this.listeners[code] = this.listeners[code].filter(
					(cb) => cb !== callback
				);
				if (this.listeners[code].length === 0) {
					delete this.listeners[code];
				}
			}
		};
	}

	dispatch(priceMap: PriceMap) {
		// Fiyatları güncelle
		Object.entries(priceMap).forEach(([code, price]) => {
			this.prices[code] = price;
			this.pendingUpdates[code] = price;
		});

		// Mevcut timeout'u temizle
		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}

		// Yeni bir timeout oluştur
		this.updateTimeout = setTimeout(() => {
			this.processPendingUpdates();
		}, 0);
	}

	private processPendingUpdates() {
		const updates = { ...this.pendingUpdates };
		this.pendingUpdates = {};

		Object.entries(updates).forEach(([code, price]) => {
			if (this.listeners[code]) {
				const listeners = [...this.listeners[code]];
				listeners.forEach((callback) => {
					try {
						callback(price);
					} catch (error) {
						console.error(`Error dispatching price for ${code}:`, error);
					}
				});
			}
		});
	}
}

export default new PriceCenter();