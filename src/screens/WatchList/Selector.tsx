import React, { useState } from "react";
import BottomSheetLayer from "../../components/BottomSheet/BottomSheetLayer";
import Select from "../../components/BottomSheet/Select";
import { useSelector, useDispatch } from "react-redux";
import { add, remove, select } from "./modules/watchlists";
import { close } from "../../modules/bottomSheet";
import BoldText from "../../components/BoldText";
import { Alert, View } from "react-native";
import SubmitButton from "../../components/Forms/SubmitButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import Text from "../../components/Text";
import FormRowForInput from "../../components/BottomSheet/FormRowForInput";
import flashMessage from "../../modules/flashMessage";
import { useTheme } from "../../theme/ThemeContext";
import { open } from "../../modules/bottomSheet";
import store from "../../store";

interface Props {
    changeAttachment: (attachment: string) => void;
}
const ListSelector: React.FC<Props> = ({
    changeAttachment,
}) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState("");
    const isDemo = store.getState().auth.demo;

    const dispatch = useDispatch();
    const lists = useSelector((state: any) => state.watchLists.lists);
    const selectedIndex = useSelector((state: any) => state.watchLists.selectedIndex);
    const { attachment } = useSelector((state: any) => state.ui.bottomSheet);

    const checkDemo = (cb: any) => () => {
        if (isDemo) {
            flashMessage({
                duration: 4000,
                type: "danger",
                message: "Bu bilgileri görebilmeniz için BigPara kullanıcı bilgilerinizle uygulamaya giriş yapmanız gerekmektedir!",
            });
            return;
        }
        return cb();
    };

    const handleRemove = (index: number) => {
        const listToRemove = lists[index];
        const listTitle = listToRemove.title;

        Alert.alert(
            "Takip Listesi",
            `"${listTitle}" listesini silmek istediğinize emin misiniz?`,
            [
                {
                    text: "Evet",
                    onPress: () => {
                        flashMessage({
                            type: "success",
                            message: "Takip listeniz başarıyla silindi.",
                        });
                        dispatch(remove(listToRemove));
                    },
                },
                { text: "Vazgeç", style: "cancel" },
            ],
            { cancelable: true }
        );
    };

    const handleAdd = () => {
        if (title.trim().length > 0) {
            dispatch(add({ title, codes: [] }));
            changeAttachment("");
            setTitle("");
        }
    };

    return (
        <>
            <BottomSheetLayer
                small={attachment !== null}
                onCancel={() => dispatch(close())}
                titleView={
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: theme.separator,
                                height: 28,
                                paddingLeft: 6,
                                paddingRight: 8,
                                marginTop: -4,
                                marginBottom: -7,
                            }}
                            onPress={checkDemo(() => changeAttachment("CREATE"))}
                        >
                            <Ionicons name="add-circle" size={19} color={theme.onBlue} />
                            <Text style={{ fontSize: 15, marginLeft: 7, color: theme.onBlue }}>
                                Yeni
                            </Text>
                        </TouchableOpacity>

                        <BoldText
                            style={{
                                fontSize: 18,
                                color: theme.onBlue,
                                textAlign: "center",
                                flexGrow: 1,
                            }}
                        >
                            Listelerim
                        </BoldText>
                    </View>
                }
                open
                contentHeight={
                    lists.length * 40 + 80 >= 600 ? 600 : lists.length * 40 + 150
                }
            >
                <Select
                    onChange={(type: any) => {
                        dispatch(select(type));
                        dispatch(close());
                    }}
                    options={lists.map((l: { title: any; }, i: any) => ({
                        title: l.title,
                        value: i,
                    }))}
                    value={selectedIndex}
                    onDelete={handleRemove}
                    showDeleteIcon={lists.length > 1}
                />
            </BottomSheetLayer>


            {attachment === "CREATE" && (
                <BottomSheetLayer
                    title="Yeni İzleme Listesi"
                    open={true}
                    small={false}
                    onCancel={() => {
                        dispatch(open({ type: "watchListSelector" }));
                        changeAttachment("")
                    }}
                    contentHeight={240}
                >
                    <FormRowForInput
                        value={title}
                        onChange={setTitle}
                        placeholder="Liste Başlığı"
                        label="Liste Başlığı"
                    //focus={true}
                    />

                    <SubmitButton
                        label="LİSTEYİ KAYDET"
                        disabled={title.trim().length === 0}
                        onPress={handleAdd}
                        margin
                    />
                </BottomSheetLayer>
            )}

        </>
    );
};

export default ListSelector;
