import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import Actions from "../components/Actions";
import { symbolSelector } from "../../Markets/modules/symbols";

interface Props {
	code: string;
	navigation: any;
}

const ActionsContainer: React.FC<Props> = ({ code, navigation }) => {
	const symbol = useSelector((state: any) => symbolSelector(state, code));
	const isDemo = useSelector((state: any) => state.auth.demo);
	const licences = useSelector((state: any) => state.auth.user?.licences || []);

	const { hasPite } = useMemo(() => {
		const hasPite = licences.includes("PITE");
		return { hasPite };
	}, [licences]);
	return (
		<Actions
			symbol={symbol}
			isDemo={isDemo}
			hasPite={hasPite}
			code={code} navigation={navigation} />
	);
};


export default React.memo(ActionsContainer);
