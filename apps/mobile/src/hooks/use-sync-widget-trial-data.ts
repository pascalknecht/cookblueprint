import { ExtensionStorage } from '@bacons/apple-targets';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { clearTrialWidgetData, syncTrialWidgetData } from '@/widgets/sync-trial-widget-data';

/**
 * Mirrors local trial-mode data into the iOS widget's shared App Group
 * storage as trial mode starts/ends, same pattern as `useSyncWidgetAuth` for
 * the session cookie. No-op on Android and web — the Android widget task
 * reads local-db directly, no mirroring needed there.
 */
export function useSyncWidgetTrialData(isTrial: boolean) {
  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    if (isTrial) {
      syncTrialWidgetData().then(() => ExtensionStorage.reloadWidget());
    } else {
      clearTrialWidgetData();
      ExtensionStorage.reloadWidget();
    }
  }, [isTrial]);
}
