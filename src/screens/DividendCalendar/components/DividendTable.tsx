import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../theme/ThemeContext';

interface DividendTableProps {
    filteredData: any[];
    sortField: string | null;
    sortDirection: 'asc' | 'desc';
    handleSort: (field: string) => void;
}

const statusOptions = [
    { label: 'Tümü', value: 'Tümü', icon: '📊' },
    { label: 'Ödendi', value: 'Ödendi', icon: '✅' },
    { label: 'Ödenecek', value: 'Ödenecek', icon: '⏳' }
];

const DividendTable: React.FC<DividendTableProps> = ({
    filteredData,
    sortField,
    sortDirection,
    handleSort,
}) => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const getLogoUrl = (symbol: string) => {
        return `https://s3.idealdata.com.tr/companylogo/${symbol.toLowerCase()}.png`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const months = [
            'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
            'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
        ];

        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'Ödendi':
                return '#4CAF50'; // Yeşil
            case 'Ödenecek':
                return '#FFA726'; // Sarı/Turuncu
            default:
                return '#757575'; // Gri
        }
    };

    const formatTurkishCurrency = (amount: string | number) => {
        // Sayıyı temizle ve sayıya çevir
        const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;

        if (isNaN(numAmount)) return '0 ₺';

        // Türkçe sayı formatlaması (nokta binlik ayırıcı, virgül ondalık ayırıcı)
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numAmount) + ' ₺';
    };

    const getSortIcon = (field: string) => {
        if (sortField !== field) return '⇅';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    const renderTableHeader = () => {
        return (
            <View style={[styles.tableHeader, { borderBottomColor: theme.separator }]}>
                <TouchableOpacity
                    style={styles.dateColumn}
                    onPress={() => handleSort('date')}
                >
                    <View style={[styles.headerContent, { justifyContent: 'flex-start' }]}>
                        <Text style={[styles.headerText, { color: theme.onBlue }, sortField === 'date' && styles.activeHeaderText]}>
                            Tarih
                        </Text>
                        <Text style={[styles.sortIcon, { color: theme.onBlue }, sortField === 'date' && styles.activeSortIcon]}>
                            {getSortIcon('date')}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.companyColumn}
                    onPress={() => handleSort('company')}
                >
                    <View style={[styles.headerContent, { justifyContent: 'flex-start' }]}>
                        <Text style={[styles.headerText, { color: theme.onBlue }, sortField === 'company' && styles.activeHeaderText]}>
                            Şirket
                        </Text>
                        <Text style={[styles.sortIcon, { color: theme.onBlue }, sortField === 'company' && styles.activeSortIcon]}>
                            {getSortIcon('company')}
                        </Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.amountColumn}
                    onPress={() => handleSort('amount')}
                >
                    <View style={[styles.headerContent, { justifyContent: 'flex-end' }]}>
                        <Text style={[styles.headerText, { color: theme.onBlue }, sortField === 'amount' && styles.activeHeaderText]}>
                            Net Tutar
                        </Text>
                        <Text style={[styles.sortIcon, { color: theme.onBlue }, sortField === 'amount' && styles.activeSortIcon]}>
                            {getSortIcon('amount')}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.statusColumn}>
                    <Text style={[styles.headerText, { color: theme.onBlue }, { textAlign: 'right' }]}>Durum</Text>
                </View>
            </View>
        );
    };

    const renderTableRow = ({ item, index }: { item: any; index: number }) => {
        const handleRowPress = () => {
            (navigation as any).navigate('Detail', { code: item.hisseSenedi });
        };

        return (
            <TouchableOpacity
                style={[styles.tableRow, { borderBottomColor: theme.separator }, index % 2 === 0 ? styles.evenRow : styles.oddRow]}
                onPress={handleRowPress}
                activeOpacity={0.7}
            >
                {/* Tarih Sütunu */}
                <View style={styles.dateColumn}>
                    <Text style={[styles.dateText, { color: theme.onBlue }]}>
                        {formatDate(item.odemeTarihi)}
                    </Text>
                </View>

                {/* Şirket Sütunu - Logo + Kod */}
                <View style={styles.companyColumn}>
                    <View style={styles.companyContent}>
                        <Image
                            source={{ uri: getLogoUrl(item.hisseSenedi) }}
                            style={styles.tableLogo}
                        />
                        <Text style={[styles.symbolText, { color: theme.onBlue }]}>
                            {item.hisseSenedi}
                        </Text>
                    </View>
                </View>

                {/* Net Tutar Sütunu */}
                <View style={styles.amountColumn}>
                    <Text style={[styles.amountText, { color: theme.onBlue }]}>
                        {formatTurkishCurrency(item.netTutar)}
                    </Text>
                </View>

                {/* Durum Sütunu */}
                <View style={styles.statusColumn}>
                    <View style={[
                        styles.statusDot,
                        { backgroundColor: getPaymentStatusColor(item.odemeDurumu) }
                    ]}>
                        <Text style={styles.statusText}>
                            {statusOptions.find(opt => opt.value === item.odemeDurumu)?.icon ||
                                (item.odemeDurumu === 'Ödendi' ? '✅' : '⏳')}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <>
            {renderTableHeader()}
            <FlatList
                data={filteredData}
                renderItem={renderTableRow}
                keyExtractor={(item, index) => `dividend-${index}`}
                showsVerticalScrollIndicator={false}
                style={styles.tableBody}
            />
        </>
    );
};

const styles = StyleSheet.create({
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    headerText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    activeHeaderText: {
        color: '#4CAF50',
        fontWeight: 'bold',
    },
    sortIcon: {
        color: '#444',
        fontSize: 14,
        opacity: 0.6,
    },
    activeSortIcon: {
        color: '#4CAF50',
        fontSize: 16,
        opacity: 1,
    },
    tableBody: {
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    evenRow: {
        backgroundColor: 'transparent',
    },
    oddRow: {
        backgroundColor: 'transparent',
    },
    dateColumn: {
        flex: 1.7,
        alignItems: 'flex-start',
        paddingLeft: 0,
        marginLeft: -8,
    },
    companyColumn: {
        flex: 1.1,
        alignItems: 'flex-start',
        paddingLeft: 8,
        marginLeft: -4,
    },
    amountColumn: {
        flex: 1.9,
        alignItems: 'flex-end',
        paddingRight: 8,
    },
    statusColumn: {
        flex: 0.8,
        alignItems: 'flex-end',
        paddingRight: 4,
        marginRight: -8,
    },
    dateText: {
        color: '#4CAF50',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'left',
    },
    companyContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tableLogo: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2A2A2A',
        marginRight: 8,
    },
    symbolText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    amountText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'right',
    },
    statusDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default DividendTable; 