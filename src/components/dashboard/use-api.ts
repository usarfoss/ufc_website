"use client";

import { useCallback, useEffect, useState } from "react";

type Settled<T> = { key: string; data: T | null; error: string | null };

/**
 * Loads JSON from `url` (pass `null` to stay idle) and keeps the page's state honest:
 *  - `loading` is *derived* ("the answer on screen is for a different request"), so no state is set while an effect starts,
 *  - changing the url cancels the old request,
 *  - `refresh()` re-fetches quietly and keeps showing the old data, `reload()` re-fetches and shows the loader again.
 * `data` is the last successful answer for the current url, and `null` while loading or after a failure.
 */
export function useApi<T>(url: string | null, { timeoutMs = 20_000, errorMessage = "Something went wrong. Please try again." } = {}) {
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const [nonce, setNonce] = useState(0); // reload(): part of the key, so the loader shows
  const [quiet, setQuiet] = useState(0); // refresh(): not part of the key, so it doesn't

  const key = url === null ? "" : `${url}#${nonce}`;

  useEffect(() => {
    if (url === null) return;
    const controller = new AbortController();
    let timedOut = false;
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json() as Promise<T>;
      })
      .then((data) => setSettled({ key, data, error: null }))
      .catch((err: unknown) => {
        if (controller.signal.aborted && !timedOut) return; // we aborted it ourselves (a newer request took over): nothing to report
        console.error(`Error fetching ${url}:`, err);
        const message = timedOut ? "That took too long. Please try again." : errorMessage;
        // A background refresh that fails shouldn't wipe a list that's already on screen.
        setSettled((prev) => (prev && prev.key === key && prev.data ? prev : { key, data: null, error: message }));
      })
      .finally(() => window.clearTimeout(timer));

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [url, key, quiet, timeoutMs, errorMessage]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const refresh = useCallback(() => setQuiet((n) => n + 1), []);

  const current = settled && settled.key === key ? settled : null;
  // While a quiet refresh is in flight we keep showing the last answer for this key.
  return {
    data: current?.data ?? null,
    error: current?.error ?? null,
    loading: url !== null && current === null,
    reload,
    refresh,
  };
}

/**
 * Calls `onChange` whenever the server says the data behind `key` has changed (a live update over server-sent events).
 * Pass a stable callback, such as the `refresh` from `useApi`.
 */
export function useVersionStream(key: string, onChange: () => void) {
  useEffect(() => {
    const stream = new EventSource("/api/stream/dashboard");
    const onVersions = (event: MessageEvent<string>) => {
      const payload = JSON.parse(event.data) as { versions?: Record<string, number | undefined> };
      if (payload.versions?.[key] !== undefined) onChange();
    };
    stream.addEventListener("versions", onVersions);
    return () => stream.close();
  }, [key, onChange]);
}
