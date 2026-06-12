import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Platform, StyleSheet, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';

const ACCENT = '#F07400';

interface FilterSectionProps {
    symbolSearch: string;
    setSymbolSearch: (value: string) => void;
    selectedStatus: string;
    setSelectedStatus: (value: string) => void;
    showStatusDropdown: boolean;
    setShowStatusDropdown: (value: boolean) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    showDateFilter: boolean;
    setShowDateFilter: (value: boolean) => void;
    showStartDatePicker: boolean;
    setShowStartDatePicker: (value: boolean) => void;
    showEndDatePicker: boolean;
    setShowEndDatePicker: (value: boolean) => void;
}

type StatusOption = { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; color: string };

const FilterSection: React.FC<FilterSectionProps> = ({
    symbolSearch,
    setSymbolSearch,
    selectedStatus,
    setSelectedStatus,
    showStatusDropdown,
    setShowStatusDropdown,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    showDateFilter,
    setShowDateFilter,
    showStartDatePicker,
    setShowStartDatePicker,
    showEndDatePicker,
    setShowEndDatePicker,
}) => {
    const { theme } = useTheme();
    const isDark = theme.themeDetail === 'dark';

    const text = theme.white;
    const muted = isDark ? 'rgba(255,255,255,0.62)' : 'rgba(0,0,0,0.62)';
    const subtle = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.40)';
    const cardBg = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.025)';
    const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const modalBg = isDark ? '#181E26' : '#FFFFFF';
    const overlayColor = 'rgba(0,0,0,0.55)';
    const chipBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.045)';
    const chipBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
    const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const dangerBg = isDark ? 'rgba(229,52,46,0.10)' : 'rgba(229,52,46,0.08)';

    const statusOptions: StatusOption[] = [
        { label: 'Tümü', value: 'Tümü', icon: 'apps-outline', color: ACCENT },
        { label: 'Ödendi', value: 'Ödendi', icon: 'checkmark-circle-outline', color: theme.green },
        { label: 'Ödenecek', value: 'Ödenecek', icon: 'time-outline', color: '#F0B400' },
    ];

    const activeStatus = statusOptions.find((o) => o.value === selectedStatus) || statusOptions[0];

    // Dropdown'ı status butonunun gerçek konumuna yerleştir.
    const statusBtnRef = useRef<View | null>(null);
    const [dropdownAnchor, setDropdownAnchor] = useState<{ x: number; y: number; width: number } | null>(null);

    const openStatusDropdown = useCallback(() => {
        const node = statusBtnRef.current as any;
        if (node?.measureInWindow) {
            node.measureInWindow((x: number, y: number, w: number, h: number) => {
                setDropdownAnchor({ x, y: y + h + 6, width: w });
                setShowStatusDropdown(true);
            });
        } else {
            setShowStatusDropdown(true);
        }
    }, [setShowStatusDropdown]);

    const handleClear = useCallback(() => {
        setStartDate('');
        setEndDate('');
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        setShowDateFilter(false);
    }, [setStartDate, setEndDate, setShowStartDatePicker, setShowEndDatePicker, setShowDateFilter]);

    const handleApply = useCallback(() => {
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        setShowDateFilter(false);
    }, [setShowStartDatePicker, setShowEndDatePicker, setShowDateFilter]);

    return (
        <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
                {/* Sembol arama */}
                <View style={styles.searchContainer}>
                    <View
                        style={[
                            styles.controlBase,
                            { backgroundColor: cardBg, borderColor: cardBorder },
                        ]}
                    >
                        <Ionicons name="search-outline" size={15} color={subtle} style={styles.iconLeft} />
                        <TextInput
                            style={[styles.searchInput, { color: text, fontFamily: theme.regularFont }]}
                            placeholder="Sembol"
                            placeholderTextColor={subtle}
                            value={symbolSearch}
                            onChangeText={setSymbolSearch}
                            autoCapitalize="characters"
                        />
                    </View>
                </View>

                {/* Durum dropdown */}
                <View style={styles.statusContainer}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        ref={statusBtnRef as any}
                        style={[
                            styles.controlBase,
                            { backgroundColor: cardBg, borderColor: cardBorder },
                        ]}
                        onPress={openStatusDropdown}
                    >
                        <Ionicons name={activeStatus.icon} size={15} color={activeStatus.color} style={styles.iconLeft} />
                        <Text
                            style={[styles.controlText, { color: text, fontFamily: theme.regularFont }]}
                            numberOfLines={1}
                        >
                            {activeStatus.label}
                        </Text>
                        <Ionicons name="chevron-down" size={14} color={subtle} />
                    </TouchableOpacity>
                </View>

                {/* Tarih butonu */}
                <View style={styles.dateContainer}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[
                            styles.controlBase,
                            {
                                backgroundColor: cardBg,
                                borderColor: startDate || endDate ? ACCENT + '60' : cardBorder,
                            },
                        ]}
                        onPress={() => setShowDateFilter(true)}
                    >
                        <Ionicons
                            name="calendar-outline"
                            size={15}
                            color={startDate || endDate ? ACCENT : subtle}
                            style={styles.iconLeft}
                        />
                        <Text
                            style={[
                                styles.controlText,
                                {
                                    color: startDate || endDate ? ACCENT : text,
                                    fontFamily: theme.regularFont,
                                },
                            ]}
                            numberOfLines={1}
                        >
                            Tarih
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── Durum Dropdown Modal ─── */}
            <Modal
                visible={showStatusDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStatusDropdown(false)}
            >
                <Pressable
                    style={styles.transparentOverlay}
                    onPress={() => setShowStatusDropdown(false)}
                >
                    {dropdownAnchor ? (
                        <View
                            style={[
                                styles.statusDropdown,
                                {
                                    top: dropdownAnchor.y,
                                    left: dropdownAnchor.x,
                                    width: Math.max(dropdownAnchor.width, 160),
                                    backgroundColor: modalBg,
                                    borderColor: cardBorder,
                                    shadowOpacity: isDark ? 0.45 : 0.15,
                                },
                            ]}
                        >
                            {statusOptions.map((option, index) => {
                                const isSelected = selectedStatus === option.value;
                                return (
                                    <TouchableOpacity
                                        key={option.value}
                                        activeOpacity={0.7}
                                        style={[
                                            styles.dropdownOption,
                                            index !== statusOptions.length - 1 && {
                                                borderBottomWidth: StyleSheet.hairlineWidth,
                                                borderBottomColor: dividerColor,
                                            },
                                            isSelected && { backgroundColor: ACCENT + '12' },
                                        ]}
                                        onPress={() => {
                                            setSelectedStatus(option.value);
                                            setShowStatusDropdown(false);
                                        }}
                                    >
                                        <Ionicons
                                            name={option.icon}
                                            size={16}
                                            color={isSelected ? ACCENT : option.color}
                                            style={{ marginRight: 10 }}
                                        />
                                        <Text
                                            style={[
                                                styles.dropdownOptionText,
                                                {
                                                    color: isSelected ? ACCENT : text,
                                                    fontFamily: isSelected ? theme.boldFont : theme.regularFont,
                                                },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                        {isSelected ? (
                                            <Ionicons
                                                name="checkmark"
                                                size={16}
                                                color={ACCENT}
                                                style={{ marginLeft: 'auto' }}
                                            />
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : null}
                </Pressable>
            </Modal>

            {/* ─── Tarih Filtresi Modal ─── */}
            <Modal
                visible={showDateFilter}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setShowDateFilter(false)}
            >
                <Pressable
                    style={[styles.modalOverlay, { backgroundColor: overlayColor }]}
                    onPress={() => setShowDateFilter(false)}
                >
                    <Pressable style={styles.modalCardWrap} onPress={() => {}}>
                        <View
                            style={[
                                styles.dateFilterModal,
                                { backgroundColor: modalBg, borderColor: cardBorder },
                            ]}
                        >
                            {/* Header */}
                            <View style={styles.dateModalHeader}>
                                <View style={[styles.headerIconWrap, { backgroundColor: ACCENT + '18' }]}>
                                    <Ionicons name="calendar" size={18} color={ACCENT} />
                                </View>
                                <Text
                                    style={[
                                        styles.dateFilterTitle,
                                        { color: text, fontFamily: theme.boldFont },
                                    ]}
                                >
                                    Tarih Filtresi
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeBtn}
                                    onPress={() => setShowDateFilter(false)}
                                >
                                    <Ionicons name="close" size={18} color={muted} />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.headerDivider, { backgroundColor: dividerColor }]} />

                            {/* Başlangıç */}
                            <View style={styles.dateSection}>
                                <Text
                                    style={[
                                        styles.dateLabel,
                                        { color: muted, fontFamily: theme.boldFont },
                                    ]}
                                >
                                    BAŞLANGIÇ TARİHİ
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[
                                        styles.dateInputButton,
                                        { backgroundColor: cardBg, borderColor: cardBorder },
                                    ]}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Text
                                        style={[
                                            styles.dateInputText,
                                            {
                                                color: startDate ? text : subtle,
                                                fontFamily: startDate ? theme.boldFont : theme.regularFont,
                                            },
                                        ]}
                                    >
                                        {startDate ? new Date(startDate).toLocaleDateString('tr-TR') : 'Tarih Seç'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={16} color={ACCENT} />
                                </TouchableOpacity>

                                <View style={styles.chipsRow}>
                                    <Chip
                                        label="Bugün"
                                        bg={chipBg}
                                        border={chipBorder}
                                        textColor={text}
                                        fontFamily={theme.regularFont}
                                        onPress={() => setStartDate(new Date().toISOString().split('T')[0])}
                                    />
                                    <Chip
                                        label="1 Hafta Önce"
                                        bg={chipBg}
                                        border={chipBorder}
                                        textColor={text}
                                        fontFamily={theme.regularFont}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - 7);
                                            setStartDate(d.toISOString().split('T')[0]);
                                        }}
                                    />
                                    <Chip
                                        label="1 Ay Önce"
                                        bg={chipBg}
                                        border={chipBorder}
                                        textColor={text}
                                        fontFamily={theme.regularFont}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setMonth(d.getMonth() - 1);
                                            setStartDate(d.toISOString().split('T')[0]);
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Bitiş */}
                            <View style={styles.dateSection}>
                                <Text
                                    style={[
                                        styles.dateLabel,
                                        { color: muted, fontFamily: theme.boldFont },
                                    ]}
                                >
                                    BİTİŞ TARİHİ (İSTEĞE BAĞLI)
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[
                                        styles.dateInputButton,
                                        { backgroundColor: cardBg, borderColor: cardBorder },
                                    ]}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Text
                                        style={[
                                            styles.dateInputText,
                                            {
                                                color: endDate ? text : subtle,
                                                fontFamily: endDate ? theme.boldFont : theme.regularFont,
                                            },
                                        ]}
                                    >
                                        {endDate ? new Date(endDate).toLocaleDateString('tr-TR') : 'Tarih Seç'}
                                    </Text>
                                    <Ionicons name="calendar-outline" size={16} color={ACCENT} />
                                </TouchableOpacity>

                                <View style={styles.chipsRow}>
                                    <Chip
                                        label="Bugün"
                                        bg={chipBg}
                                        border={chipBorder}
                                        textColor={text}
                                        fontFamily={theme.regularFont}
                                        onPress={() => setEndDate(new Date().toISOString().split('T')[0])}
                                    />
                                    <Chip
                                        label="1 Ay Sonra"
                                        bg={chipBg}
                                        border={chipBorder}
                                        textColor={text}
                                        fontFamily={theme.regularFont}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setMonth(d.getMonth() + 1);
                                            setEndDate(d.toISOString().split('T')[0]);
                                        }}
                                    />
                                    <Chip
                                        label="1 Yıl Sonra"
                                        bg={chipBg}
                                        border={chipBorder}
                                        textColor={text}
                                        fontFamily={theme.regularFont}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setFullYear(d.getFullYear() + 1);
                                            setEndDate(d.toISOString().split('T')[0]);
                                        }}
                                    />
                                </View>
                            </View>

                            {/* Bilgilendirme */}
                            <View
                                style={[
                                    styles.hintBox,
                                    { backgroundColor: cardBg, borderColor: cardBorder },
                                ]}
                            >
                                <Ionicons name="information-circle-outline" size={15} color={ACCENT} style={{ marginRight: 8, marginTop: 1 }} />
                                <Text style={[styles.hintText, { color: muted, fontFamily: theme.regularFont }]}>
                                    Tek tarih için sadece başlangıç tarihini seçin. Aralık için her iki tarihi de seçin.
                                </Text>
                            </View>

                            {/* Aksiyon butonları */}
                            <View style={styles.dateButtonsContainer}>
                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={[styles.clearButton, { backgroundColor: dangerBg, borderColor: theme.red + '40' }]}
                                    onPress={handleClear}
                                >
                                    <Ionicons name="trash-outline" size={15} color={theme.red} style={{ marginRight: 6 }} />
                                    <Text style={[styles.clearButtonText, { color: theme.red, fontFamily: theme.boldFont }]}>
                                        Temizle
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.85}
                                    style={[styles.applyButton, { backgroundColor: ACCENT }]}
                                    onPress={handleApply}
                                >
                                    <Ionicons name="checkmark" size={16} color="#fff" style={{ marginRight: 6 }} />
                                    <Text style={[styles.applyButtonText, { fontFamily: theme.boldFont }]}>
                                        Uygula
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* === Mini Picker — Başlangıç === */}
            <Modal
                visible={showStartDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStartDatePicker(false)}
            >
                <Pressable
                    style={[styles.modalOverlay, { backgroundColor: overlayColor }]}
                    onPress={() => setShowStartDatePicker(false)}
                >
                    <Pressable style={styles.modalCardWrap} onPress={() => {}}>
                        <View
                            style={[
                                styles.miniPickerCard,
                                { backgroundColor: modalBg, borderColor: cardBorder },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.miniPickerHeader,
                                    { color: text, fontFamily: theme.boldFont },
                                ]}
                            >
                                Başlangıç Tarihi
                            </Text>
                            <DateTimePicker
                                value={startDate ? new Date(startDate) : new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                textColor={text}
                                locale="tr-TR"
                                onChange={(_event, selectedDate) => {
                                    if (selectedDate) {
                                        setStartDate(selectedDate.toISOString().split('T')[0]);
                                    }
                                    if (Platform.OS === 'android') setShowStartDatePicker(false);
                                }}
                                maximumDate={endDate ? new Date(endDate) : undefined}
                            />
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.miniPickerConfirm, { backgroundColor: ACCENT }]}
                                onPress={() => setShowStartDatePicker(false)}
                            >
                                <Text style={[styles.miniPickerConfirmText, { fontFamily: theme.boldFont }]}>
                                    Tamam
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* === Mini Picker — Bitiş === */}
            <Modal
                visible={showEndDatePicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEndDatePicker(false)}
            >
                <Pressable
                    style={[styles.modalOverlay, { backgroundColor: overlayColor }]}
                    onPress={() => setShowEndDatePicker(false)}
                >
                    <Pressable style={styles.modalCardWrap} onPress={() => {}}>
                        <View
                            style={[
                                styles.miniPickerCard,
                                { backgroundColor: modalBg, borderColor: cardBorder },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.miniPickerHeader,
                                    { color: text, fontFamily: theme.boldFont },
                                ]}
                            >
                                Bitiş Tarihi
                            </Text>
                            <DateTimePicker
                                value={endDate ? new Date(endDate) : new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                textColor={text}
                                locale="tr-TR"
                                onChange={(_event, selectedDate) => {
                                    if (selectedDate) {
                                        setEndDate(selectedDate.toISOString().split('T')[0]);
                                    }
                                    if (Platform.OS === 'android') setShowEndDatePicker(false);
                                }}
                                minimumDate={startDate ? new Date(startDate) : undefined}
                            />
                            <TouchableOpacity
                                activeOpacity={0.85}
                                style={[styles.miniPickerConfirm, { backgroundColor: ACCENT }]}
                                onPress={() => setShowEndDatePicker(false)}
                            >
                                <Text style={[styles.miniPickerConfirmText, { fontFamily: theme.boldFont }]}>
                                    Tamam
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

// Tek satırlık quick-date chip butonu — equal-width, taşma yok.
const Chip: React.FC<{
    label: string;
    bg: string;
    border: string;
    textColor: string;
    fontFamily: string;
    onPress: () => void;
}> = ({ label, bg, border, textColor, fontFamily, onPress }) => (
    <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.chip, { backgroundColor: bg, borderColor: border }]}
    >
        <Text
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[styles.chipText, { color: textColor, fontFamily }]}
        >
            {label}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    filterContainer: {
        marginBottom: 14,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
    },
    searchContainer: {
        flex: 1,
    },
    statusContainer: {
        flex: 1.2,
    },
    dateContainer: {
        flex: 1,
    },
    controlBase: {
        height: 42,
        borderRadius: 10,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    iconLeft: {
        marginRight: 7,
    },
    searchInput: {
        flex: 1,
        fontSize: 13.5,
        padding: 0,
    },
    controlText: {
        flex: 1,
        fontSize: 13.5,
    },

    // Modal overlays
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCardWrap: {
        width: '100%',
        alignItems: 'center',
    },
    transparentOverlay: {
        flex: 1,
    },

    // Status dropdown
    statusDropdown: {
        position: 'absolute',
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 4,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowRadius: 16,
            },
            android: { elevation: 8 },
        }),
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    dropdownOptionText: {
        fontSize: 14,
    },

    // Date filter modal
    dateFilterModal: {
        borderRadius: 18,
        padding: 18,
        width: '90%',
        maxWidth: 460,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.35,
                shadowRadius: 22,
            },
            android: { elevation: 14 },
        }),
    },
    dateModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    headerIconWrap: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    dateFilterTitle: {
        flex: 1,
        fontSize: 16,
        letterSpacing: 0.2,
    },
    closeBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerDivider: {
        height: StyleSheet.hairlineWidth,
        marginBottom: 14,
    },
    dateSection: {
        marginBottom: 14,
    },
    dateLabel: {
        fontSize: 10.5,
        letterSpacing: 0.6,
        marginBottom: 8,
        marginLeft: 2,
    },
    dateInputButton: {
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 14,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateInputText: {
        fontSize: 14.5,
    },
    chipsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
    },
    chip: {
        flex: 1,
        paddingHorizontal: 8,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: {
        fontSize: 11.5,
        textAlign: 'center',
    },
    hintBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 14,
    },
    hintText: {
        flex: 1,
        fontSize: 11.5,
        lineHeight: 16,
    },
    dateButtonsContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    clearButton: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonText: {
        fontSize: 14,
        letterSpacing: 0.2,
    },
    applyButton: {
        flex: 1.4,
        height: 44,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 14,
        letterSpacing: 0.2,
    },

    // Mini date picker (spinner)
    miniPickerCard: {
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        width: '82%',
        maxWidth: 420,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.35,
                shadowRadius: 18,
            },
            android: { elevation: 12 },
        }),
    },
    miniPickerHeader: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 6,
    },
    miniPickerConfirm: {
        marginTop: 8,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    miniPickerConfirmText: {
        color: '#fff',
        fontSize: 14,
    },
});

export default FilterSection;
