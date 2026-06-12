import React from "react";
import { BorderlessButton } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { WatchList } from "../../WatchList/modules/watchlists";
import { useTheme } from "../../../theme/ThemeContext";
import store from "../../../store";
import flashMessage from "../../../modules/flashMessage";

interface Props {
	show: boolean;
	navigation: any;
	watchList: WatchList;
}

const WatchListEditorTrigger: React.FC<Props> = ({
	show,
	navigation,
	watchList,
}) => {
	const { theme } = useTheme();
	const isDemo = store.getState().auth.demo;

	const handlePress = () => {
		if (isDemo) {
			flashMessage({
				duration: 4000,
				type: "danger",
				message: "Bu bilgileri görebilmeniz için BigPara kullanıcı bilgilerinizle uygulamaya giriş yapmanız gerekmektedir!",
			});
			return;
		}
		navigation.navigate("WatchListEditor", { watchList: watchList });
	};

	return (
		<React.Fragment>
			{show && (
				<BorderlessButton
					style={{
						paddingHorizontal: 5,
						paddingVertical: 10,
					}}
					onPress={handlePress}
				>
					<Ionicons name="create-outline" size={22} color={theme.onBlue} />
				</BorderlessButton>
			)}
		</React.Fragment>
	);
}

export default WatchListEditorTrigger;
