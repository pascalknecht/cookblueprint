import { Modal, StyleSheet } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { useHtmlFetcher } from '@/store/html-fetcher';

const EXTRACT_JSON_LD_SCRIPT = `
(function () {
  function extract() {
    var nodes = document.querySelectorAll('script[type="application/ld+json"]');
    return Array.prototype.map.call(nodes, function (node) {
      return '<script type="application/ld+json">' + (node.textContent || '') + '</script>';
    }).join('');
  }
  var sent = false;
  function send(html) {
    if (sent) return;
    sent = true;
    window.ReactNativeWebView.postMessage(JSON.stringify({ ok: true, html: html }));
  }
  var found = extract();
  if (found) {
    send(found);
  } else {
    // Client-rendered pages may only inject their JSON-LD after hydration.
    setTimeout(function () { send(extract()); }, 900);
  }
  true;
})();
`;

/**
 * Mounted once near the app root (see _layout.tsx). Renders nothing until
 * HtmlFetcherProvider has a pending URL, then loads it off-screen just long
 * enough to read the page's JSON-LD back via postMessage — this is what lets
 * recipe import work without a signed-in session, where there's no backend
 * to do the fetch, and it also runs the page's own JS first, so
 * client-rendered recipe sites work too.
 *
 * The WebView lives inside a transparent Modal rather than as a plain sibling
 * of the root <Stack> in _layout.tsx. Mounted directly there, it corrupts the
 * Stack's Fabric layout on Android — the whole app squishes into a small rect
 * the moment it starts loading a real URL. A Modal mounts its content into its
 * own native window (a separate Dialog on Android), decoupled from the
 * Stack's view tree, so the WebView can't affect its layout.
 */
export function HtmlFetcherWebView() {
  const { pendingUrl, resolvePending, rejectPending } = useHtmlFetcher();

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as { ok: boolean; html?: string };
      if (payload.ok && payload.html) {
        resolvePending(payload.html);
      } else {
        rejectPending(new Error('Could not read that page.'));
      }
    } catch {
      rejectPending(new Error('Could not read that page.'));
    }
  }

  return (
    <Modal visible={!!pendingUrl} transparent animationType="none" onRequestClose={() => {}}>
      {pendingUrl ? (
        <WebView
          source={{ uri: pendingUrl }}
          style={styles.hidden}
          pointerEvents="none"
          // Hardware-layer WebViews corrupt Fabric's Android root surface —
          // it gets stuck letterboxed to a width-by-width square the moment
          // one mounts, and that never recovers once the WebView unmounts.
          // Software rendering avoids the GPU layer that triggers it; cost is
          // negligible since this WebView is never actually shown on screen.
          androidLayerType="software"
          injectedJavaScript={EXTRACT_JSON_LD_SCRIPT}
          onMessage={handleMessage}
          onError={() => rejectPending(new Error("Couldn't reach that URL."))}
          onHttpError={() => rejectPending(new Error("Couldn't reach that URL."))}
        />
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  hidden: { position: 'absolute', top: -9999, width: 1, height: 1, opacity: 0 },
});
