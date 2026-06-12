import React, { useEffect, useState } from "react";
import AwesomeAlert from "react-native-awesome-alerts";
import { useSelector } from "react-redux";
import { checkNewVersion, updateVersion } from "../modules/updates";
import { useTheme } from "../theme/ThemeContext";
import { useDispatch } from "react-redux";

const ExpoUpdatesModal = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [showUpdateAvailableModal, setShowUpdateAvailableModal] =
    useState(false);
  const [modalType, setModalType] = useState<"updating" | "newUpdateAvailable">(
    null
  );

  const { checkingAvailableUpdates, updateProcessing } = useSelector(
    (state: any) => state.updates
  );
  useEffect(() => {
    if (showUpdateAvailableModal) {
      setModalType("newUpdateAvailable");
    } else if (updateProcessing) {
      setModalType("updating");
    }
  }, [showUpdateAvailableModal, updateProcessing]);

  useEffect(() => {
    if (!checkingAvailableUpdates) {
      checkNewVersion("auto", dispatch)
        .then((res: any) => {
          if (res.isAvailable) {
            setShowUpdateAvailableModal(true);
          } else {
            setShowUpdateAvailableModal(false);
          }
        })
        .catch(() => { });
    }
  }, []);

  const getProps = (type: any) => {
    let alertProps = {};
    switch (type) {
      case "updating":
        alertProps = {
          title: "Uygulama güncelleniyor...",
          message: "Güncelleme tamamlanana kadar lütfen bekleyiniz.",
          closeOnTouchOutside: false,
          closeOnHardwareBackPress: false,
        };
        break;
      case "newUpdateAvailable":
        alertProps = {
          title: "Versiyon Bilgilendirme",
          message:
            "Versiyon güncelleme birkaç saniye içinde tamamlanıp uygulama yeniden başlatılacaktır. Güncelleme sırasında kayıtlı düzenlemeleriniz kaybolmaz.",
          closeOnTouchOutside: true,
          closeOnHardwareBackPress: true,
          showCancelButton: false,
          showConfirmButton: true,
          cancelText: "Daha sonra",
          confirmText: "Şimdi güncelle",
          onConfirmPressed: () => {
            updateVersion(dispatch);
            setShowUpdateAvailableModal(false);
          },
          onCancelPressed: () => {
            setShowUpdateAvailableModal(false);
          },
        };
        break;
    }

    return alertProps;
  };

  return (
    <AwesomeAlert
      show={showUpdateAvailableModal || updateProcessing} // Boolean'a dönüştür
      {...getProps(modalType)}
      confirmButtonColor={theme.blue}
      overlayStyle={{
        backgroundColor: theme.darkerBrand,
        opacity: 0.8,
        shadowColor: theme.white,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }}
      contentContainerStyle={{
        backgroundColor: theme.darkBrand,
        width: "80%",
        paddingBottom: 20,
      }}
      cancelButtonStyle={{ backgroundColor: theme.darkBrand }}
      cancelButtonTextStyle={{ color: theme.primaryText }}
      titleStyle={{ color: theme.white }}
      messageStyle={{
        color: theme.primaryText,
        textAlign: "center",
      }}
    />
  );
};

export default ExpoUpdatesModal;
