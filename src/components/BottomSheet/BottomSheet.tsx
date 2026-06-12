import React, { useEffect, useState, useRef } from "react";
import {
	Animated,
	Keyboard,
	StyleSheet,
	TouchableWithoutFeedback,
	Platform,
	NativeEventSubscription,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { changeAttachment, close } from "../../modules/bottomSheet";
import Survey from "../Survey";
import WatchListSelector from "../../screens/WatchList/Selector";
import { BackHandler } from "react-native";
import ColumnFormContainer from "../../screens/Markets/containers/ColumnFormContainer";
import ListSelectorContainer from "../../screens/Markets/containers/ListSelectorContainer";
import { useTheme } from "../../theme/ThemeContext";
import FilterContainer from "../../screens/Calendar/containers/FilterContainer";
import AlarmsCreateContainer from "../../screens/AlarmsCreate/containers/AlarmsCreateContainer";
import DateFormContainer from "../../screens/DateForm/containers/DateFormContainer";

interface Props {
	//attachment: string;
	//	changeAttachment: (attachment: string) => void;
}

const BackdropComp = Platform.select({
	ios: TouchableWithoutFeedback,
	default: TouchableWithoutFeedback, //React.Fragment,
});

const BottomSheet: React.FC<Props> = ({ }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	const dispatch = useDispatch();
	const { open, backdrop, type, attachment, detailOrderBook } = useSelector(
		(state: any) => state.ui.bottomSheet
	);
	const [openAnim] = useState(new Animated.Value(0));
	const backHandler = useRef<NativeEventSubscription>();

	const changeAttachmentHandle = (attachment: string) => {
		dispatch(changeAttachment(attachment));
	};
	useEffect(() => {
		Animated.spring(openAnim, {
			toValue: open ? 1 : 0,
			friction: 10,
			useNativeDriver: true,
		}).start();

		const backPressHandler = () => {
			if (attachment) {
				dispatch(changeAttachment(null));
			} else {
				dispatch(close());
			}
			return true;
		};

		if (open) {
			backHandler.current = BackHandler.addEventListener(
				"hardwareBackPress",
				backPressHandler
			);
		} else if (backHandler.current) {
			backHandler.current?.remove();
		}
		return () => {
			if (backHandler.current) {
				backHandler.current.remove();
			}
		};
	}, [open, attachment]);

	useEffect(() => Keyboard.dismiss(), [open, attachment]);

	const opacity = Animated.multiply(backdrop ? 0.7 : 0, openAnim);

	const renderContent = () => {
		switch (type) {
			case "orderedListTypeSelector":
				return <TypeSelector open={open} />;
			case "survey":
				return (
					<Survey
						open={open}
						attachment={attachment}
						changeAttachment={changeAttachment}
					/>
				);
			case "watchListSelector":
				return (
					<WatchListSelector
						attachment={attachment}
						changeAttachment={changeAttachmentHandle}
					/>
				);
			case "order":
				return (
					<OrderFormContainer
						open={open && type === "order"}
						attachment={attachment}
						detailOrderBook={detailOrderBook}
						changeAttachment={(type: any) => dispatch(changeAttachment(type))}
					/>
				);
			case "dateForm":
				return (
					<DateFormContainer
						open={open}
						attachment={attachment}
						changeAttachment={changeAttachment}
						zIndex={1}
					/>
				);
			case "alarmsCreate":
				return (
					<AlarmsCreateContainer
						open={open}
						attachment={attachment}
						changeAttachment={changeAttachment}
					/>
				);
			case "calendarFilterEkonomikTakvim":
				return (
					<FilterContainer
						open
						attachment={attachment}
						changeAttachment={changeAttachment}
						EkonomikTakvim={true}
					/>
				);
			case "columnForm":
				return (
					<ColumnFormContainer />
				);
			case "orderDepthSelector":
				return (
					<OrderDepthSelector open />
				);
			case "marketsListSelector":
				return (
					<ListSelectorContainer />
				);
			case "pastActionsFilter":
				return (
					<PastActionsFilter
						attachment={attachment}
						changeAttachment={changeAttachment}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<React.Fragment>
			<BackdropComp
				onPress={() => (!attachment ? dispatch(close()) : changeAttachment(null))}
			>
				<Animated.View
					pointerEvents={
						(open && backdrop) || (open && Platform.OS === "android")
							? "auto"
							: "none"
					}
					style={{ ...styles.background, opacity }}
				/>
			</BackdropComp>
			{renderContent()}
		</React.Fragment>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	background: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		backgroundColor: "black",
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		width: "100%",
	},
});

export default BottomSheet;
