import { StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { NEEDLE_HOST_BASE_URL, NEEDLE_HOST_HTML } from '@/lib/needle-host';
import { useNeedle } from '@/store/needle';

/**
 * Hidden WebView that loads Needle 2 and keeps it warm for recipe import.
 * Ingredient lines are posted in; structured amount/unit/name comes back.
 */
export function NeedleWebView() {
  const { webViewRef, handleMessage, handleUnavailable } = useNeedle();

  function onMessage(event: WebViewMessageEvent) {
    handleMessage(event.nativeEvent.data);
  }

  return (
    <WebView
      ref={webViewRef}
      source={{ html: NEEDLE_HOST_HTML, baseUrl: NEEDLE_HOST_BASE_URL }}
      style={styles.hidden}
      pointerEvents="none"
      originWhitelist={['*']}
      javaScriptEnabled
      domStorageEnabled
      cacheEnabled
      mixedContentMode="always"
      onMessage={onMessage}
      onError={handleUnavailable}
    />
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', top: -9999, width: 1, height: 1, opacity: 0 },
});
