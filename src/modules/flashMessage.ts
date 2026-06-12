import { showMessage } from "react-native-flash-message";

const colors = {
  danger: "#FF2B2F",
  success: "#059669",
};

export default function flashMessage(payload: any) {
  showMessage({
    duration: 2500,
    ...payload,
    backgroundColor: colors[payload.type],
  });
}
