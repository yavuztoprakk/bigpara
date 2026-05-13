import { AppState } from "react-native";
import * as Network from 'expo-network';
import ReconnectingWebSocket from "reconnecting-websocket";
import { SEPEOL, SEP2, SEP1 } from "./constants";
import loginRequestBuilder from "./request/login";
import { handleConnectionError, loginSuccess } from "./responses/handlers";
import store from "../../store";
import { hideReconnect, showReconnect } from "./responses/reconnect";
import { realTimeUpdate } from "./responses/realTimeUpdate";
import { symbolDefinitions } from "./responses/symbolDefinitions";
import { symbolTest } from "./responses/symbolTest";
import { getWatchlists } from "../FintablesClient";
import { defaultDemoList, defaultWatchlist, updateAll } from "../../screens/WatchList/modules/watchlists";
import symbolSend from "./request/symbolSend";
import { topGainers } from "./responses/topGainers";
import { topLosers } from "./responses/topLosers";
import { topVolume } from "./responses/topVolume";
import indexSembols from "./responses/indexSembols";
import flashMessage from "../flashMessage";
import { oldChart } from "./responses/oldChart";
import { stats } from "./responses/stats";
import { pgc1Req } from "./responses/pgc1Req";
import { turevList } from "./responses/turevListReq";
import { chart } from "./responses/chart";
import { yieldStats } from "./responses/yieldStats";
import { bruttakas } from "./responses/bruttakas";
import { devrekesici } from "./responses/devrekesici";
import { senetsBilgi } from "./responses/senetsBilgi";
import { paramNeOldu } from "./responses/paramNeOldu";
import { pivotAnalizi } from "./responses/pivotAnalizi";
import { symbolLevelStats } from "./responses/symbolLevelStats";
import { bilancoRapor } from "./responses/bilancoRapor";
import { dividendCalendar } from "./responses/dividendCalendar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginFail } from "../../screens/Auth/modules/auth";


// let ws: ReconnectingWebSocket | undefined;
// let server: string | "";
// let username: string;
// let password: string | undefined;
// let sessionId: string | undefined;
// let demo: boolean;
// let inactivityTimer: any;
// let isAnotherConnect = false;
// let wssControl: string | undefined;
// let symbolLength: string | undefined;
// let lastState: string | null = null;
// let timer: any;
// let heartbeatInterval = 10;
let Authorized: string;
let ws: ReconnectingWebSocket | undefined;
let server: string | null = null;
let username: string = "";
let password: string = "";
let sessionId: any = undefined;
let demo: boolean;
let inactivityTimer: any;
let connectionCheckTimer: any;
let isAnotherConnect = false;
let wssControl: string | undefined;
let symbolLength: string | undefined;
let lastState: string | null = "active";
// let warnedForExpiration = false;
let delayedWs: any;
let delayedPay = false;
let delayedViop = false;
let lastPageVisited: string | null = null;
let lastMessageReceived: number = 0;
let heartbeatTimer: any;
let verifyConnectionTimer: any;
let realConnectionOpen = false; // Gerçek bağlantı açık mı?
// let _wsInitialized = false; // WebSocket başlatıldı mı?
let pendingConnect = false; // Bağlantı beklemede mi?
let connectionTimeout: any; // Bağlantı zaman aşımı
let appStateSubscription: any; // AppState aboneliği
const MAX_INACTIVE_TIME = 10000; // 10 saniye
const CONNECTION_TIMEOUT = 3000; // 5 saniyeden 3 saniyeye düşürüldü
// const forcedServer: { [key: string]: string | null } = {
//     realtime: null,
//     delayed: null,
// };
let connectedServer: string | null = null;
// let connectedServerDelay: string | null = null;
function getConnectedServer() { return connectedServer; }
let socketReconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;


const subscribers: Record<string, ((data: any) => void)[]> = {};

const parsers: Record<string, (store: any, message: any, username?: any, password?: any, pool?: any, delayedPay?: any, delay?: any, demo?: any) => void> = {
    SRV_CONNECTION_ERROR: (store, message) => handleConnectionError(store, message, { ws: ws }),
    "35": (store, message, username, password) => loginSuccess(store, message, username, password),
    "43": symbolDefinitions,
    "26": realTimeUpdate,
    SRV_SEMBOLACIKLAMA: symbolTest,
    SRV_BIST_YUKSELEN: topGainers,
    SRV_BIST_DUSEN: topLosers,
    SRV_BIST_HACIM: topVolume,
    SRV_INDEX_SYMBOLS: indexSembols,
    "6": oldChart,
    "46": stats,
    "45": yieldStats,
    SRV_TUREV_LIST: turevList,
    "62": chart,
    //"33": orderBook,
    //SRV_DRN: orderBookUpdate,
    //"34": transactions,
    //"4": symbolNews,
    SRV_BRUT_TAKAS: bruttakas,
    SRV_BIST_DEVRE: devrekesici,
    SRV_SERVIS_API: (store, message) => {
        const handled = bilancoRapor(store, message);
        if (!handled) {
            senetsBilgi(store, message);
        }
    },
    SRV_SENETS_BILGI: (store: any, message: string) => {
        senetsBilgi(store, message);
    },
    SRV_PARAM_NE_OLDU: (store: any, message: string) => {
        paramNeOldu(store, message);
    },
    SRV_PIVOT_ANALIZI: (store: any, message: string) => {
        pivotAnalizi(store, message);
    },
    "38": (store: any, message: string) => {
        symbolLevelStats(store, message);
    },
    SRV_TEMETTU_TAKVIM: dividendCalendar,
};

const pool: { [key: string]: string[] } = {
    realtime: [
        "bpkcs-uat.idealdata.com.tr",
    ],
    delayed: ["bpkcsgck-uat.idealdata.com.tr"],
};

// Sunucu bağlantı başarı durumunu takip için
let serverSuccessRate: Record<string, { success: number; failure: number }> = {
    "ms75.idealdata.com.tr": { success: 0, failure: 0 },
};

const control = () => {
    flashMessage({
        message: "Tekrar giriş yapmanız gerekmektedir.",
        type: "danger",
        duration: 10000,
    });
    AsyncStorage.setItem("keyuserControl", "value");
 
    logout();
    ws?.close();
    close();
    store.dispatch(loginFail());
};
 


function handleOpen() {
    wssControl = "open";
    socketReconnectAttempts = 0; // Başarılı bağlantıda sıfırla
    lastMessageReceived = Date.now(); // Bağlantı açıldığında son mesaj zamanını güncelle
    realConnectionOpen = true;
    // _wsInitialized = true;
    pendingConnect = false;

    // Sunucu başarı durumunu güncelle
    if (connectedServer && serverSuccessRate[connectedServer]) {
        serverSuccessRate[connectedServer].success += 1;
    }

    // Bağlantı zaman aşımı zamanlayıcısını temizle
    if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
    }

    // Login mesajını gönder
    request(loginRequestBuilder, demo);

    // Veri akışı kontrolü - kısa bir süre sonra veri akışı başlamadıysa başka sunucuya geç
    // setTimeout(() => {
    //     // Son mesaj zamanı kontrol et, eğer açılıştan sonra hiç mesaj alınmadıysa
    //     const timeSinceOpen = Date.now() - lastMessageReceived;
    //     if (timeSinceOpen > 3000) {
    //         // 3 saniye içinde veri akışı başlamadıysa
    //         // Bağlantıyı yenile
    //     console.log("forceReconnect logusadıakhfkasafghjshjdfshjkgshgjkfssghjkfsafdkghjdfshgkdsf");
    //         forceReconnect();
    //     }
    // }, 3000);

    // Bağlantı açıldıktan sonra periyodik kontrol zamanlayıcısını başlat
    startConnectionCheckTimer();
    startHeartbeatTimer();
    startVerifyConnectionTimer();
}

function startConnectionCheckTimer() {
    // Önceki zamanlayıcıyı temizle
    if (connectionCheckTimer) {
        clearInterval(connectionCheckTimer);
    }

    // Her 30 saniyede bir bağlantı durumunu kontrol et
    connectionCheckTimer = setInterval(() => {
        if (ws && ws.readyState >= 2) {
            // CLOSING veya CLOSED
            // console.log("Bağlantı kopmuş durumda, yeniden bağlanılıyor...");
            wsReconnect();
        }
    }, 30000);
}

function stopConnectionCheckTimer() {
    if (connectionCheckTimer) {
        clearInterval(connectionCheckTimer);
        connectionCheckTimer = null;
    }
}

function startHeartbeatTimer() {
    // Önceki zamanlayıcıyı temizle
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
    }

    // Her 15 saniyede bir heartbeat gönder
    heartbeatTimer = setInterval(() => {
        if (ws && ws.readyState === 1) {
            try {
                ws.send(`X${SEP1}PING${SEP1}${SEP1}`);
                // console.log("Heartbeat gönderildi");
            } catch (error) {
                // console.error("Heartbeat gönderme hatası:", error);
                realConnectionOpen = false;
                wsReconnect();
            }
        } else {
            realConnectionOpen = false;
            wsReconnect();
        }
    }, 15000); // 30 saniyeden 15 saniyeye düşürüldü
}

function stopHeartbeatTimer() {
    if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

function startVerifyConnectionTimer() {
    // Önceki zamanlayıcıyı temizle
    if (verifyConnectionTimer) {
        clearInterval(verifyConnectionTimer);
    }

    // Her 5 saniyede bir son mesaj alınma zamanını kontrol et
    verifyConnectionTimer = setInterval(() => {
        if (!lastMessageReceived) return;

        const now = Date.now();
        const timeSinceLastMessage = now - lastMessageReceived;

        // Belirli bir süreden fazla mesaj alınmadıysa ve bağlantı açık görünüyorsa
        if (timeSinceLastMessage > MAX_INACTIVE_TIME && ws && ws.readyState === 1) {
            // console.log(`Son mesajdan bu yana ${timeSinceLastMessage}ms geçti, bağlantı testi yapılıyor...`);

            // Bağlantıyı test et
            try {
                ws.send(`X${SEP1}PING${SEP1}${SEP1}`);

                // 2 saniye içinde cevap alınmazsa bağlantıyı yenile
                setTimeout(() => {
                    const newTimeSinceLastMessage = Date.now() - lastMessageReceived;
                    if (newTimeSinceLastMessage > MAX_INACTIVE_TIME) {
                        // console.log("PING'e cevap alınamadı, bağlantı yenileniyor...");
                        forceReconnect();
                    }
                }, 2000);
            } catch (error) {
                // console.error("Bağlantı testi hatası:", error);
                forceReconnect();
            }
        }
    }, 5000);
}

function stopVerifyConnectionTimer() {
    if (verifyConnectionTimer) {
        clearInterval(verifyConnectionTimer);
        verifyConnectionTimer = null;
    }
}

const close = () => {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    stopConnectionCheckTimer();
    stopHeartbeatTimer();
    stopVerifyConnectionTimer();

    if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
    }

    // console.log("WebSocket kapatılıyor...");
    realConnectionOpen = false;
    // _wsInitialized = false;
    pendingConnect = false;

    if (ws) {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        ws.close();
        ws = undefined;
    }

    if (delayedWs) {
        delayedWs.close();
        delayedWs = undefined;
    }
};

function handleClose(event: any) {
    wssControl = "close";
    realConnectionOpen = false;
    // _wsInitialized = false;
    pendingConnect = false;

    // Kapanma kodunu ve nedenini kontrol et
    // let closeReason = "bilinmeyen";
    // if (event && event.code) {
    //     switch (event.code) {
    //         case 1000:
    //             closeReason = "normal kapanma";
    //             break;
    //         case 1001:
    //             closeReason = "taşınma";
    //             break;
    //         case 1002:
    //             closeReason = "protokol hatası";
    //             break;
    //         case 1003:
    //             closeReason = "kabul edilemez veri";
    //             break;
    //         case 1006:
    //             closeReason = "anormal kapanma";
    //             break;
    //         case 1007:
    //             closeReason = "tutarsız veri";
    //             break;
    //         case 1008:
    //             closeReason = "politika ihlali";
    //             break;
    //         case 1009:
    //             closeReason = "çok büyük mesaj";
    //             break;
    //         case 1010:
    //             closeReason = "uzantı eksik";
    //             break;
    //         case 1011:
    //             closeReason = "beklenmeyen durum";
    //             break;
    //         case 1015:
    //             closeReason = "TLS başarısız";
    //             break;
    //         default:
    //             closeReason = `kod ${event.code}`;
    //     }
    // }

    // Sunucu başarısızlık durumunu kaydet
    if (connectedServer) {
        if (serverSuccessRate[connectedServer]) {
            serverSuccessRate[connectedServer].failure += 1;
        }

        // Sunucu başarısız oldu, bir sonraki sunucuya geç
        const randomIndex = Math.floor(Math.random() * pool.realtime.length);
        connectedServer = pool.realtime[randomIndex];
        server = connectedServer;
    }

    // Durumu güncelle
    if (event && (event.code === 1000 || event.code === 1001)) {
        if (lastState === "active" && username && !isAnotherConnect) {
            setTimeout(() => {
                wsReconnect();
            }, 100); // 300'den 100'e düşürüldü
        }
    } else {
        if (inactivityTimer) {
            clearTimeout(inactivityTimer);
            inactivityTimer = null;
        }

        stopConnectionCheckTimer();
        stopHeartbeatTimer();
        stopVerifyConnectionTimer();

        if (connectionTimeout) {
            clearTimeout(connectionTimeout);
            connectionTimeout = null;
        }

        if (lastState === "active" && username && !isAnotherConnect) {
            setTimeout(() => {
                if (connectionTimeout) {
                    clearTimeout(connectionTimeout);
                    connectionTimeout = null;
                }
                pendingConnect = false;
                wsReconnect();
            }, 100); // 300'den 100'e düşürüldü
        }
    }
}

function handleError(ev: any) {
    wssControl = "error";
    // console.error("WebSocket bağlantı hatası:", ev);
    realConnectionOpen = false;

    // Hata durumunda otomatik olarak yeniden bağlan
    if (lastState === "active" && username && !isAnotherConnect) {
        // console.log("Bağlantı hatası, yeniden bağlanmaya çalışılıyor...");
        setTimeout(() => {
            wsReconnect();
        }, 2000);
    }
}

const handleMessage = (ev: MessageEvent) => {
    wssControl = "connect";

    // Son mesaj alınma zamanını güncelle
    lastMessageReceived = Date.now();
    realConnectionOpen = true;

    // Gelen mesajları logla
    if (__DEV__) {
        if (ev.data.includes("PING") || ev.data.includes("26")) {
            // PING mesajlarını ve gerçek zamanlı güncellemeleri loglamaya gerek yok
        } else {
            // console.log(`WebSocket MESAJ alındı: ${ev.data.substring(0, 50)}...`);
        }
    }

    ev.data
        .split(SEPEOL)
        .forEach((message: string) => processMessage(message));

    // İnaktivite zamanlayıcısını sıfırla
    resetInactivityTimer();
};

function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }

    inactivityTimer = setTimeout(handleInactivity, 5000);
}

const handleInactivity = () => {
    // Oturum açılmamışsa işlem yapma
    if (!username) {
        return;
    }

    if (isAnotherConnect) {
        return null;
    }

    flashMessage({
        message: "Bağlantınız kontrol ediliyor.",
        type: "warning",
    });

    if (lastState === "active" && ws && ws.readyState !== 1) {
        wsReconnect();
    } else if (ws && ws.readyState === 1) {
        // Bağlantı açık ve aktifse ping gönder
        try {
            ws.send(`X${SEP1}PING${SEP1}${SEP1}`);
            // console.log("Ping gönderildi");
        } catch (error) {
            // console.error("Ping gönderme hatası:", error);
            wsReconnect();
        }
    }
};

const serverProvider = (poolType: any) => () => {
    try {
        // İlk bağlantıda rastgele sunucu seçimi (%50-%50)
        const servers = pool[poolType] || [];

        if (servers.length === 0) {
            return "wss://ms75.idealdata.com.tr"; // Varsayılan sunucu
        }

        // Rastgele index seçimi
        const randomIndex = Math.floor(Math.random() * servers.length);
        const selectedServer = servers[randomIndex];

        // Seçilen sunucuyu kaydet
        connectedServer = selectedServer;
        server = connectedServer;

        return "wss://" + selectedServer;
    } catch (error) {
        // Hata durumunda varsayılan sunucuya dön
        return "wss://ms75.idealdata.com.tr";
    }
};

// const serverProviderDelay = (pool: any) => () => {
//     connectedServerDelay = getServer(pool);
//     return "wss://" + connectedServerDelay;
// };

function login(
    user: string,
    pass: string,
    isDemo = false,
    symLength: any = "0",
    authorized: string,
) {
    // İnaktivite zamanlayıcısını temizle
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }

    username = user;
    password = pass;
    demo = isDemo;
    symbolLength = symLength;
    Authorized = authorized;
    // WebSocket bağlantısının durumunu kontrol et
    const shouldReconnect = !ws || ws.readyState >= 2;

    // Eğer WebSocket bağlantısı açık veya bağlanmaya çalışıyorsa ve
    // kullanıcı bilgileri değişmişse mevcut bağlantıyı kapat ve yeniden bağlan
    if (ws && ws.readyState <= 1) {
        ws.close();
        setupRealtimeSocket(); // Hemen yeni bağlantı kur
    } else if (shouldReconnect) {
        setupRealtimeSocket();
    }

    // AppState listener'ı bir kez eklemek için önce temizle
    if (appStateSubscription) {
        appStateSubscription.remove();
        appStateSubscription = null;
    }

    // Yeni AppState aboneliği oluştur
    appStateSubscription = AppState.addEventListener(
        "change",
        handleAppStateChange
    );
}

function handleAppStateChange(nextAppState: string | null) {
    // console.log(`Uygulama durumu değişti: ${lastState} -> ${nextAppState}`);

    if (lastState !== "background" && nextAppState === "background") {
        // Uygulama arka plana geçtiğinde
        console.log("Uygulama arka plana geçti, bağlantı kapatılıyor");
        if (ws) {
            ws.close();
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
            }
            stopConnectionCheckTimer();
            store.dispatch(hideReconnect());

        }
    } else if (lastState === "background" && nextAppState === "active") {
        // Uygulama ön plana geçtiğinde
        console.log("Uygulama ön plana geçti, bağlantı yeniden açılıyor");
        if (!ws || ws.readyState >= 2) {
            Authorized = "0";
            isAnotherConnect = false;
            setupRealtimeSocket();
            store.dispatch(hideReconnect());

        }
    }

    lastState = nextAppState;
}

function wsReconnect() {
    socketReconnectAttempts++;

    if (socketReconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
        socketReconnectAttempts = 0;
        // flashMessage({
        //   message:
        //     "Bağlantı kurulamıyor. Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.",
        //   type: "danger",
        //   duration: 5000,
        // });
        return;
    }

    // WebSocket kapatılıp yeniden açılmalı
    if (ws) {
        try {
            // Tüm zamanlayıcıları temizle
            if (inactivityTimer) {
                clearTimeout(inactivityTimer);
                inactivityTimer = null;
            }
            stopConnectionCheckTimer();
            stopHeartbeatTimer();
            stopVerifyConnectionTimer();
            if (connectionTimeout) {
                clearTimeout(connectionTimeout);
                connectionTimeout = null;
            }

            // Önce callback'leri temizliyoruz
            ws.onopen = null;
            ws.onmessage = null;
            ws.onclose = null;
            ws.onerror = null;

            // Sonra WebSocket'i kapatıyoruz
            ws.close();
            ws = undefined;
        } catch (error) {
            ws = undefined;
        }
    }

    // Tüm durumları sıfırla
    pendingConnect = false;
    realConnectionOpen = false;
    // _wsInitialized = false;

    // Kısa bir bekleme süresi sonra yeni bağlantı kur
    setTimeout(() => {
        setupRealtimeSocket();
    }, 100); // 500'den 100'e düşürüldü
}

async function setupRealtimeSocket() {
    // Bağlantı zaten kurulma aşamasındaysa, tekrar denemeyi önle
    if (pendingConnect) {
        return;
    }

    pendingConnect = true;

    // Mevcut NetworkState'i kontrol et
    try {
        const networkState = await Network.getNetworkStateAsync();
        if (!networkState.isConnected) {
            pendingConnect = false;
            flashMessage({
                message: "İnternet bağlantınızı kontrol edin.",
                type: "danger",
            });
            return;
        }
    } catch (e) {
        // Network durumu alınamazsa devam et
    }

    // Tüm zamanlayıcıları temizle
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }
    stopConnectionCheckTimer();
    stopHeartbeatTimer();
    stopVerifyConnectionTimer();
    if (connectionTimeout) {
        clearTimeout(connectionTimeout);
        connectionTimeout = null;
    }

    // Mevcut WebSocket'i temizle
    if (ws) {
        try {
            ws.onopen = null;
            ws.onmessage = null;
            ws.onclose = null;
            ws.onerror = null;
            ws.close();
        } catch (e) {
            // Hata olursa devam et
        }
        ws = undefined;
    }

    // Session ID'yi yenile
    sessionId = {
        delayed: (Math.random() * 1000000000).toFixed(0),
        realtime: (Math.random() * 1000000000).toFixed(0),
    };

    // Yeni WebSocket bağlantısı oluştur
    try {
        // _wsInitialized = true;
        realConnectionOpen = false;

        const serverUrl = serverProvider(demo ? "delayed" : "realtime");

        ws = new ReconnectingWebSocket(serverUrl, [], {
            maxReconnectionDelay: 3000,
            minReconnectionDelay: 500,
            reconnectionDelayGrowFactor: 1.1,
            maxRetries: MAX_RECONNECT_ATTEMPTS,
            // debug: __DEV__,
        });

        // Bağlantı zaman aşımı
        connectionTimeout = setTimeout(() => {
            if (!realConnectionOpen && ws) {
                // Bağlantı açılamadıysa
                try {
                    // Önce callback'leri temizle
                    ws.onopen = null;
                    ws.onmessage = null;
                    ws.onclose = null;
                    ws.onerror = null;

                    // Sonra kapat
                    ws.close();
                } catch (e) {
                    // Hata olursa devam et
                }

                // Durumları temizle
                ws = undefined;
                // _wsInitialized = false;
                pendingConnect = false;

                // Yeniden dene
                setTimeout(() => {
                    wsReconnect();
                }, 300); // 500 -> 300 ms
            }
        }, CONNECTION_TIMEOUT);

        // Event handler'ları ayarla
        ws.onopen = handleOpen;
        ws.onmessage = handleMessage;
        ws.onclose = handleClose;
        ws.onerror = handleError;
    } catch (error) {
        // _wsInitialized = false;
        pendingConnect = false;
        realConnectionOpen = false;

        flashMessage({
            message: "Bağlantı kurulurken bir hata oluştu.",
            type: "danger",
        });
    }
}

function logout() {
    username = "";
    password = "";
    demo = false;
    close();
    wssControl = "close";
    Authorized = "";

    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
    }

    stopConnectionCheckTimer();

    // AppState aboneliğini temizle
    if (appStateSubscription) {
        appStateSubscription.remove();
        appStateSubscription = null;
    }
}


function request(builder: Function, ...args: any[]) {
    if ( username === "" || password === "") {
        console.log("username veya password yok, istek gönderilmeyecek");
        return;
    }
    if (lastState !== "active") {
        // console.log("Uygulama aktif değil, istek gönderilmeyecek");
        return;
    }

    if (!ws) {
        // console.log("WebSocket bağlantısı yok, istek gönderilmeyecek");
        wsReconnect();
        return;
    }

    // WebSocket bağlantı durumunu kontrol et
    if (ws.readyState !== 1) {
        // OPEN değilse
        // console.log(`WebSocket bağlantı durumu uygun değil: ${ws.readyState}`);

        if (ws.readyState >= 2) {
            // CLOSING veya CLOSED
            wsReconnect();
        }

        return;
    }

    if (!realConnectionOpen) {
        // console.log("Gerçek bağlantı açık değil, yeniden bağlanılıyor...");
        wsReconnect();
        return;
    }

    let message = "";
    const builtMessage = builder ? builder() : "";

    if (!builtMessage) {
        // console.error("Builder function returned undefined or empty string.");
        return;
    }

    const isTekOneriContent =
        builtMessage.includes("REQ_NEWS_CONTENT");
    const isConnectionRequest =
      builtMessage.includes("CON");
      //console.log("isConnectionRequest", isConnectionRequest);


    if (!isTekOneriContent && isConnectionRequest) {
        //console.log("isConnectionRequest içerisinde");
        message = builder(
            username,
            password,
            demo ? sessionId?.delayed : sessionId?.realtime,
            Authorized,
            symbolLength,
            ...args
        );
        console.log("login", username, password, demo ? sessionId?.delayed : sessionId?.realtime, symbolLength, ...args);
    } else {
        // console.log(username);
        message = builder(
            username,
            password,
            demo ? sessionId?.delayed : sessionId?.realtime,
            ...args
        );
    }

    if (__DEV__ && ws && ws.readyState === 1) {
        console.log("Request:", message.replace(new RegExp(SEP1, "g"), " "));
        // console.log(
        //   `İstek gönderiliyor: ${message
        //     .replace(new RegExp(SEP1, "g"), " ")
        //     .substring(0, 50)}...`
        // );
    }

    try {
        ws.send(message);
        resetInactivityTimer(); // İstek gönderildikten sonra inaktivite sayacını sıfırla
    } catch (error) {
        // console.error("WebSocket mesaj gönderme hatası:", error);
        realConnectionOpen = false;
        wsReconnect();
    }
}

function turkishToAsciiUpper(str: any) {
    if (!str) return "";

    // Önce Türkçe kurallarına göre büyük harfe dönüştür
    let upper = str.toLocaleUpperCase("tr-TR");

    // Ardından Türkçe harfleri ASCII muadilleriyle değiştir
    // (Ü -> U, Ö -> O, Ç -> C, Ş -> S, Ğ -> G, İ -> I)
    upper = upper
        .replace(/Ü/g, "U")
        .replace(/Ö/g, "O")
        .replace(/Ç/g, "C")
        .replace(/Ş/g, "S")
        .replace(/Ğ/g, "G")
        .replace(/İ/g, "I");

    return upper;
}

// BrokerageList tanımlaması için genişletme
interface ExtendedBrokerageList {
    page?: string;
    code?: string;
}

export const reqList = () => {
    if (!ws || ws.readyState !== 1) {
        // console.log("WebSocket bağlantısı yok veya açık değil, sembol listesi isteği gönderilmeyecek");
        return;
    }

    let page = store.getState().pageLastBrokerages || {} as ExtendedBrokerageList;

    if (wssControl === "connect") {
        // const lists = store.getState().watchLists.lists;
        // const selectedIndex = store.getState().watchLists.selectedIndex;

        // Geçerli sayfayı takip et
        const currentPage = page.page || "";
        if (currentPage !== lastPageVisited) {
            console.log(`Sayfa değişti: ${lastPageVisited} -> ${currentPage}`);
            lastPageVisited = currentPage;
        }

        /*  if (page?.page === "Markets") {
             // console.log("Markets sayfası için sembol isteği gönderiliyor");
             const selectedMarket = turkishToAsciiUpper(
                 store.getState().markets?.lists?.selected?.title
             );
             request(symbolSend, selectedMarket, " ");
         } else if (page?.page !== "Detail") {
             // console.log("Watchlist sayfası için sembol isteği gönderiliyor");
             const prefixler = lists[selectedIndex]?.codes
                 .map((sembol: string) => sembol)
                 .filter((composite: string) => composite !== undefined);
 
             const formattedString = prefixler?.join(SEP2);
             if (formattedString) {
                 request(symbolSend, " ", formattedString);
             }
         } else if (page?.page === "Detail" && page?.code) {
             // console.log("Detay sayfası için sembol isteği gönderiliyor:", page.code);
             request(symbolSend, "", page.code);
         } */
    } else {
        // console.log("WebSocket bağlantısı hazır değil");
        if (username && lastState === "active") {
            wsReconnect();
        }
    }
};

function processMessage(message: string) {
    // Son mesaj alınma zamanını güncelle
    lastMessageReceived = Date.now();

    if (message.substring(0, 2) !== `Y${SEP1}` || !username) {
        return;
    }

    const type = message.split(SEP1)[1];

    // Önemli: LOG mesajı - Mesaj alındığını doğrulama
    if (type !== "26" && type !== "PING") {
        // Gereksiz logları önle
        //console.log(`Mesaj alındı (type: ${type})`);
    }

    // Eğer demo değilse delayed'den gelen login success mesajını görmezden gel
    if (type === "35" && !demo && false) {
        return;
    }

    if (type in parsers) {
        parsers[type](
            store,
            message.substring(3 + type.length),
            username,
            password,
            false,
            delayedPay,
            delayedViop,
            demo
        );

        if (type === "35") {
            let page = store.getState().pageLastBrokerages || {} as ExtendedBrokerageList;

            if (demo) {
                if (wssControl === "connect") {
                        const prefixler = defaultDemoList[0]?.codes?.map((sembol) => {
                            return sembol;
                        }).filter((composite) => composite !== undefined);
                        const formattedString = prefixler?.join(SEP2);
                        if (formattedString) {
                            request(symbolSend, " ", formattedString);
                        }
                        store.dispatch(updateAll(defaultDemoList));
                }
            }
            else {
                if (page.page !== "Markets") {
                    if (page.page === "SymbolSearcherList") {
                        // Do nothing specific for SymbolSearcherList
                    }
                    else if (page?.page === "DetailOrderBook") {
                        request(orderBookReq, page?.code);
                    }
                     else if (page.page === "Detail" && page.code) {
                        request(symbolSend, "", page.code);
                    } else {
                        getWatchlists({ username: username })
                            .then(({ data }) => {
                                const updatedData = data.map((item) => ({
                                    ...item,
                                    codes: item.codes.map((code) => (code === null ? "" : code)),
                                }));
                                if (updatedData.length > 0) {
                                    store.dispatch(updateAll(updatedData));
                                } else {
                                    if (wssControl === "connect") {
                                        const localArrayIndex =
                                            store.getState().watchLists?.selectedIndex;
                                        const localArray = store.getState().watchLists?.lists;
                                        if (localArray.length > 0) {
                                            const prefixler = localArray[localArrayIndex]?.codes
                                                .map((sembol) => {
                                                    const composite = sembol;
                                                    return composite;
                                                })
                                                .filter((composite) => composite !== undefined);
                                            const formattedString = prefixler?.join(SEP2);
                                            formattedString
                                                ? request(symbolSend, " ", formattedString)
                                                : null;

                                            store.dispatch(updateAll(localArray));
                                        } else {
                                            const prefixler =
                                                defaultWatchlist &&
                                                defaultWatchlist
                                                    .map((sembol) => {
                                                        const composite = sembol;
                                                        return composite;
                                                    })
                                                    .filter((composite) => composite !== undefined);
                                            const formattedString = prefixler?.join(SEP2);
                                            formattedString
                                                ? request(symbolSend, " ", formattedString)
                                                : null;

                                            store.dispatch(updateAll(localArray));
                                        }
                                    }
                                }
                            })
                            .catch((err) => {
                                flashMessage({
                                    message: "Takip listeniz senkronize edilirken hata oluştu.",
                                    type: "danger",
                                });
                                if (wssControl === "connect") {
                                    const localArrayIndex =
                                        store.getState().watchLists?.selectedIndex;
                                    const localArray = store.getState().watchLists?.lists;
                                    if (localArray.length > 0) {
                                        const prefixler = localArray[localArrayIndex]?.codes
                                            .map((sembol) => {
                                                const composite = sembol;
                                                return composite;
                                            })
                                            .filter((composite) => composite !== undefined);
                                        const formattedString = prefixler?.join(SEP2);
                                        if (formattedString) {
                                            request(symbolSend, " ", formattedString);
                                        }
                                        store.dispatch(updateAll(localArray));
                                    } else {
                                        const prefixler =
                                            defaultWatchlist &&
                                            defaultWatchlist
                                                .map((sembol) => {
                                                    const composite = sembol;
                                                    return composite;
                                                })
                                                .filter((composite) => composite !== undefined);
                                        const formattedString = prefixler?.join(SEP2);
                                        if (formattedString) {
                                            request(symbolSend, " ", formattedString);
                                        }
                                        store.dispatch(updateAll(localArray));
                                    }
                                } else if (page.page === "Markets") {
                                    const selectedMarket =
                                        store.getState().markets?.lists?.selected?.title;
                                    const titleValue = turkishToAsciiUpper(selectedMarket);
                                    request(symbolSend, titleValue, " ");
                                }
                            });
                    }
                }
            }
            if (page?.page === "Markets") {
                const selectedMarket = store.getState().markets?.lists?.selected?.title;
                const titleValue = turkishToAsciiUpper(selectedMarket);
                request(symbolSend, titleValue, " ");
            }
        } else if (type === "43") {
            reqList();
        }
    } else if (type === "SRV_BASKA_BAGLANTI") {
        isAnotherConnect = true;
        ws?.close();
        close();
        store.dispatch(showReconnect());
    }
     
      else if (type === "CON") {
        console.log("message.split(SEP1)[4] if içerisinde", message.split(SEP1)[4]);
    if (message.split(SEP1)[4] == "3") {
        console.log("controle geldi.");
        control();
    } else {
        console.log("message.split(SEP1)[4] else içerisi", message.split(SEP1)[4]);
        control();
    }
}

        else if (type in subscribers && subscribers[type].length > 0) {
        // Subscribers [this might be global in the future]
        subscribers[type].forEach((cb) => cb(message));
    } else if (__DEV__) {
        if (type === "43") {
            // Skip logging for type 43
        } else {
            console.log("Unknown", type, message);
        }
    }
}

// function getServer(poolType: string) {
//     if (poolType) {
//         if (forcedServer[poolType]) {
//             return forcedServer[poolType];
//         } else {
//             return pool[poolType][Math.floor(Math.random() * pool[poolType].length)];
//         }
//     }
// }

function subscribe(type: string, cb: (data: any) => void): () => void {
    if (!subscribers.hasOwnProperty(type)) {
        subscribers[type] = [];
    }

    subscribers[type].push(cb);

    return () => {
        subscribers[type] = subscribers[type].filter((c) => c !== cb);
    };
}



function setIsAnotherConnect(value: boolean) {
    isAnotherConnect = value;

    // Eğer false olarak ayarlanıyorsa ve son durumumuz active ise bağlantıyı kontrol et
    if (!value && lastState === "active" && (!ws || ws.readyState !== 1)) {
        wsReconnect();
    }
}



function setIsAuthorized(value: string) {
    Authorized = value;
    console.log("Authorized =>=>>=>=>=>=>>=>=>=>=>=>=>=>=>>=>=>=>=>=>=>", Authorized, value);

}

// Sayfa değişikliklerinde bağlantı durumunu kontrol eden fonksiyon
export function checkConnectionOnPageChange(pageName: string) {
    console.log(`Sayfa değişikliği: ${pageName}`);
    lastPageVisited = pageName;

    // WebSocket bağlantısını kontrol et
    if (!ws || ws.readyState !== 1) {
        console.log(
            "Sayfa değişikliğinde bağlantı kopuk tespit edildi, yeniden bağlanılıyor"
        );
        wsReconnect();
    } else {
        // Bağlantı varsa ve sayfa Watchlist ise sembol listesini yeniden iste
        if (pageName === "WatchList") {
            reqList();
        }
    }
}

// Bağlantıyı zorla yeniden kurma fonksiyonu
function forceReconnect() {
    // console.log("Bağlantı zorla yenileniyor...");

    if (ws) {
        try {
            // Önce tüm timerleri durdur
            stopConnectionCheckTimer();
            stopHeartbeatTimer();
            stopVerifyConnectionTimer();

            // WebSocket nesnesini zorla kapat
            ws.close();
            ws = undefined;
        } catch (error) {
            // console.error("WebSocket kapatılırken hata:", error);
        }
    }

    // Hemen yeni bağlantı kur
    setTimeout(() => {
        console.log("forceReconnect setupRealtimeSocket logusadıakhfkasafghjshjdfshjkgshgjkfssghjkfsafdkghjdfshgkdsf");
        setupRealtimeSocket();
    }, 500);
}

// const handleWhiteLabelCrm = async (message: string) => {
//     // Portfolio modülü kaldırıldığı için bu fonksiyon devre dışı
//     return;
// }
 
 



export {
    demo,
    server,
    login,
    logout,
    request,
    subscribe,
    //selectNewServer,
    handleAppStateChange,
    wssControl,
    ws,
    setIsAnotherConnect,
    username,
    // delayedRequest,
    setupRealtimeSocket,
    wsReconnect,
    forceReconnect,
    lastState,
    setIsAuthorized,
    getConnectedServer,

};

