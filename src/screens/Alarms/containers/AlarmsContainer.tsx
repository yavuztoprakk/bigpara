import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Alarms from "../components/Alarms";
import { loadAlarms, deleteAlarm } from "../modules/list";
import AlarmsCreateTriggerContainer from "../../AlarmsCreate/containers/AlarmsCreateTriggerContainer";
import { useNavigation } from "@react-navigation/native";

const AlarmsContainer: React.FC = () => {
	const dispatch = useDispatch();
	const navigation = useNavigation();

	// Redux state
	const { data, loading } = useSelector((state: any) => state.alarms.list);

	// componentDidMount yerine useEffect
	useEffect(() => {
		dispatch(loadAlarms());
	}, [dispatch]);

	// Navigation Header
	useEffect(() => {
		navigation.setOptions({
			headerTitleAlign: "center",
			title: "Alarmlar",
			headerRight: () => (
				<AlarmsCreateTriggerContainer icon="add" size={32} />
			),
		});
	}, [navigation]);

	const handleDeleteAlarm = (alarmId: string) => {
		dispatch(deleteAlarm(alarmId));
	};

	return (
		<Alarms
			data={data}
			loading={loading}
			load={() => dispatch(loadAlarms())}
			deleteAlarm={handleDeleteAlarm}
		/>
	);
};

export default AlarmsContainer;
