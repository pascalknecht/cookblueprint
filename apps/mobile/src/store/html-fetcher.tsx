import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

type PendingRequest = {
  url: string;
  resolve: (html: string) => void;
  reject: (error: Error) => void;
};

type HtmlFetcherStore = {
  pendingUrl: string | null;
  fetchHtml: (url: string) => Promise<string>;
  resolvePending: (html: string) => void;
  rejectPending: (error: Error) => void;
};

const HtmlFetcherContext = createContext<HtmlFetcherStore | null>(null);

const FETCH_TIMEOUT_MS = 15_000;

/**
 * Renders a hidden WebView (see html-fetcher-webview.tsx) to load a URL and hand back its
 * HTML — used to import recipes without a signed-in session, where there's no backend to do
 * the fetch. A real WebView (rather than a plain fetch) also lets client-rendered recipe
 * pages finish hydrating before we read their markup.
 */
export function HtmlFetcherProvider({ children }: { children: ReactNode }) {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const requestRef = useRef<PendingRequest | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearPending = useCallback(() => {
    clearTimeout(timeoutRef.current);
    requestRef.current = null;
    setPendingUrl(null);
  }, []);

  const fetchHtml = useCallback(
    (url: string) =>
      new Promise<string>((resolve, reject) => {
        if (requestRef.current) {
          reject(new Error('Another import is already in progress.'));
          return;
        }
        requestRef.current = { url, resolve, reject };
        setPendingUrl(url);
        timeoutRef.current = setTimeout(() => {
          requestRef.current?.reject(new Error('That page took too long to respond.'));
          clearPending();
        }, FETCH_TIMEOUT_MS);
      }),
    [clearPending],
  );

  const resolvePending = useCallback(
    (html: string) => {
      requestRef.current?.resolve(html);
      clearPending();
    },
    [clearPending],
  );

  const rejectPending = useCallback(
    (error: Error) => {
      requestRef.current?.reject(error);
      clearPending();
    },
    [clearPending],
  );

  const value = useMemo(
    () => ({ pendingUrl, fetchHtml, resolvePending, rejectPending }),
    [pendingUrl, fetchHtml, resolvePending, rejectPending],
  );

  return <HtmlFetcherContext.Provider value={value}>{children}</HtmlFetcherContext.Provider>;
}

export function useHtmlFetcher() {
  const ctx = useContext(HtmlFetcherContext);
  if (!ctx) throw new Error('useHtmlFetcher must be used within an HtmlFetcherProvider');
  return ctx;
}
