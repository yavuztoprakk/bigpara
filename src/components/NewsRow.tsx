import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Text from './Text';
import BoldText from './BoldText';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface Props {
    title: string;
    date: string;
    onPress?: () => void;
}

const NewsRow: React.FC<Props> = ({ title, date, onPress }) => {
    const { theme } = useTheme(); // useTheme ile theme kullanımı

    // Memoized styles to dynamically apply theme
    const styles = createStyles(theme);

    return (
        <TouchableOpacity
            disabled={!onPress}
            onPress={onPress}
            style={styles.container}
        >
            <BoldText style={styles.title}>{title}</BoldText>
            <Text style={styles.date}>{date}</Text>

            {onPress && (
                <View style={styles.icon}>
                    <Ionicons
                        name="chevron-forward"
                        color={theme.separator}
                        size={20}
                    />
                </View>
            )}
        </TouchableOpacity>
    );
};

// Function to create styles dynamically based on the theme
const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            paddingVertical: 10,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            paddingRight: 40,
            backgroundColor: theme.darkerBrand,
            borderBottomColor: theme.darkBrand,
        },
        title: {
            color: theme.white,
        },
        date: {
            marginTop: 3,
            color: theme.primaryText,
        },
        icon: {
            position: 'absolute',
            top: 15,
            right: 15,
            bottom: 15,
            width: 15,
            justifyContent: 'center',
            alignItems: 'flex-end',
        },
    });

export default NewsRow;
