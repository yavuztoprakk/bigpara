import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import SubmitButton from "./SubmitButton";
import { WHITELABEL } from "../../../../modules/IdealClient/constants";
import ControlledInput from "../../../../components/Forms/ControlledInput";
import store from "../../../../store";
import { useTheme } from "../../../../theme/ThemeContext";
import SwitchField from "../../../../components/Forms/SwitchField";

interface Props {
  onSubmit: any;
  loading: boolean;
  navigation: any;
}

const Form: React.FC<Props> = ({ onSubmit, loading, navigation }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { control, handleSubmit, reset, getValues } = useForm();
  const username = store.getState().auth.user?.username || "";

  const usernameLabel =
    WHITELABEL.id === "info" || WHITELABEL.id === "colendi"
      ? "Hesap no"
      : "Kullanıcı adı";

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const currentUsername = getValues("username");
      reset({
        username: currentUsername || username,
        password: "",
      });
    });

    return () => unsubscribe();
  }, [navigation, reset, getValues, username]);

  return (
    <View style={styles.container}>
      <ControlledInput
        control={control}
        rules={{
          required: `${usernameLabel} girilmesi zorunludur`,
        }}
        name="username"
        defaultValue=""
        label={usernameLabel}
      />
      <ControlledInput
        secure
        control={control}
        rules={{ required: "Şifre girilmesi zorunludur" }}
        name="password"
        defaultValue=""
        label="Şifre"
      />
      {
        (WHITELABEL.id === "info" || WHITELABEL.id === "colendi") && (
          <>
            {/* <ControlledInput
						secure
						control={control}
						rules={{ required: "Parola girilmesi zorunludur" }}
						name="alias"
						defaultValue=""
						label="Parola"
					/> */}

            <Controller
              control={control}
              render={({ field, fieldState: { error } }) => (
                <SwitchField
                  style={styles.remember}
                  label="Bilgilerimi hatırla"
                  input={field}
                />
              )}
              name="remember"
              defaultValue={true}
            />
          </>
        )
      }
      <SubmitButton
        label="GİRİŞ YAP"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
        color={theme.loginButton}
      />
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  remember: {
    marginBottom: 20,
  },
});

export default Form;
