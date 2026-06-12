import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { initiateLogin } from "../../modules/login";
import Login from "../components/Login";

interface Props {
	navigation: any
}

const LoginContainer: React.FC<Props> = ({ navigation }) => {
	// Redux state'e erişmek için useSelector kullanın
	const user = useSelector((state: any) => state.auth.user);
	const loading = useSelector((state: any) => state.auth.loading);
	const demo = useSelector((state: any) => state.auth.demo);
	const dispatch = useDispatch();

	// Gerekli işlevleri dispatch ile sağlayın
	const handleLogin = (credentials: { remember: boolean; demo: boolean; }) => {
		dispatch(initiateLogin(credentials));
	};
	return (
		<Login
			user={user}
			loading={loading}
			demo={demo}
			login={handleLogin}
			navigation={navigation} />
	);
};

export default LoginContainer;
