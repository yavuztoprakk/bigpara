// @ts-ignore
import { listenToKeyboardEvents } from "react-native-keyboard-aware-scroll-view";

const config = {
	enableAutomaticScroll: true,
};

export default (Component: any) => listenToKeyboardEvents(config)(Component);
