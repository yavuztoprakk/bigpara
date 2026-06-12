import React from "react";
import { StyleSheet, View } from "react-native";
import { Field, reduxForm } from "redux-form";
import { useTheme } from "../../../../theme/ThemeContext";
import TextField from "../../../../components/Forms/TextField";
import SubmitButton from "../../../../components/Forms/SubmitButton";


function validate(values: any) {
	const errors = {};

	Object.keys(values).forEach((key) => {
		if (!values[key]) {
			errors[key] = "Zorunlu";
		}
	});

	return errors;
}

interface Props {
	handleSubmit: any;
	loading: boolean;
	otpkey: any;
}

const Form: React.FC<Props> = ({ handleSubmit, loading, otpkey }) => {
	const { theme } = useTheme();
	const styles = createStyles(theme);

	return (
		<View style={styles.container}>
			{otpkey === "SOFT_OTP" ? (
				<Field
					name="code"
					label="Colendi Onay uygulaması OTP kodu"
					component={TextField}
				/>
			) : (
				<Field name="code" label="SMS onay kodu" component={TextField} />
			)}
			<SubmitButton
				onPress={handleSubmit}
				loading={loading}
				label="GİRİŞ YAP"
			/>
		</View>
	);
};

const createStyles = (theme: any) => StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "flex-start",
	},
});

export default reduxForm({
	form: "brokerage-sms",
	validate,
})(Form);
