import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, type CustomerInfo } from "react-native-purchases";

const REVENUECAT_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  default: undefined,
});

const isConfigured = !!REVENUECAT_API_KEY;

if (__DEV__) {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
}

if (isConfigured) {
  Purchases.configure({ apiKey: REVENUECAT_API_KEY });
} else if (__DEV__) {

  console.warn(
    "RevenueCat is not configured — set EXPO_PUBLIC_REVENUECAT_IOS_API_KEY / EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY.",
  );
}

// A tiny external store for the latest CustomerInfo, kept live by
// RevenueCat's update listener (fires after purchases, renewals, restores)
// and consumed via useSyncExternalStore — entitlement checks throughout the
// app need to react to that without polling.
export type CustomerInfoState =
  | { status: "pending" }
  | { status: "unavailable" }
  | { status: "ready"; info: CustomerInfo };

type Listener = () => void;

let customerInfoState: CustomerInfoState = isConfigured ? { status: "pending" } : { status: "unavailable" };
const listeners = new Set<Listener>();

function setCustomerInfo(info: CustomerInfo) {
  customerInfoState = { status: "ready", info };
  listeners.forEach((listener) => listener());
}

if (isConfigured) {
  Purchases.addCustomerInfoUpdateListener(setCustomerInfo);
  Purchases.getCustomerInfo()
    .then(setCustomerInfo)
    .catch(() => {
      // Leave state as "pending" — the update listener will still resolve
      // it as soon as a purchase or restore succeeds.
    });
}

export function subscribeToCustomerInfo(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCustomerInfoState(): CustomerInfoState {
  return customerInfoState;
}
