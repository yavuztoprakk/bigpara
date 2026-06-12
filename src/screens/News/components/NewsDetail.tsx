import React, { useState, useRef, useCallback } from "react";
import { View, StyleSheet, Animated } from "react-native";
import LottieView from "lottie-react-native";
import { WebView } from "react-native-webview";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../../../theme/ThemeContext";

// bigpara sayfa header'ını gizler + DOM yapısını debug için raporlar
// CSS + DOM'dan silme + MutationObserver + body ilk çocuk fallback
const HIDE_BIGPARA_HEADER_JS = `
  (function() {
    var STYLE_ID = '__bigparaHideHeaderStyle';
    var SELECTORS = 'header,header.header-bigpara,.header-bigpara,.header,.topbar,.top-bar,.main-header,.site-header,.app-header,.nav-header,nav.header,[class*="header-bigpara"],[class*="HeaderBigpara"],[class*="topHeader"],[class*="TopHeader"],[class*="MobileHeader"],[class*="mobile-header"]';
    var CSS = SELECTORS + '{display:none !important;height:0 !important;min-height:0 !important;max-height:0 !important;overflow:hidden !important;visibility:hidden !important;opacity:0 !important;position:absolute !important;top:-9999px !important;pointer-events:none !important;}';
    var injectStyle = function() {
      if (document.getElementById(STYLE_ID)) return;
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.type = 'text/css';
      style.appendChild(document.createTextNode(CSS));
      (document.head || document.documentElement).appendChild(style);
    };
    var removeMatching = function() {
      try {
        var nodes = document.querySelectorAll(SELECTORS);
        for (var i = 0; i < nodes.length; i++) {
          if (nodes[i] && nodes[i].parentNode) nodes[i].parentNode.removeChild(nodes[i]);
        }
      } catch(e) {}
    };
    var reportDOM = function() {
      try {
        if (!document.body) return;
        // Ekranın sol-üst köşesindeki gerçek görünen elementin ata zincirini topla
        var points = [[10, 20], [50, 50], [100, 80], [150, 100]];
        var chains = [];
        for (var p = 0; p < points.length; p++) {
          var el = document.elementFromPoint(points[p][0], points[p][1]);
          var chain = [];
          var safety = 0;
          while (el && safety < 8) {
            chain.push({
              tag: el.tagName,
              id: el.id || null,
              cls: (typeof el.className === 'string') ? el.className : (el.className && el.className.baseVal) || null,
              pos: (window.getComputedStyle(el).position) || null
            });
            el = el.parentElement;
            safety++;
          }
          chains.push({ point: points[p], chain: chain });
        }
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'TOP_PIXELS', chains: chains, url: location.href }));
        }
      } catch(e) {}
    };
    var run = function() { injectStyle(); removeMatching(); };
    var lastReport = 0;
    var throttledReport = function() {
      var now = Date.now();
      if (now - lastReport < 2000) return;
      lastReport = now;
      reportDOM();
    };
    run();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { run(); throttledReport(); });
    } else {
      throttledReport();
    }
    window.addEventListener('load', function() { run(); throttledReport(); });
    setTimeout(throttledReport, 2500);
    setTimeout(throttledReport, 5000);
    try {
      var observer = new MutationObserver(run);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    } catch(e) {}
    true;
  })();
`;

const NewsDetail = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const { url } = route.params;
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const webViewRef = useRef<WebView>(null);

  const reapplyHideHeader = useCallback(() => {
    webViewRef.current?.injectJavaScript(HIDE_BIGPARA_HEADER_JS);
  }, []);

  const handleWebViewMessage = useCallback((event: { nativeEvent: { data: string } }) => {
    // Debug: WebView'den DOM yapısı raporu
    console.log("[NewsDetail DOM]", event.nativeEvent.data);
  }, []);

  console.log("haber detay urli nedir", url)

  const hideLoader = useCallback(() => {
    if (!loading) return;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setLoading(false));
  }, [loading, fadeAnim]);

  const handleNavigationRequest = useCallback(
    (request: { url: string; isTopFrame?: boolean }) => {
      if (request.isTopFrame === false) return true;
      if (request.url.startsWith("about:")) return true;
      return true;
    },
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.darkerBrand }]}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={HIDE_BIGPARA_HEADER_JS}
        injectedJavaScript={HIDE_BIGPARA_HEADER_JS}
        onLoadStart={reapplyHideHeader}
        onLoadProgress={reapplyHideHeader}
        onLoadEnd={reapplyHideHeader}
        onMessage={handleWebViewMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NewsDetail;
