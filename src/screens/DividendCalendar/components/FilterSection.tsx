import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../../theme/ThemeContext';

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

const statusOptions = [
    { label: 'Tümü', value: 'Tümü', icon: '📊' },
    { label: 'Ödendi', value: 'Ödendi', icon: '✅' },
    { label: 'Ödenecek', value: 'Ödenecek', icon: '⏳' }
];

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
    return (
        <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
                <View style={styles.searchContainer}>
                    <View style={[
                        styles.searchInputContainer,
                        { backgroundColor: theme.darkBrand, borderColor: theme.onBlue },
                        Platform.OS === 'android' && { height: 42 }
                    ]}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={[styles.searchInput, { color: theme.onBlue }]}
                            placeholder="Sembol"
                            placeholderTextColor={theme.onBlue}
                            value={symbolSearch}
                            onChangeText={setSymbolSearch}
                            autoCapitalize="characters" />
                    </View>
                </View>

                <View style={styles.statusContainer}>
                    <TouchableOpacity
                        style={[styles.dropdownButton, { backgroundColor: theme.darkBrand, borderColor: theme.onBlue }]}
                        onPress={() => setShowStatusDropdown(true)}
                    >
                        <View style={styles.dropdownButtonContent}>
                            <Text style={styles.dropdownButtonIcon}>
                                {statusOptions.find(opt => opt.value === selectedStatus)?.icon || '🔄'}
                            </Text>
                            <Text style={[styles.dropdownButtonText, { color: theme.onBlue }]}>
                                {selectedStatus}
                            </Text>
                        </View>
                        <Text style={styles.dropdownArrow}>▼</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dateContainer}>
                    <TouchableOpacity
                        style={[styles.dateButton, { backgroundColor: theme.darkBrand, borderColor: theme.onBlue }, (startDate || endDate) ? styles.dateButtonActive : null]}
                        onPress={() => setShowDateFilter(true)}
                    >
                        <View style={styles.dateButtonContent}>
                            <Text style={styles.dateButtonIcon}>📅</Text>
                            <Text style={[styles.dateButtonText, (startDate || endDate) ? styles.dateButtonTextActive : null]}>
                                Tarih
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Status Dropdown Modal */}
            <Modal
                visible={showStatusDropdown}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowStatusDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={() => setShowStatusDropdown(false)}
                >
                    <View style={[
                        styles.dropdownModal,
                        styles.statusDropdownPosition,
                        Platform.OS === 'android' && { top: 115, right: 140 }
                    ]}>
                        {statusOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.dropdownOption,
                                    selectedStatus === option.value && styles.selectedOption,
                                    index === statusOptions.length - 1 && styles.lastOption
                                ]}
                                onPress={() => {
                                    setSelectedStatus(option.value);
                                    setShowStatusDropdown(false);
                                }}
                            >
                                <View style={styles.dropdownOptionContent}>
                                    <Text style={styles.dropdownIcon}>{option.icon}</Text>
                                    <Text style={[
                                        styles.dropdownOptionText,
                                        selectedStatus === option.value && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Date Filter Modal */}
            <Modal
                visible={showDateFilter}
                transparent
                animationType="slide"
                onRequestClose={() => setShowDateFilter(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDateFilter(false)}
                >
                    <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.dateFilterModal}>
                            <Text style={styles.dateFilterTitle}>Tarih Filtresi</Text>

                            {/* Başlangıç Tarihi */}
                            <View style={styles.datePickerContainer}>
                                <Text style={styles.dateLabel}>Başlangıç Tarihi:</Text>

                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Text style={styles.datePickerText}>
                                        {startDate ? new Date(startDate).toLocaleDateString('tr-TR') : 'Tarih Seç'}
                                    </Text>
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </TouchableOpacity>

                                {/* 3 hızlı seçim */}
                                <View style={styles.quickDateButtons}>
                                    <TouchableOpacity
                                        style={styles.quickDateButton}
                                        onPress={() => setStartDate(new Date().toISOString().split('T')[0])}
                                    >
                                        <Text style={styles.quickDateText}>Bugün</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.quickDateButton}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setDate(d.getDate() - 7);
                                            setStartDate(d.toISOString().split('T')[0]);
                                        }}
                                    >
                                        <Text style={styles.quickDateText}>1 Hafta Önce</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.quickDateButton}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setMonth(d.getMonth() - 1);
                                            setStartDate(d.toISOString().split('T')[0]);
                                        }}
                                    >
                                        <Text style={styles.quickDateText}>1 Ay Önce</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Bitiş Tarihi */}
                            <View style={styles.datePickerContainer}>
                                <Text style={styles.dateLabel}>Bitiş Tarihi (İsteğe bağlı):</Text>

                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Text style={styles.datePickerText}>
                                        {endDate ? new Date(endDate).toLocaleDateString('tr-TR') : 'Tarih Seç'}
                                    </Text>
                                    <Text style={styles.calendarIcon}>📅</Text>
                                </TouchableOpacity>

                                {/* 3 hızlı seçim */}
                                <View style={styles.quickDateButtons}>
                                    <TouchableOpacity
                                        style={styles.quickDateButton}
                                        onPress={() => setEndDate(new Date().toISOString().split('T')[0])}
                                    >
                                        <Text style={styles.quickDateText}>Bugün</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.quickDateButton}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setMonth(d.getMonth() + 1);
                                            setEndDate(d.toISOString().split('T')[0]);
                                        }}
                                    >
                                        <Text style={styles.quickDateText}>1 Ay Sonra</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.quickDateButton}
                                        onPress={() => {
                                            const d = new Date();
                                            d.setFullYear(d.getFullYear() + 1);
                                            setEndDate(d.toISOString().split('T')[0]);
                                        }}
                                    >
                                        <Text style={styles.quickDateText}>1 Yıl Sonra</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={styles.dateHint}>
                                • Tek tarih için sadece başlangıç tarihini seçin{'\n'}
                                • Aralık için her iki tarihi de seçin{'\n'}
                            </Text>

                            <View style={styles.dateButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setShowStartDatePicker(false);
                                        setShowEndDatePicker(false);
                                        setShowDateFilter(false);
                                    }}
                                >
                                    <Text style={styles.clearButtonText}>Temizle</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.applyButton}
                                    onPress={() => {
                                        setShowStartDatePicker(false);
                                        setShowEndDatePicker(false);
                                        setShowDateFilter(false);
                                    }}
                                >
                                    <Text style={styles.applyButtonText}>Uygula</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>

                {/* === Mini Picker – Başlangıç === */}
                <Modal
                    visible={showStartDatePicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowStartDatePicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowStartDatePicker(false)}
                    >
                        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.miniPickerCard}>
                                <Text style={styles.miniPickerHeader}>Başlangıç Tarihi</Text>
                                <DateTimePicker
                                    value={startDate ? new Date(startDate) : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                    textColor="white"
                                    locale="tr-TR"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) {
                                            setStartDate(selectedDate.toISOString().split('T')[0]);
                                        }
                                        if (Platform.OS === 'android') setShowStartDatePicker(false);
                                    }}
                                    maximumDate={endDate ? new Date(endDate) : undefined}
                                />
                                <View style={styles.miniPickerActions}>
                                    <TouchableOpacity
                                        style={styles.miniPickerBtn}
                                        onPress={() => setShowStartDatePicker(false)}
                                    >
                                        <Text style={styles.miniPickerBtnText}>İptal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.miniPickerBtn}
                                        onPress={() => setShowStartDatePicker(false)}
                                    >
                                        <Text style={styles.miniPickerBtnText}>Seç</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                {/* === Mini Picker – Bitiş === */}
                <Modal
                    visible={showEndDatePicker}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setShowEndDatePicker(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setShowEndDatePicker(false)}
                    >
                        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
                            <View style={styles.miniPickerCard}>
                                <Text style={styles.miniPickerHeader}>Bitiş Tarihi</Text>
                                <DateTimePicker
                                    value={endDate ? new Date(endDate) : new Date()}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                                    textColor="white"
                                    locale="tr-TR"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) {
                                            setEndDate(selectedDate.toISOString().split('T')[0]);
                                        }
                                        if (Platform.OS === 'android') setShowEndDatePicker(false);
                                    }}
                                    minimumDate={startDate ? new Date(startDate) : undefined}
                                />
                                <View style={styles.miniPickerActions}>
                                    <TouchableOpacity
                                        style={styles.miniPickerBtn}
                                        onPress={() => setShowEndDatePicker(false)}
                                    >
                                        <Text style={styles.miniPickerBtnText}>İptal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.miniPickerBtn}
                                        onPress={() => setShowEndDatePicker(false)}
                                    >
                                        <Text style={styles.miniPickerBtnText}>Seç</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    filterContainer: {
        marginBottom: 20,
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
    searchInputContainer: {
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A2A2A',
        gap: 8,
    },
    searchIcon: {
        color: '#666',
        fontSize: 14,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        padding: 0,
    },
    dropdownButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    dropdownButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dropdownButtonIcon: {
        fontSize: 14,
    },
    dropdownButtonText: {
        color: 'white',
        fontSize: 14,
    },
    dropdownArrow: {
        color: '#666',
        fontSize: 10,
    },
    dateButton: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    dateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateButtonIcon: {
        fontSize: 14,
    },
    dateButtonActive: {
        borderColor: '#4CAF50',
    },
    dateButtonText: {
        color: 'white',
        fontSize: 14,
    },
    dateButtonTextActive: {
        color: '#4CAF50',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownModal: {
        backgroundColor: '#1A1A1A',
        borderRadius: 8,
        minWidth: 120,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    statusDropdownPosition: {
        position: 'absolute',
        top: 150,
        right: 130,
    },
    dropdownOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
    },
    lastOption: {
        borderBottomWidth: 0,
    },
    selectedOption: {
        backgroundColor: '#2A2A2A',
    },
    dropdownOptionText: {
        color: 'white',
        fontSize: 14,
    },
    selectedOptionText: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    dropdownOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dropdownIcon: {
        fontSize: 16,
    },
    dateFilterModal: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 16,
        marginVertical: 40,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        maxHeight: '85%',
        width: '92%',
        alignSelf: 'center',
    },
    dateFilterTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    datePickerContainer: {
        marginBottom: 16,
    },
    dateLabel: {
        color: 'white',
        fontSize: 14,
        marginBottom: 8,
    },
    datePickerButton: {
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#3A3A3A',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    datePickerText: {
        color: 'white',
        fontSize: 16,
    },
    calendarIcon: {
        fontSize: 16,
    },
    quickDateButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        flexWrap: 'wrap',
    },
    quickDateButton: {
        backgroundColor: '#3A3A3A',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    quickDateText: {
        color: 'white',
        fontSize: 12,
    },
    dateHint: {
        color: 'white',
        fontSize: 12,
        marginBottom: 12,
        lineHeight: 18,
    },
    dateButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    clearButton: {
        flex: 1,
        backgroundColor: '#444',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    clearButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    miniPickerCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 32,
        borderWidth: 1,
        borderColor: '#2A2A2A',
        width: '80%',
        alignSelf: 'center',
    },
    miniPickerHeader: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    miniPickerActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        gap: 12,
    },
    miniPickerBtn: {
        flex: 1,
        backgroundColor: '#2A2A2A',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3A3A3A',
    },
    miniPickerBtnText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default FilterSection; 