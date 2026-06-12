import React, { useState, useEffect, useRef } from 'react';
import { withToolAds } from "../../modules/ads/withToolAds";
import ToolMastheadAd from "../../modules/ads/ToolMastheadAd";
import ToolFooterAd from "../../modules/ads/ToolFooterAd";
import { View, ScrollView, Alert, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import FilterSection from './components/FilterSection';
import DividendTable from './components/DividendTable';
import LoadingStates from './components/LoadingStates';
import { useTheme } from '../../theme/ThemeContext';
import logoThemeChange from '../../routes/logoThemeChange';
import { request } from '../../modules/IdealClient';
import dividendCalendar from '../../modules/IdealClient/request/dividendCalendar';
import store from '../../store';

const DividendCalendar = ({ navigation }: { navigation: any }) => {
    const { theme } = useTheme();
    const [dividendData, setDividendData] = useState<any[]>([]);
    const [filteredData, setFilteredData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [symbolSearch, setSymbolSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('Tümü');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [dataFetched, setDataFetched] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const lastRequestAtRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Header AppNavigator'da AuthHeaderLogo ile set ediliyor; burada
    // setOptions ile override edilmiyor (eski iDeal Pro logosu yerine
    // bigpara logosu kullanılıyor).

    // Redux store'dan dividend verilerini al
    const dividendResponse = useSelector((state: any) => state.dividendCalendar);

    const loadDividendData = (symbol: string) => {
        try {
            lastRequestAtRef.current = Date.now();

            // Önceki timeout'u temizle
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Redux action dispatch
            store.dispatch({
                type: 'DIVIDEND_CALENDAR_REQUEST',
            });

            setLoading(true);
            setError(null);

            // Request gönder
            request(dividendCalendar, symbol);

            // 5 saniye sonra timeout
            timeoutRef.current = setTimeout(() => {
                setLoading(false);
                setError('Veri bulunamadı.');
                setDataFetched(true);
                setInitialLoad(false);
                setIsProcessing(false);
            }, 5000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
            setError(errorMessage);
            setLoading(false);

            store.dispatch({
                type: 'DIVIDEND_CALENDAR_ERROR',
                payload: {
                    error: errorMessage,
                    timestamp: Date.now()
                }
            });

            Alert.alert('Hata', errorMessage);
        }
    };

    // Response değişikliklerini dinle
    useEffect(() => {
        const resp = dividendResponse;
        if (!resp) return;

        // SUCCESS/ERROR action'larının payload'ında timestamp gelmeli
        const respTs = resp.timestamp ?? 0;

        // 1) timestamp yoksa ya da bu ekrandan başlatılan son isteğin öncesine aitse — hiç dokunma
        if (!respTs || respTs < lastRequestAtRef.current) return;

        // Response geldi, timeout'u temizle
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        // 2) Error geldiyse
        if (resp.error) {
            setError(resp.error);
            setLoading(false);
            setDividendData([]);
            setFilteredData([]);
            setDataFetched(true);
            setIsProcessing(false);
            setInitialLoad(false);
            return;
        }

        // 3) Success — data array değilse güvenli şekilde [] yap
        const arr = Array.isArray(resp.data) ? resp.data : [];

        setIsProcessing(true);
        setDividendData(arr);
        setFilteredData(arr);
        setLoading(false);
        setError(null);
        setDataFetched(true);
        setInitialLoad(false);
    }, [dividendResponse]);

    const isDateInRange = (dateString: string) => {
        if (!startDate && !endDate) return true;

        const itemDate = new Date(dateString);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        const itemDateStr = itemDate.toDateString();
        const startDateStr = start ? start.toDateString() : null;
        const endDateStr = end ? end.toDateString() : null;

        if (start && end) {
            if (startDateStr === endDateStr) {
                return itemDateStr === startDateStr;
            }
            return itemDate >= start && itemDate <= end;
        } else if (start && !end) {
            return itemDate >= start; // start'tan büyük-eşit
        } else if (!start && end) {
            return itemDate <= end; // end'ten küçük-eşit
        }

        return true;
    };

    const sortData = (data: any[]) => {
        return [...data].sort((a, b) => {
            // Eğer manuel sıralama yapılmışsa, onu her şeyin üstünde tut
            if (sortField) {
                let aValue: any, bValue: any;

                switch (sortField) {
                    case 'date':
                        aValue = new Date(a.odemeTarihi).getTime();
                        bValue = new Date(b.odemeTarihi).getTime();
                        break;
                    case 'company':
                        aValue = a.hisseSenedi.toLowerCase();
                        bValue = b.hisseSenedi.toLowerCase();
                        break;
                    case 'amount':
                        // Türkçe sayı formatını temizle ve sayıya çevir
                        {
                            const cleanA =
                                typeof a.netTutar === 'string'
                                    ? a.netTutar.replace(/[^\d.-]/g, '')
                                    : a.netTutar;
                            const cleanB =
                                typeof b.netTutar === 'string'
                                    ? b.netTutar.replace(/[^\d.-]/g, '')
                                    : b.netTutar;
                            aValue = parseFloat(cleanA) || 0;
                            bValue = parseFloat(cleanB) || 0;
                        }
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            }

            // Manuel sıralama yoksa varsayılan davranış: ödenmemiş önce, en yakın tarih en üstte
            const aIsPaid = a.odemeDurumu === 'Ödendi';
            const bIsPaid = b.odemeDurumu === 'Ödendi';

            // Ödenmemişler önce gelsin
            if (!aIsPaid && bIsPaid) return -1;
            if (aIsPaid && !bIsPaid) return 1;

            // Aynı durumda olanlar arasında tarih sıralaması
            const aDate = new Date(a.odemeTarihi).getTime();
            const bDate = new Date(b.odemeTarihi).getTime();

            if (!aIsPaid && !bIsPaid) {
                // Ödenmemişlerde: en yakın tarih en üstte (ascending)
                return aDate - bDate;
            } else {
                // Ödenmişlerde: en yeni tarih en üstte (descending)
                return bDate - aDate;
            }
        });
    };

    const filterData = () => {
        if (!dividendData.length) {
            setFilteredData([]);
            setIsProcessing(false);
            return;
        }

        let filtered = [...dividendData];

        if (symbolSearch.trim()) {
            filtered = filtered.filter((item) =>
                item.hisseSenedi.toLowerCase().includes(symbolSearch.toLowerCase())
            );
        }

        if (selectedStatus !== 'Tümü') {
            filtered = filtered.filter((item) => item.odemeDurumu === selectedStatus);
        }

        filtered = filtered.filter((item) => isDateInRange(item.odemeTarihi));
        filtered = sortData(filtered);

        setFilteredData(filtered);
        setIsProcessing(false);
    };

    const handleSort = (field: string) => {
        setIsProcessing(true);
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    useEffect(() => {
        if (dividendData.length > 0) {
            setIsProcessing(true);
        }
        filterData();
    }, [
        symbolSearch,
        selectedStatus,
        startDate,
        endDate,
        sortField,
        sortDirection,
        dividendData,
    ]);

    // --- YENİ: Ay aralığı hesaplama (lokal)
    const formatYMD = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const getMonthRange = () => {
        const today = new Date();
        const first = new Date(today.getFullYear(), today.getMonth(), 1);
        const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
            start: formatYMD(first),
            end: formatYMD(last),
        };
    };
    // --- /YENİ

    useEffect(() => {
        // Sayfa açılışında içinde bulunulan AY'ın ilk ve son gününü seç
        const monthRange = getMonthRange();
        setStartDate(monthRange.start);
        setEndDate(monthRange.end);

        loadDividendData('');

        // Cleanup function - component unmount olduğunda timeout'u temizle
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, []);

    const hasData = filteredData && filteredData.length > 0;
    const shouldShowLoading = loading || !dataFetched || isProcessing || initialLoad;

    // Eğer loading gösteriyorsak, hasData false olmalı ki "veri bulunamadı" mesajı görünmesin
    const actualHasData = hasData && !shouldShowLoading;

    // Filtre alanı — masthead'in altında her state'te ortak göstermek için.
    const filterSection = (
        <FilterSection
            symbolSearch={symbolSearch}
            setSymbolSearch={setSymbolSearch}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            showStatusDropdown={showStatusDropdown}
            setShowStatusDropdown={setShowStatusDropdown}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            showDateFilter={showDateFilter}
            setShowDateFilter={setShowDateFilter}
            showStartDatePicker={showStartDatePicker}
            setShowStartDatePicker={setShowStartDatePicker}
            showEndDatePicker={showEndDatePicker}
            setShowEndDatePicker={setShowEndDatePicker}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.darkBrand }]}>
            {!shouldShowLoading && !error && actualHasData ? (
                <DividendTable
                    filteredData={filteredData}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    handleSort={handleSort}
                    extraHeader={filterSection}
                />
            ) : (
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    <ToolMastheadAd />
                    {filterSection}
                    <LoadingStates
                        loading={shouldShowLoading}
                        error={error}
                        hasData={actualHasData}
                        symbolSearch={symbolSearch}
                        selectedStatus={selectedStatus}
                        startDate={startDate}
                        endDate={endDate}
                        dataFetched={dataFetched}
                    />
                    <ToolFooterAd />
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
    },
});

export default withToolAds(DividendCalendar, "temettu-takvimi");