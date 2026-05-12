import React, {
	useState,
	useCallback,
	useMemo,
	useRef,
	useEffect,
} from "react";
import {
	View,
	StyleSheet,
	Platform,
	TouchableOpacity,
	RefreshControl,
	FlatList,
	InteractionManager,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { RectButton } from "react-native-gesture-handler";
import { useTheme } from "../../../theme/ThemeContext";
import ListSelectorTriggerContainer from "../containers/ListSelectorTriggerContainer";
import Text from "../../../components/Text";
import TickerHeaderContainer from "../containers/TickerHeaderContainer";
import TickerRow from "../../../components/TickerRow";
import TickerRowSquare from "../../../components/TickerRowSquare";
import flashMessage from "../../../modules/flashMessage";
import { request, setupRealtimeSocket, ws } from "../../../modules/IdealClient";
import store from "../../../store";
import { useSelector } from "react-redux";
import { Price } from "../modules/prices";
import BoldText from "../../../components/BoldText";
import { SEP2 } from "../../../modules/IdealClient/constants";
import symbolSend from "../../../modules/IdealClient/request/symbolSend";
import { setIsAuthorized } from "../../../modules/IdealClient";
const ROW_HEIGHT = 64; // Satır yüksekliği (card style: 56px + 8px margin)

// ---- LİSTE GÖRÜNÜMLERİNİN İKİNCİ COMPONENT'İ: KARE ----
const RowSquare = React.memo(
	({
		code,
		columns,
		symbol,
		onPress,
		onSwipeLeftOpen,
		rightSwipeOption,
		selectedList,
		disableSwipe,
		price,
		onPriceUpdate,
		isAnimating,
		performanceMode,
	}: any) => {
		const { theme } = useTheme();
		// const navigation = useNavigation();
		const swipeableRef = useRef<Swipeable>(null);

		const renderLeftSwipeMenu = useCallback(() => {
			if (
				rightSwipeOption.value !== "DetailTradingView" &&
				!symbol?.canBeTraded
			)
				return null;
			return (
				<RectButton
					style={{
						flex: 1,
						backgroundColor: theme.portfolio,
						justifyContent: "center",
						alignItems: "flex-start",
					}}
				>
					<Text style={{ color: theme.white, paddingLeft: 15 }}>
						{rightSwipeOption.title}
					</Text>
				</RectButton>
			);
		}, [rightSwipeOption, symbol, theme]);

		const onPressError = useCallback(() => {
			const message = performanceMode
				? "Uygulamanın performans modu açık olduğu için kare görünümde kaydırma devre dışı."
				: Platform.OS === "ios"
					? "Satır sayınız 125'ten fazla ise kaydırma kullanılamaz."
					: "Satır sayınız 60'tan fazla ise kaydırma kullanılamaz.";
			flashMessage({ type: "danger", message });
		}, [performanceMode]);

		const handleSwipeLeftOpen = useCallback(() => {
			if (swipeableRef.current) {
				setTimeout(() => swipeableRef.current?.close(), 100);
			}
			onSwipeLeftOpen();
		}, [onSwipeLeftOpen]);

		if (disableSwipe) {
			return (
				<Swipeable ref={swipeableRef} onActivated={onPressError}>
					<TouchableOpacity activeOpacity={0.7} onPress={onPress}>
						<TickerRowSquare
							columns={columns}
							code={code}
							symbol={symbol}
							selectedList={selectedList.value}
							initialPrice={price}
						/>
					</TouchableOpacity>
				</Swipeable>
			);
		} else {
			return (
				<Swipeable
					ref={swipeableRef}
					onSwipeableLeftWillOpen={handleSwipeLeftOpen}
					renderLeftActions={renderLeftSwipeMenu}
				>
					<TouchableOpacity activeOpacity={0.7} onPress={onPress}>
						<TickerRowSquare
							columns={columns}
							code={code}
							symbol={symbol}
							selectedList={selectedList.value}
							initialPrice={price}
						/>
					</TouchableOpacity>
				</Swipeable>
			);
		}
	}
);

const Row = React.memo(
	({
		code,
		columns,
		symbol,
		onPress,
		onSwipeLeftOpen,
		rightSwipeOption,
		selectedList,
		disableSwipe,
		price,
		onPriceUpdate,
		isAnimating,
		performanceMode,
	}: any) => {
		const { theme } = useTheme();
		// const navigation = useNavigation();
		const swipeableRef = useRef<Swipeable>(null);

		const handleSwipeLeftOpen = useCallback(() => {
			if (swipeableRef.current) {
				setTimeout(() => {
					swipeableRef.current?.close();
				}, 100);
			}
			onSwipeLeftOpen();
		}, [onSwipeLeftOpen]);

		const renderLeftSwipeMenu = useCallback(() => {
			if (
				rightSwipeOption.value !== "DetailTradingView" &&
				(!symbol || !symbol.canBeTraded)
			)
				return null;

			return (
				<RectButton
					style={{
						flex: 1,
						backgroundColor: theme.portfolio,
						justifyContent: "center",
						alignItems: "flex-start",
					}}
				>
					<Text style={[{ color: theme.white, paddingLeft: 15 }]}>
						{rightSwipeOption.title}
					</Text>
				</RectButton>
			);
		}, [rightSwipeOption, symbol, theme]);

		const onPressError = useCallback(() => {
			const message = performanceMode
				? "Uygulamanın performans modu açık olduğu için sağa ve sola kaydırma özellikleri devre dışı bırakılmıştır."
				: Platform.OS === "ios"
					? "Sağa sola sürükleme özelliği satır sayınız 125'ten fazla ise kullanılamaz."
					: "Sağa sola sürükleme özelliği satır sayınız 60'tan fazla ise kullanılamaz.";

			flashMessage({
				type: "danger",
				message: message,
			});
		}, [performanceMode]);

		if (disableSwipe) {
			return (
				<Swipeable ref={swipeableRef} onActivated={onPressError}>
					<TouchableOpacity activeOpacity={0.7} onPress={onPress}>
						<TickerRow
							columns={columns}
							code={code}
							symbol={symbol}
							selectedList={selectedList.value}
							initialPrice={price}
						/>
					</TouchableOpacity>
				</Swipeable>
			);
		} else {
			return (
				<Swipeable
					ref={swipeableRef}
					onSwipeableLeftWillOpen={handleSwipeLeftOpen}
					renderLeftActions={renderLeftSwipeMenu}
				>
					<TouchableOpacity activeOpacity={0.7} onPress={onPress}>
						<TickerRow
							columns={columns}
							code={code}
							symbol={symbol}
							selectedList={selectedList.value}
							initialPrice={price}
						/>
					</TouchableOpacity>
				</Swipeable>
			);
		}
	}
);

const HeaderItem = React.memo(
	({ text, theme }: { text: string; theme: any }) => {
		const headerStyle = {
			height: 40,
			backgroundColor: theme.darkerBrand,
			justifyContent: "center" as const,
			paddingHorizontal: 24,
			marginTop: 8,
		};

		return (
			<View style={headerStyle}>
				<BoldText style={{ color: theme.primaryText, fontSize: 13, letterSpacing: 0.5, textTransform: "uppercase" as const, opacity: 0.5 }}>
					{text && text.startsWith("separator-") ? "" : text || ""}
				</BoldText>
			</View>
		);
	}
);

const List = ({
	codes,
	columns,
	symbols,
	selectedList,
	showFilterBar,
	performanceMode,
	rightSwipeOption,
	isDrawer,
	watchlist,
	squareOrListValueWatchlist,
	squareOrListValueMarket,
}: any) => {
	const { theme } = useTheme();
	const styles = useMemo(() => createStyles(theme), [theme]);
	const navigation = useNavigation();
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const prices = useSelector((state: any) => state.prices);
	const [updatedPrices, setUpdatedPrices] = useState<{ [key: string]: Price }>(
		{}
	);
	const [animatingCodes, setAnimatingCodes] = useState<Set<string>>(new Set());
	const flatListRef = useRef<FlatList>(null);

	// kare mi yoksa liste mi?
	const isListView = showFilterBar
		? squareOrListValueMarket
		: squareOrListValueWatchlist;
	const isSquareView = !isListView;

	/* const isRequestSent = useRef(false);
	const isFirstRender = useRef(true);
	const lastRequestTime = useRef(0);
	// Bottom sheet açık mı kontrol et
	const bottomSheetOpen = useSelector((state) => state.ui.bottomSheet.open);
	const bottomSheetType = useSelector((state) => state.ui.bottomSheet.type);
 */
	// Bottom sheet açıkken veri akışını devam ettir
	/* useEffect(() => {
		  if (bottomSheetOpen && bottomSheetType === "order") {
			  // Bottom sheet açıkken çalışacak interval
			  const interval = setInterval(() => {
				  // Tüm sembolleri güncellemek için istek gönder
				  if (codes && codes.length > 0) {
					  const formattedString = codes
						  .filter((code) => typeof code === "string" && code.trim() !== "")
						  .join(SEP2);

					  if (formattedString) {
						  request(symbolSend, " ", formattedString);
					  }
				  }
			  }, 1000);

			  return () => clearInterval(interval);
		  }
	  }, [bottomSheetOpen, bottomSheetType, codes]); */

	useEffect(() => {
		if (!isDrawer || codes.length === 0) return;

		// Sadece debug modunda loglama yap
		// if (__DEV__) {
		//   console.log("[List] isDrawer=true, istek hazırlanıyor...");
		// }
		setLoading(true);

		let parsedData = codes.map((msg: string) => {
			const [code] = msg.split(SEP2);
			return code;
		});

		const prefixler = parsedData
			.map((sembol: string) => sembol)
			.filter(
				(composite: string) =>
					composite !== undefined && !composite?.startsWith("separator-")
			);
		const formattedString = prefixler?.join(SEP2);

		if (formattedString) {
			// Sadece debug modunda loglama yap
			// if (__DEV__) {
			//   console.log("[List] İstek gönderiliyor");
			// }
			request(symbolSend, " ", formattedString);

			// İlk istek için loading'i biraz daha uzun tutalım, Redux'taki fiyatlar güncellensin
			setTimeout(() => {
				// Fiyat verileri dolu mu kontrol edelim
				const latestPrices = store.getState().prices;
				let hasPrices = false;

				// Fiyatları kontrol et
				prefixler.forEach((code: string) => {
					if (latestPrices[code] && latestPrices[code].lastPrice > 0) {
						hasPrices = true;
					}
				});

				// Hala fiyat yoksa bir kez daha istek gönder
				if (!hasPrices) {
					// Sadece debug modunda loglama yap
					// if (__DEV__) {
					//   console.log("[List] Fiyatlar yüklenemedi, tekrar deneniyor");
					// }
					request(symbolSend, " ", formattedString);
				}

				setLoading(false);
			}, 2000); // İlk istek için 2 saniye bekleyelim
		} else {
			setLoading(false);
		}

		// Periyodik fiyat kontrol işlemi
		const checkPricesInterval = setInterval(() => {
			const latestPrices = store.getState().prices;
			let hasUpdate = false;
			const tempPrices = { ...updatedPrices };

			// Sadece debug modunda log göster
			// if (__DEV__) {
			//   console.log(
			//     "[List] Store'daki fiyat sayısı:",
			//     Object.keys(latestPrices).length
			//   );
			//   console.log("[List] Aranan semboller:", prefixler.length);
			// }

			prefixler.forEach((code: string) => {
				// Fiyat var ve sıfırdan büyük değere sahipse güncelle
				if (latestPrices[code] && latestPrices[code].lastPrice > 0) {
					// Önceki değerden farklıysa animasyon göster
					const hasChanged =
						!updatedPrices[code] ||
						updatedPrices[code].lastPrice !== latestPrices[code].lastPrice;

					if (hasChanged) {
						tempPrices[code] = latestPrices[code];
						hasUpdate = true;

						// Sadece değer değiştiyse animasyon göster (çok fazla animasyon olmaması için)
						if (
							updatedPrices[code] &&
							Math.abs(
								updatedPrices[code].lastPrice - latestPrices[code].lastPrice
							) > 0.01
						) {
							setAnimatingCodes((prev) => {
								const newSet = new Set(prev);
								newSet.add(code);
								return newSet;
							});

							// Animasyonu temizle
							setTimeout(() => {
								setAnimatingCodes((prev) => {
									const newSet = new Set(prev);
									newSet.delete(code);
									return newSet;
								});
							}, 500);
						}
					}
				}
			});

			if (hasUpdate) {
				// Sadece debug modunda log göster
				// if (__DEV__) {
				//   console.log(
				//     "[List] Fiyatlar güncelleniyor:",
				//     Object.keys(tempPrices).length
				//   );
				// }
				setUpdatedPrices(tempPrices);
			}
		}, 5000); // 5 saniyede bir kontrol et (performans için sıklığı azalttık)

		// Cleanup
		return () => {
			clearInterval(checkPricesInterval);
		};
	}, [isDrawer, codes]);

	// Throttle değişkenleri
	const isUpdating = useRef(false);
	const pendingPriceUpdates = useRef<{ [key: string]: Price }>({});

	const isSwipeDisabled = useMemo(
		() => performanceMode || codes.length > (Platform.OS === "ios" ? 125 : 60),
		[performanceMode, codes.length]
	);

	// useEffect(() => {
	//   setupRealtimeSocket();
	// }, []);

	const handlePriceUpdate = useCallback((code: string, price: Price) => {
		// Throttling uygula
		if (isUpdating.current) {
			pendingPriceUpdates.current[code] = price;
			return;
		}

		isUpdating.current = true;

		// Ana thread'i bloklamamak için InteractionManager kullan
		InteractionManager.runAfterInteractions(() => {
			setUpdatedPrices((prev) => ({ ...prev, [code]: price }));

			setAnimatingCodes((prev) => {
				const newSet = new Set(prev);
				newSet.add(code);
				return newSet;
			});

			// Animasyonu 700ms sonra kaldır
			setTimeout(() => {
				setAnimatingCodes((current) => {
					const updated = new Set(current);
					updated.delete(code);
					return updated;
				});

				// Throttling durumunu sıfırla
				isUpdating.current = false;

				// Bekleyen güncellemeler varsa işle
				const pendingCodes = Object.keys(pendingPriceUpdates.current);
				if (pendingCodes.length > 0) {
					const nextCode = pendingCodes[0];
					const nextPrice = pendingPriceUpdates.current[nextCode];

					// Bekleyen güncellemeden bu kodu sil
					delete pendingPriceUpdates.current[nextCode];

					// Güncelleştirmeyi yap
					handlePriceUpdate(nextCode, nextPrice);
				}
			}, 300);
		});
	}, []);

	const onRefresh = useCallback(async () => {
		console.log("onRefresh =>=>>=>=>=>=>>=>=>=>=>=>=>=>=>>=>=>=>=>=>=>");
		// setRefreshing(true);
		if (ws) {
			setIsAuthorized("0");
			ws.reconnect();
			ws.onclose = () => {
				setupRealtimeSocket();
				setRefreshing(false);
			};
		} else {
			setIsAuthorized("0");
			setupRealtimeSocket();
			setRefreshing(false);
		}
	}, []);

	const navigateToDetail = useCallback(
		(code: string) => {
			if (store.getState().symbols[code]) {
				request(symbolSend, " ", code);

				// @ts-ignore
				navigation.navigate("Detail", { code: code });
			}
		},
		[navigation]
	);

	const handleRightSwipeAction = useCallback(
		(code: string) => {
			// @ts-ignore
			navigation.navigate(rightSwipeOption.value, { code });
		},
		[navigation, rightSwipeOption]
	);

	const getItemLayout = useCallback(
		(data: any, index: number) => ({
			length: ROW_HEIGHT,
			offset: ROW_HEIGHT * index,
			index,
		}),
		[]
	);

	const keyExtractor = useCallback(
		(item: string, index: number) =>
			// Sembol kodları (örn. "GARAN", "THYAO") benzersiz. Separator'lar tek
			// olduğu için index ile birleştiriyoruz. Reorder yapılırsa key sabit
			// kalmalı ki satırlar unmount/remount olmasın.
			item
				? item.startsWith("separator")
					? `${item}-${index}`
					: item
				: `empty-${index}`,
		[]
	);

	const renderItem = useCallback(
		({ item }: { item: string }) => {
			if (!item || item === "") {
				return null;
			}
			// Gerçek separator → başlık olarak göster
			if (item.startsWith("separator")) {
				return <HeaderItem text={item} theme={theme} />;
			}
			// symbols[item] eksik olsa bile TickerRow fallback satırını çalıştırır

			// Store'dan direkt erişim yerine cached prices kullan
			let priceToShow = null;

			// Öncelikle updatedPrices'tan al (en güncel)
			if (updatedPrices[item] && updatedPrices[item].lastPrice > 0) {
				priceToShow = updatedPrices[item];
			}
			// Sonra redux'tan al
			else if (prices[item] && prices[item].lastPrice > 0) {
				priceToShow = prices[item];
			}
			// Hiç değer yoksa
			else {
				// Store'a erişim en son çare olsun (her render'da kontrol pahalı)
				const storePrice = store.getState().prices[item];
				if (storePrice && storePrice.lastPrice > 0) {
					priceToShow = storePrice;
				} else if (storePrice) {
					priceToShow = storePrice; // Değer sıfır olsa bile göster
				}
			}

			const Component = isSquareView ? RowSquare : Row;

			return (
				<Component
					key={item}
					columns={columns}
					code={item}
					symbol={symbols[item]}
					onPress={() => navigateToDetail(item)}
					onSwipeLeftOpen={() => handleRightSwipeAction(item)}

					rightSwipeOption={rightSwipeOption}
					selectedList={selectedList}
					disableSwipe={isSwipeDisabled}
					price={priceToShow}
					onPriceUpdate={handlePriceUpdate}
					isAnimating={animatingCodes.has(item)}
					performanceMode={performanceMode}
				/>
			);

			/* return (
				<Row
					key={item}
					columns={columns}
					code={item}
					symbol={symbols[item]}
					onPress={() => navigateToDetail(item)}
					onSwipeLeftOpen={() => handleRightSwipeAction(item)}

					rightSwipeOption={rightSwipeOption}
					selectedList={selectedList}
					disableSwipe={isSwipeDisabled}
					price={priceToShow}
					onPriceUpdate={handlePriceUpdate}
					isAnimating={animatingCodes.has(item)}
					performanceMode={performanceMode}
				/>
			); */
		},
		[
			columns,
			symbols,
			selectedList,
			navigateToDetail,
			handleRightSwipeAction,

			rightSwipeOption,
			isSwipeDisabled,
			prices,
			updatedPrices,
			animatingCodes,
			handlePriceUpdate,
			performanceMode,
			theme,
			isSquareView,
		]
	);

	// separator ları atmak için:
	const squareData = codes.filter(
		(item) => typeof item === "string" && !!symbols[item]
	);

	return (
		<>
			{showFilterBar && (
				<View style={styles.filterBar}>
					<ListSelectorTriggerContainer navigation={navigation} />
				</View>
			)}

			<TickerHeaderContainer
				disableOpen={
					selectedList.value === "devrekesici" &&
					store.getState().pageLastBrokerages?.page === "Markets"
				}
				columns={columns}
			/>

			<View style={styles.listContainer}>
				<FlatList
					key={isSquareView ? "grid" : "list"}
					renderItem={renderItem}
					estimatedItemSize={64}
					//numColumns={!squareOrListValueWatchlist || !squareOrListValueMarket ? 3 : 1}
					//numColumns={1}
					numColumns={isSquareView ? 3 : 1}
					estimatedFirstItemOffset={0}
					drawDistance={150}
					scrollEventThrottle={Platform.OS === "ios" ? 16 : 32} // Artık 16 ms
					// Animated.event yerine sade onScroll kullanıyoruz
					onScroll={(event) => {
						// scrollY güncellemesi gerekiyorsa burada yapabilirsiniz.
						// Şimdilik ekstra callback oluşumunu önlemek için boş bırakıldı.
					}}
					ref={flatListRef}
					data={isSquareView ? squareData : codes}
					keyExtractor={keyExtractor}
					getItemLayout={!isSquareView ? getItemLayout : undefined}
					removeClippedSubviews={true}
					decelerationRate="fast"
					showsVerticalScrollIndicator={false}
					onEndReachedThreshold={0.5}
					extraData={{ loading, updatedPrices, isSquareView }}
					initialNumToRender={isSquareView ? 15 : 8}
					maxToRenderPerBatch={isSquareView ? 10 : 5}
					updateCellsBatchingPeriod={isSquareView ? 50 : 150}
					windowSize={isSquareView ? 10 : 5}
					refreshControl={
						<RefreshControl
							colors={[theme.white]}
							tintColor={theme.white}
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
					ListFooterComponent={<View style={{ height: 100 }} />}
				/>
				{loading && (
					<View style={styles.loadingContainer}>
						<LottieView
							source={require("../../../../assets/lottie/loading-dots.json")}
							autoPlay
							loop
							renderMode="HARDWARE"
							style={{ width: 50, height: 50 }}
						/>
					</View>
				)}
			</View>
		</>
	);
};

const createStyles = (theme: any) =>
	StyleSheet.create({
		listContainer: {
			flexGrow: 1,
			backgroundColor: theme.darkerBrand,
		},
		filterBar: {
			borderTopWidth: 1,
			borderTopColor: theme.darkBrand,
		},
		list: {
			flexGrow: 1,
		},
		loadingContainer: {
			position: "absolute",
			left: 0,
			right: 0,
			top: 0,
			bottom: 0,
			alignItems: "center",
			justifyContent: "center",
			backgroundColor: theme.darkerBrand,
			zIndex: 1,
		},
	});

export default React.memo(List);