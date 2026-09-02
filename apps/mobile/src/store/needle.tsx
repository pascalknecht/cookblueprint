import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import * as Localization from 'expo-localization';
import type { WebView } from 'react-native-webview';
import type { NeedleIngredientExtract } from '@repo/shared';
import { NEEDLE_INGREDIENT_TOOLS } from '@repo/shared';

import i18n from '@/lib/i18n';

type NeedleCommand =
  | { type: 'init'; system: string; tools: typeof NEEDLE_INGREDIENT_TOOLS }
  | { type: 'extract'; id: string; lines: string[] };

type PendingExtract = {
  id: string;
  resolve: (items: (NeedleIngredientExtract | null)[]) => void;
};

type NeedleStore = {
  webViewRef: RefObject<WebView | null>;
  mounted: boolean;
  extractIngredients: (lines: string[]) => Promise<(NeedleIngredientExtract | null)[]>;
  handleMessage: (raw: string) => void;
  handleUnavailable: () => void;
};

const NeedleContext = createContext<NeedleStore | null>(null);

const READY_TIMEOUT_MS = 45_000;
const EXTRACT_TIMEOUT_MS = 30_000;

function needleLocale(): string {
  if (i18n.language.startsWith('de')) return 'de-DE';
  const tag = Localization.getLocales()[0]?.languageTag ?? '';
  if (tag.toLowerCase().startsWith('en-gb')) return 'en-GB';
  return 'en-US';
}

export function NeedleProvider({ children }: { children: ReactNode }) {
  const webViewRef = useRef<WebView | null>(null);
  const [mounted, setMounted] = useState(false);
  const readyRef = useRef(false);
  const unavailableRef = useRef(false);
  const engineRef = useRef(false);
  const waitersRef = useRef<((ok: boolean) => void)[]>([]);
  const pendingRef = useRef<PendingExtract | null>(null);

  const flushWaiters = useCallback((ok: boolean) => {
    const waiters = waitersRef.current.splice(0);
    for (const waiter of waiters) waiter(ok);
  }, []);

  const markUnavailable = useCallback(() => {
    unavailableRef.current = true;
    flushWaiters(false);
    pendingRef.current?.resolve([]);
    pendingRef.current = null;
  }, [flushWaiters]);

  const inject = useCallback((command: NeedleCommand) => {
    const js = `window.onNeedleCommand(${JSON.stringify(command)}); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, []);

  const waitForReady = useCallback(
    (ms: number) => {
      if (unavailableRef.current) return Promise.resolve(false);
      if (readyRef.current) return Promise.resolve(true);
      return new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => {
          waitersRef.current = waitersRef.current.filter((waiter) => waiter !== onReady);
          resolve(false);
        }, ms);
        const onReady = (ok: boolean) => {
          clearTimeout(timer);
          resolve(ok);
        };
        waitersRef.current.push(onReady);
      });
    },
    [],
  );

  const extractIngredients = useCallback(
    async (lines: string[]): Promise<(NeedleIngredientExtract | null)[]> => {
      const empty = lines.map(() => null);
      if (lines.length === 0 || unavailableRef.current) return empty;
      setMounted(true);
      const ready = await waitForReady(READY_TIMEOUT_MS);
      if (!ready || unavailableRef.current) return empty;
      if (pendingRef.current) return empty;

      return new Promise((resolve) => {
        const id = String(Date.now());
        const timer = setTimeout(() => {
          if (pendingRef.current?.id === id) {
            pendingRef.current = null;
            resolve(empty);
          }
        }, EXTRACT_TIMEOUT_MS);
        pendingRef.current = {
          id,
          resolve: (items) => {
            clearTimeout(timer);
            resolve(items.length === lines.length ? items : empty);
          },
        };
        inject({ type: 'extract', id, lines });
      });
    },
    [inject, waitForReady],
  );

  const handleMessage = useCallback(
    (raw: string) => {
      let payload: { type?: string; id?: string; items?: unknown; message?: string };
      try {
        payload = JSON.parse(raw) as { type?: string; id?: string; items?: unknown; message?: string };
      } catch {
        return;
      }

      if (payload.type === 'error') {
        markUnavailable();
        return;
      }

      if (payload.type === 'engine' && !engineRef.current) {
        engineRef.current = true;
        inject({
          type: 'init',
          system: `locale: ${needleLocale()}; device: phone`,
          tools: NEEDLE_INGREDIENT_TOOLS,
        });
        return;
      }

      if (payload.type === 'ready') {
        readyRef.current = true;
        flushWaiters(true);
        return;
      }

      if (payload.type === 'result' && pendingRef.current && payload.id === pendingRef.current.id) {
        const pending = pendingRef.current;
        pendingRef.current = null;
        const items = Array.isArray(payload.items)
          ? payload.items.map((item) => (item && typeof item === 'object' ? (item as NeedleIngredientExtract) : null))
          : [];
        pending.resolve(items);
      }
    },
    [flushWaiters, inject, markUnavailable],
  );

  const value = useMemo(
    () => ({
      webViewRef,
      mounted,
      extractIngredients,
      handleMessage,
      handleUnavailable: markUnavailable,
    }),
    [mounted, extractIngredients, handleMessage, markUnavailable],
  );

  return <NeedleContext.Provider value={value}>{children}</NeedleContext.Provider>;
}

export function useNeedle() {
  const ctx = useContext(NeedleContext);
  if (!ctx) throw new Error('useNeedle must be used within a NeedleProvider');
  return ctx;
}
