import { ExtensionStorage } from '@bacons/apple-targets';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { clearLocalWidgetData, syncLocalWidgetData } from '@/widgets/sync-local-widget-data';

/**
 * Mirrors on-device local-mode data into the iOS widget's shared App Group
 * storage as local mode starts/ends, same pattern as `useSyncWidgetAuth` for
 * the session cookie. No-op on Android and web — the Android widget task
 * reads local-db directly, no mirroring needed there.
 */
export function useSyncWidgetLocalData(isLocal: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    if (isLocal) {
      syncLocalWidgetData().then(() => ExtensionStorage.reloadWidget());
    } else {
      clearLocalWidgetData();
      ExtensionStorage.reloadWidget();
    }
  }, [isLocal]);
}
