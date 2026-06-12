import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    Easing,
} from 'react-native-reanimated';
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

const DOT_ACCENT = '#F07400';
const DOT_CYCLE_MS = 1100;
const DOT_STAGGER_MS = 180;

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
    const isDark = theme.themeDetail === 'dark';
    const muted = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

    const dot1 = useSharedValue(0.25);
    const dot2 = useSharedValue(0.25);
    const dot3 = useSharedValue(0.25);

    useEffect(() => {
        if (!loading) return;
        const half = DOT_CYCLE_MS / 2;
        const easing = Easing.inOut(Easing.quad);
        const buildPulse = () =>
            withRepeat(
                withSequence(
                    withTiming(1, { duration: half, easing }),
                    withTiming(0.25, { duration: half, easing })
                ),
                -1,
                false
            );
        dot1.value = buildPulse();
        dot2.value = withDelay(DOT_STAGGER_MS, buildPulse());
        dot3.value = withDelay(DOT_STAGGER_MS * 2, buildPulse());
    }, [loading, dot1, dot2, dot3]);

    const dot1Style = useAnimatedStyle(() => ({
        opacity: dot1.value,
        transform: [{ scale: 0.6 + dot1.value * 0.4 }],
    }));
    const dot2Style = useAnimatedStyle(() => ({
        opacity: dot2.value,
        transform: [{ scale: 0.6 + dot2.value * 0.4 }],
    }));
    const dot3Style = useAnimatedStyle(() => ({
        opacity: dot3.value,
        transform: [{ scale: 0.6 + dot3.value * 0.4 }],
    }));

    if (loading) {
        return (
            <View style={styles.messageContainer}>
                <Image
                    source={require('../../../../assets/bigpara/headerLogo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                    fadeDuration={0}
                />
                <View style={styles.dotsRow}>
                    <Animated.View style={[styles.dot, { backgroundColor: DOT_ACCENT }, dot1Style]} />
                    <Animated.View style={[styles.dot, { backgroundColor: DOT_ACCENT }, dot2Style]} />
                    <Animated.View style={[styles.dot, { backgroundColor: DOT_ACCENT }, dot3Style]} />
                </View>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.messageContainer}>
                <Text style={[styles.message, { color: muted }]}>
                    Veri bulunamadı.
                </Text>
            </View>
        );
    }

    if (!hasData && dataFetched) {
        return (
            <View style={styles.messageContainer}>
                <Text style={[styles.message, { color: muted }]}>
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
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 180,
        height: 44,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 22,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 5,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: 24,
    },
});

export default LoadingStates;
