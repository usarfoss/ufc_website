"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
 * One live connection per browser tab, shared by everything on the page that wants to know when data changes. (Before this, every card opened
 * its own, and each one polled our cache every few seconds.) The server announces the version of each kind of data whenever any of them
 * moves, and a listener is told only when the version of the thing it watches is different from last time.
 */
type Listener = { key: string; call: () => void };
const listeners = new Set<Listener>();
let source: EventSource | null = null;
let lastVersions: Record<string, number | undefined> | null = null;

/**
 * A tab nobody is looking at does not need live updates, and holding the connection open costs the server a check every few seconds. So after
 * half a minute hidden the connection is dropped, and it comes back the moment the tab does. The versions seen before are kept, so coming back
 * refreshes only what actually changed meanwhile.
 */
const HIDDEN_GRACE_MS = 30_000;
let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
let watchingVisibility = false;

function watchVisibility() {
  if (watchingVisibility || typeof document === "undefined") return;
  watchingVisibility = true;
  document.addEventListener("visibilitychange", () => {
    if (hiddenTimer) clearTimeout(hiddenTimer);
    hiddenTimer = null;
    if (document.hidden) {
      hiddenTimer = setTimeout(() => {
        source?.close();
        source = null;
      }, HIDDEN_GRACE_MS);
    } else if (listeners.size > 0) {
      openStream();
    }
  });
}

function openStream() {
  watchVisibility();
  if (source) return;
  source = new EventSource("/api/stream/dashboard");
  source.addEventListener("versions", (event) => {
    const payload = JSON.parse((event as MessageEvent<string>).data) as { versions?: Record<string, number | undefined> };
    const next = payload.versions ?? {};
    const before = lastVersions;
    lastVersions = next;
    for (const listener of listeners) {
      // The very first message says "here is where things stand", so everything looks again once, in case something changed while the page was
      // loading. After that, only what actually changed.
      if (next[listener.key] !== undefined && (!before || before[listener.key] !== next[listener.key])) listener.call();
    }
  });
}

function closeStreamIfUnused() {
  if (listeners.size > 0 || !source) return;
  source.close();
  source = null;
  lastVersions = null;
}

/**
 * Calls `onChange` whenever the server says the data behind `key` has changed (a live update over server-sent events), so a page updates
 * by itself without being reloaded. Pass a stable callback, such as the `refresh` from `useApi`.
 */
export function useVersionStream(key: string, onChange: () => void) {
  const latest = useRef(onChange);
  useEffect(() => {
    latest.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const listener: Listener = { key, call: () => latest.current() };
    listeners.add(listener);
    openStream();
    return () => {
      listeners.delete(listener);
      closeStreamIfUnused();
    };
  }, [key]);
}
