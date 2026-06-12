import React, { useEffect, useRef } from "react";
import { Linking } from "react-native";
import messaging, {
	FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { showMessage } from "react-native-flash-message";
import { useDispatch, useSelector } from "react-redux";
import {
	updateLastNotification,
	updateLastShownMessageId,
} from "../../../modules/pushNotifications";
import { navigationRef } from "../../../routes/AppNavigator";

// Global handler kurulumu yalnizca bir kez yapilsin (HMR ve cift mount korumasi)
let isGlobalListenerAttached = false;

interface Props {
	navigation?: any;
}

const PushNotificationRedirector: React.FC<Props> = () => {
	const dispatch = useDispatch();
	const lastNotification = useSelector(
		(s: any) => s.pushNotifications.lastNotification
	);
	const lastMessageIdShown = useSelector(
		(s: any) => s.pushNotifications.lastMessageIdShown
	);
	const handledIdsRef = useRef<Set<string>>(new Set());

	// 1) Handler'lari yalnizca bir kez kur
	useEffect(() => {
		dispatch(updateLastNotification(null));

		if (isGlobalListenerAttached) return;
		const unsubscribe = setupNotificationHandlers();
		isGlobalListenerAttached = true;
		return () => {
			unsubscribe?.();
			isGlobalListenerAttached = false;
		};
	}, []);

	// 2) Redux'tan gelen "son bildirim" ile yonlendirme
	// NOT: Bildirime tiklamada ekran acma akisi simdilik devre disi
	// useEffect(() => {
	// 	if (lastNotification) {
	// 		handleStoredNotification(lastNotification);
	// 	}
	// }, [lastNotification]);

	const setupNotificationHandlers = () => {
		// Bildirime tiklamada ekran acma akisi simdilik devre disi:
		// - Expo-notifications response listener (foreground local notif tap)
		// - FCM onNotificationOpenedApp (background tap)
		// - FCM getInitialNotification (kill state tap)
		// Sadece foreground'da gelen mesaji yerel bildirim olarak gosteriyoruz.

		// const subNotifResponse =
		// 	Notifications.addNotificationResponseReceivedListener((resp) => {
		// 		const data: any = resp.notification.request.content.data;
		// 		if (data) handleDataAction(data);
		// 	});

		// const unsubOpened = messaging().onNotificationOpenedApp(
		// 	(remoteMessage) => {
		// 		if (!remoteMessage) return;
		// 		if (isHandled(remoteMessage)) return;
		// 		markHandled(remoteMessage);
		// 		handleDataAction(remoteMessage.data);
		// 	}
		// );

		// messaging()
		// 	.getInitialNotification()
		// 	.then((remoteMessage) => {
		// 		if (!remoteMessage) return;
		// 		if (isHandled(remoteMessage)) return;
		// 		markHandled(remoteMessage);
		// 		handleDataAction(remoteMessage.data);
		// 	});

		// FCM: foreground'da gelen mesaji yerel bildirim olarak goster (expo-notifications)
		const unsubOnMessage = messaging().onMessage(async (remoteMessage) => {
			if (!remoteMessage) return;
			if (lastMessageIdShown === remoteMessage.messageId) return;
			dispatch(updateLastShownMessageId(remoteMessage.messageId));

			try {
				const title =
					remoteMessage?.notification?.title ||
					(remoteMessage?.data?.title as string) ||
					"";
				const body =
					remoteMessage?.notification?.body ||
					(remoteMessage?.data?.body as string) ||
					"";

				await Notifications.scheduleNotificationAsync({
					content: {
						title,
						body,
						sound: "default",
						data: remoteMessage?.data || {},
					},
					trigger: null,
				});
			} catch (error) {
				console.warn("[PUSH-DEBUG] Foreground bildirim gosterilemedi:", error);
				showMessage({
					message:
						(remoteMessage?.notification?.body as string) ||
						(remoteMessage?.data?.body as string) ||
						"",
					type: "info",
					duration: 4000,
					// onPress: () => handleDataAction(remoteMessage.data),
				});
			}
		});

		return () => {
			// subNotifResponse.remove();
			// unsubOpened();
			unsubOnMessage();
		};
	};

	const isHandled = (
		rm?: FirebaseMessagingTypes.RemoteMessage | null
	): boolean => {
		const id =
			rm?.messageId ||
			(rm?.data as any)?.messageId ||
			(rm?.data as any)?.msg_id;
		return id ? handledIdsRef.current.has(id) : false;
	};

	const markHandled = (rm?: FirebaseMessagingTypes.RemoteMessage | null) => {
		const id =
			rm?.messageId ||
			(rm?.data as any)?.messageId ||
			(rm?.data as any)?.msg_id;
		if (id) handledIdsRef.current.add(id);
	};

	const handleStoredNotification = (notification: any) => {
		dispatch(updateLastNotification(null));
		if (notification?.data?.screen) {
			navigateToScreen(notification.data);
		}
	};

	const handleDataAction = (data: any) => {
		if (!data) return;
		const raw = (data.url ?? "").toString().trim();
		const cleaned =
			raw && raw !== "null" && raw !== "undefined" ? raw : "";
		const url =
			cleaned && !/^https?:\/\//i.test(cleaned) ? `https://${cleaned}` : cleaned;
		if (url) {
			Linking.openURL(url).catch((err) =>
				console.warn("[PUSH-DEBUG] URL acilamadi", err)
			);
			return;
		}
		navigateToScreen(data);
	};

	const navigateToScreen = (data: any) => {
		if (!navigationRef?.current?.navigate || !data?.screen) return;

		const screen = data.screen;

		if (screen === "ScanResultList") {
			navigationRef.current.navigate("ScanResultNotification" as never, {
				titleNotification: data?.scanid,
			} as never);
			return;
		}

		if (screen === "Detail") {
			if (!data?.code) return;
			navigationRef.current.navigate("Detail" as never, {
				code: data.code,
			} as never);
			return;
		}

		if (!data?.id) return;
		navigationRef.current.navigate(screen as never, {
			id: { id: data.id },
		} as never);
	};

	return null;
};

export default PushNotificationRedirector;
