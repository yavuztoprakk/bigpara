import * as React from 'react'
import { StyleSheet, I18nManager } from 'react-native'
import { Icon } from 'react-native-elements'

const styles = StyleSheet.create({
    icon: {
        height: 21,
        width: 13,
        marginLeft: 8,
        marginRight: 22,
        marginVertical: 12,
        transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
    },
})

// TODO: Delete once the missing header back button is solved
// Ref. https://github.com/react-navigation/react-navigation/issues/11792
const HeaderBackImage = ({ tintColor }): React.ReactNode => {
    return (
        <Icon name="chevron-left" color={tintColor} type="font-awesome-5" iconStyle={styles.icon} />
    )
}

export default HeaderBackImage