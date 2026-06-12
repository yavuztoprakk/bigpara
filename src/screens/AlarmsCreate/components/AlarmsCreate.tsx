import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetLayer from "../../../components/BottomSheet/BottomSheetLayer";
import SubmitButton from "../../../components/Forms/SubmitButton";
import { Alarm } from "../../Alarms/modules/list";
import { calendarTypeOptions } from "../../Calendar/modules/list";
import store from "../../../store";
import {
  changeAttachment,
  open as openBottomSheet,
  close,
} from "../../../modules/bottomSheet";
import { open as openEdit } from "../../AlarmsCreate/modules/create";
import { useSelector } from "react-redux";
import AlarmSymbolResults from "./AlarmSymbolResults";
import flashMessage from "../../../modules/flashMessage";
import { useTheme } from "../../../theme/ThemeContext";

interface Props {
  open: boolean;
  code: string;
  saving: boolean;
  save: (values: any) => void;
  edit?: Alarm;
}

// Alarm türleri — Haber kaldırıldı, sadece Fiyat (+ code yoksa Ekonomik Takvim)
const SOURCE_OPTIONS = [
  {
    value: "price",
    title: "Fiyat Alarmı",
    subtitle: "Hisse fiyat hareketleri",
    icon: "trending-up" as const,
    color: "#F07400",
  },
];

const CALENDAR_OPTION = {
  value: "calendar",
  title: "Ekonomik Takvim",
  subtitle: "Önemli takvim olayları",
  icon: "calendar" as const,
  color: "#10B981",
};

const PRICE_OPERATOR_OPTIONS = [
  { value: "gt", title: "Üstüne Çıkarsa", icon: "arrow-up-circle" as const, color: "#10B981" },
  { value: "lt", title: "Altına İnerse", icon: "arrow-down-circle" as const, color: "#EF4444" },
  { value: "p_gt", title: "Güniçi % Artarsa", icon: "trending-up" as const, color: "#10B981" },
  { value: "p_lt", title: "Güniçi % Azalırsa", icon: "trending-down" as const, color: "#EF4444" },
];

// ─── Modern kart — alarm türü ve koşul seçimi ───
const OptionCard = ({
  icon,
  iconColor,
  title,
  subtitle,
  selected,
  onPress,
  theme,
  isDark,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[
      styles.card,
      {
        backgroundColor: selected
          ? iconColor + "15"
          : isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.025)",
        borderColor: selected
          ? iconColor
          : isDark
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.06)",
      },
    ]}
  >
    <View style={[styles.iconWrap, { backgroundColor: iconColor + "20" }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.cardTitle, { color: theme.white, fontFamily: theme.boldFont }]}>
        {title}
      </Text>
      {!!subtitle && (
        <Text
          style={[
            styles.cardSubtitle,
            {
              color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              fontFamily: theme.regularFont,
            },
          ]}
        >
          {subtitle}
        </Text>
      )}
    </View>
    <Ionicons
      name={selected ? "checkmark-circle" : "chevron-forward"}
      size={20}
      color={
        selected
          ? iconColor
          : isDark
            ? "rgba(255,255,255,0.3)"
            : "rgba(0,0,0,0.3)"
      }
    />
  </TouchableOpacity>
);

// ─── Modern input — sembol, fiyat ───
const LabeledInput = ({
  label,
  icon,
  iconColor = "#F07400",
  value,
  onChange,
  placeholder,
  keyboardType,
  onFocus,
  onBlur,
  theme,
  isDark,
}: any) => (
  <View style={styles.fieldWrap}>
    <Text
      style={[
        styles.fieldLabel,
        {
          color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          fontFamily: theme.regularFont,
        },
      ]}
    >
      {label}
    </Text>
    <View
      style={[
        styles.fieldRow,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      <View style={[styles.fieldIconWrap, { backgroundColor: iconColor + "1A" }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
        keyboardType={keyboardType}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize="characters"
        spellCheck={false}
        autoCorrect={false}
        style={[
          styles.fieldInput,
          { color: theme.white, fontFamily: theme.regularFont },
        ]}
      />
    </View>
  </View>
);

// ─── Modern trigger — koşul tetikleyici satırı ───
const TriggerRow = ({
  label,
  icon,
  iconColor = "#F07400",
  valueText,
  onPress,
  theme,
  isDark,
}: any) => (
  <View style={styles.fieldWrap}>
    <Text
      style={[
        styles.fieldLabel,
        {
          color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
          fontFamily: theme.regularFont,
        },
      ]}
    >
      {label}
    </Text>
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.fieldRow,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        },
      ]}
    >
      <View style={[styles.fieldIconWrap, { backgroundColor: iconColor + "1A" }]}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text
        style={[
          styles.fieldInput,
          { color: theme.white, fontFamily: theme.boldFont },
        ]}
      >
        {valueText}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
      />
    </TouchableOpacity>
  </View>
);

const AlarmsCreate: React.FC<Props> = ({ open, code, saving, save, edit }) => {
  const { theme } = useTheme();
  const isDark = theme.themeDetail === "dark";

  const [source, setSource] = useState("");
  const [operator, setOperator] = useState("gt");
  const [value, setValue] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [symbolQuery, setSymbolQuery] = useState("");

  const { attachment } = useSelector((state: any) => state.ui.bottomSheet);

  useEffect(() => {
    if (edit) {
      const editSource =
        edit.source === "price" && edit.params.operator.startsWith("p_")
          ? "percent"
          : edit.source;
      setSource(editSource !== "percent" ? "price" : "percent");
      store.dispatch(changeAttachment(editSource));
      setCodeInput(edit.params.code);
      setValue(edit.params.value);
      setOperator(
        edit.params.operator ? edit.params.operator.replace("p_", "") : "gt"
      );
    } else {
      setSource("");
      setCodeInput(code);
      setValue("");
      setOperator("gt");
      setSymbolQuery("");
    }
  }, [code, edit]);

  const activeOperator = useMemo(
    () =>
      PRICE_OPERATOR_OPTIONS.find((o) => o.value === operator) ||
      PRICE_OPERATOR_OPTIONS[0],
    [operator]
  );

  // Code varsa sadece Fiyat; yoksa Fiyat + Ekonomik Takvim
  const availableSources = useMemo(
    () => (code ? SOURCE_OPTIONS : [...SOURCE_OPTIONS, CALENDAR_OPTION]),
    [code]
  );

  return (
    <React.Fragment>
      {/* ─── Ana ekran: Alarm türü seç ─── */}
      <BottomSheetLayer
        title={edit ? "Alarm Düzenle" : "Yeni Alarm"}
        open={open}
        small={attachment !== null}
        onCancel={() => store.dispatch(close())}
        contentHeight={code ? 180 : 260}
      >
        <View style={styles.section}>
          {availableSources.map((opt) => (
            <OptionCard
              key={opt.value}
              icon={opt.icon}
              iconColor={opt.color}
              title={opt.title}
              subtitle={opt.subtitle}
              selected={source === opt.value}
              onPress={() => {
                setSource(opt.value);
                store.dispatch(changeAttachment(opt.value));
              }}
              theme={theme}
              isDark={isDark}
            />
          ))}
        </View>
      </BottomSheetLayer>

      {/* ─── Fiyat Alarmı ─── */}
      {attachment === "price" ? (
        <BottomSheetLayer
          title="Fiyat Alarmı"
          open={open}
          small={false}
          onCancel={() => {
            if (edit) {
              store.dispatch(close());
              store.dispatch(openEdit({ edit: null }));
            } else {
              store.dispatch(openBottomSheet({ type: "alarmsCreate" }));
            }
          }}
          contentHeight={440}
        >
          <View style={styles.section}>
            <LabeledInput
              label="Sembol"
              icon="search"
              iconColor="#F07400"
              value={codeInput}
              onChange={(text: string) => {
                if (text !== codeInput) {
                  setCodeInput(text);
                  setSymbolQuery(text.toUpperCase());
                }
              }}
              placeholder="Sembol giriniz..."
              onFocus={() => setSymbolQuery(codeInput)}
              onBlur={() => setTimeout(() => setSymbolQuery(""), 200)}
              theme={theme}
              isDark={isDark}
            />
            <AlarmSymbolResults
              query={symbolQuery}
              onSelect={(selectedCode: string) => {
                setCodeInput(selectedCode);
                setSymbolQuery("");
              }}
              onQueryChange={setSymbolQuery}
            />
            <TriggerRow
              label="Koşul"
              icon={activeOperator.icon}
              iconColor={activeOperator.color}
              valueText={activeOperator.title}
              onPress={() => {
                store.dispatch(openBottomSheet({ type: "alarmsCreate" }));
                store.dispatch(changeAttachment("OPERATOR"));
              }}
              theme={theme}
              isDark={isDark}
            />
            <LabeledInput
              label={operator.startsWith("p_") ? "% Değişim" : "Fiyat"}
              icon={operator.startsWith("p_") ? "stats-chart" : "pricetag"}
              iconColor="#F07400"
              value={value}
              onChange={setValue}
              keyboardType="decimal-pad"
              placeholder={
                operator.startsWith("p_")
                  ? "% değer giriniz..."
                  : "Fiyat giriniz..."
              }
              theme={theme}
              isDark={isDark}
            />
            <SubmitButton
              label="ALARMI KAYDET"
              loading={saving}
              onPress={() => {
                const symbolControl =
                  store.getState().symbols[codeInput?.toUpperCase()];
                if (symbolControl) {
                  save({
                    source: "price",
                    code: codeInput?.toUpperCase(),
                    value,
                    operator,
                  });
                } else {
                  flashMessage({
                    message: "Lütfen geçerli bir sembol giriniz..",
                    type: "danger",
                  });
                }
                store.dispatch(openEdit({ edit: null }));
              }}
              margin
            />
          </View>
        </BottomSheetLayer>
      ) : null}

      {/* ─── Koşul seçimi ─── */}
      {attachment === "OPERATOR" ? (
        <BottomSheetLayer
          title="Koşul Seç"
          open={open}
          small={false}
          onCancel={() => {
            store.dispatch(openBottomSheet({ type: "alarmsCreate" }));
            store.dispatch(changeAttachment("price"));
          }}
          contentHeight={400}
        >
          <View style={styles.section}>
            {PRICE_OPERATOR_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                icon={opt.icon}
                iconColor={opt.color}
                title={opt.title}
                selected={operator === opt.value}
                onPress={() => {
                  setOperator(opt.value);
                  store.dispatch(openBottomSheet({ type: "alarmsCreate" }));
                  store.dispatch(changeAttachment("price"));
                }}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </View>
        </BottomSheetLayer>
      ) : null}

      {/* ─── Ekonomik Takvim ─── */}
      {attachment === "calendar" ? (
        <BottomSheetLayer
          title="Ekonomik Takvim Alarmı"
          open={open}
          small={false}
          onCancel={() =>
            store.dispatch(openBottomSheet({ type: "alarmsCreate" }))
          }
          contentHeight={420}
        >
          <View style={styles.section}>
            {calendarTypeOptions.map((opt: any) => (
              <OptionCard
                key={opt.value}
                icon="calendar"
                iconColor="#10B981"
                title={opt.title}
                selected={operator === opt.value}
                onPress={() => {
                  save({
                    source: "calendar",
                    type: opt.value,
                    title: opt.title,
                    repeat: "1",
                  });
                }}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </View>
        </BottomSheetLayer>
      ) : null}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  section: { paddingTop: 6, paddingHorizontal: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 6,
    paddingLeft: 4,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 52,
  },
  fieldIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    letterSpacing: 0.3,
    paddingVertical: 0,
  },
});

export default AlarmsCreate;
