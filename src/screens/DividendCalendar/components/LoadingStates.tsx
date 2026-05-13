import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';

interface LoadingStatesProps {
    loading: boolean;
    error: string | null;
    hasData: boolean;
    symbolSearch: string;
    selectedStatus: string;
    startDate: string;
    endDate: string;
    dataFetched: boolean;
}

const LoadingStates: React.FC<LoadingStatesProps> = ({
    loading,
    error,
    hasData,
    symbolSearch,
    selectedStatus,
    startDate,
    endDate,
    dataFetched,
}) => {
    const { theme } = useTheme();
    if (loading) {
        return (
            <View style={styles.messageContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={[styles.loadingText, { color: theme.onBlue }]}>Temettü verileri yükleniyor...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.messageContainer}>
                <Text style={[styles.errorText, { color: theme.onBlue }]}>
                    Veri bulunamadı.
                </Text>
            </View>
        );
    }

    if (!hasData && dataFetched) {
        return (
            <View style={styles.messageContainer}>
                <Text style={[styles.noDataText, { color: theme.onBlue }]}>
                    {symbolSearch || selectedStatus !== 'Tümü' || startDate || endDate
                        ? 'Filtrelere uygun veri bulunamadı.'
                        : 'Henüz temettü verisi bulunamadı.'
                    }
                </Text>
            </View>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: 'white',
        marginTop: 16,
        fontSize: 16,
    },
    errorText: {
        color: '#F44336',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    noDataText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default LoadingStates; 