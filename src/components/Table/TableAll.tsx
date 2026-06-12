import React, { useRef, useState } from "react";
import {
    View,
    StyleSheet,
    RefreshControl,
    LayoutChangeEvent,
    Animated as RNAnimated,
    NativeScrollEvent,
    NativeSyntheticEvent,
} from "react-native";
import HeaderColumn from "./HeaderColumn";
import Column from "./Column";
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
} from "react-native-reanimated";
import { TouchableHighlight } from "react-native-gesture-handler";
//import canStart from "../Copilot";
import { useTheme } from "../../theme/ThemeContext";

export interface Column {
    title: string;
    render?: (row: any) => React.ReactElement;
    renderHeader?: (col: Column) => React.ReactElement;
    valueKey: string;
    width: number;
    textAlign?: string;
    type?: string;
}

interface Props {
    columns: Column[];
    data: any[];
    loading: boolean;
    onRefresh: () => void;
    onPressFixedColumn: (row: any) => void;
}

const rowHeight = 40;

const Table: React.FC<Props> = ({
    columns,
    data,
    loading,
    onRefresh,
    onPressFixedColumn,
}) => {
    const { theme } = useTheme();
    const styles = createStyles(theme);
    const [containerHeight, setContainerHeight] = useState(500);
    const scrollX = useSharedValue(0);
    const scrollY = useSharedValue(0);
    const horizontalScrollRef = useRef<Animated.ScrollView>(null);

    const fixedColumnWidth = columns[0].width;
    const scrollColumns = columns.slice(1);
    const scrollContentWidth = columns.reduce(
        (sum, column) => sum + column.width,
        0
    );

    const handleLayout = (event: LayoutChangeEvent) => {
        setContainerHeight(event.nativeEvent.layout.height);
    };

    const horizontalScrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        scrollY.value = offsetY;
    };

    /* useEffect(() => {
          if (canStart("tableHorizontalScroll")()) {
              setTimeout(() => {
                  horizontalScrollRef.current?.scrollToEnd();
                  setTimeout(() => horizontalScrollRef.current?.scrollTo({ x: 0, y: 0 }), 800);
              }, 800);
          }
      }, []); */

    const translateXStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: -scrollX.value }],
    }));
    const translateYStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -scrollY.value }],
    }));


    return (
        <View onLayout={handleLayout} style={styles.container}>
            <RNAnimated.ScrollView
                refreshControl={
                    <RefreshControl
                        colors={[theme.primaryText]}
                        tintColor={theme.primaryText}
                        refreshing={loading}
                        onRefresh={onRefresh}
                    />
                }
                scrollEventThrottle={1}
                style={{
                    flex: 1,
                    backgroundColor: theme.darkerBrand,
                }}
                onScroll={handleScroll}
                showsVerticalScrollIndicator={false}
            >
                <Animated.ScrollView
                    scrollEventThrottle={16}
                    horizontal
                    style={{
                        flex: 1,
                        paddingTop: rowHeight,
                        paddingLeft: fixedColumnWidth,
                    }}
                    onScroll={horizontalScrollHandler}
                    ref={horizontalScrollRef}
                >
                    <View
                        style={{
                            width: scrollContentWidth,
                            height: Math.max(
                                containerHeight - rowHeight,
                                data.length * rowHeight
                            ),
                        }}
                    >
                        {data.map((row, i) => (
                            <View key={i} style={{ height: rowHeight }}>
                                <View style={{ flex: 1, flexDirection: "row" }}>
                                    {scrollColumns.map((column, index) => (
                                        <Column
                                            key={index}
                                            column={column}
                                            value={row[column.valueKey]}
                                        />
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.ScrollView>
            </RNAnimated.ScrollView>

            <View style={[styles.fixedColumnHeader, { height: rowHeight }]}>
                {columns[0].renderHeader ? (
                    columns[0].renderHeader(columns[0])
                ) : (
                    <HeaderColumn {...columns[0]} />
                )}
            </View>

            <View style={[styles.fixedColumnRows, { width: fixedColumnWidth }]}>
                <Animated.View
                    style={[
                        {
                            height: data.length * rowHeight,
                            position: "absolute",
                            width: "100%",
                            left: 0,
                            right: 0,
                        },
                        translateYStyle,
                    ]}
                >
                    {data.map((row, i) => (
                        <TouchableHighlight key={i} onPress={() => onPressFixedColumn(row)}>
                            <Column
                                fixed
                                column={columns[0]}
                                value={row[columns[0].valueKey]}
                            />
                        </TouchableHighlight>
                    ))}
                </Animated.View>
            </View>

            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    top: 0,
                    backgroundColor: theme.darkerBrand,
                    height: rowHeight,
                    left: fixedColumnWidth,
                    width: scrollContentWidth,
                }}
            >
                <Animated.View
                    style={[{ flex: 1, flexDirection: "row" }, translateXStyle]}
                >
                    {scrollColumns.map((column, i) => (
                        <HeaderColumn key={i} {...column} />
                    ))}
                </Animated.View>
            </View>
        </View>
    );
};

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: "row",
        },
        fixedColumnHeader: {
            position: "absolute",
            left: 0,
            top: 0,
            backgroundColor: theme.darkerBrand,
            borderBottomColor: theme.darkBrand,
            borderBottomWidth: 1,
            zIndex: 2,
        },
        fixedColumnRows: {
            position: "absolute",
            left: 0,
            bottom: 0,
            backgroundColor: theme.darkerBrand,
            top: rowHeight,
        },
    });

export default Table;