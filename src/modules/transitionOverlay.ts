// Global bigpara transition overlay'i imperative olarak göstermek/gizlemek için
// paylaşılan ref. AppNavigator mount olunca implementasyonu set eder, unmount'ta
// temizler. Welcome gibi ekranlar buton tap'inde overlay'i hemen göstermek için
// transitionOverlayRef.current?.show() çağırır.

export type TransitionOverlayApi = {
  show: () => void;
  hide: () => void;
};

export const transitionOverlayRef: { current: TransitionOverlayApi | null } = {
  current: null,
};
