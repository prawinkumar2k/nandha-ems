import { useState, useEffect, useCallback } from "react";

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function usePagination(data = [], pageSize = 8) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);
  const reset = useCallback(() => setPage(1), []);
  return { page, setPage, totalPages, paginated, reset };
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  const set = (v) => {
    const next = v instanceof Function ? v(value) : v;
    setValue(next);
    sessionStorage.setItem(key, JSON.stringify(next));
  };
  return [value, set];
}

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle };
}

export function useMediaQuery(query = "(max-width: 768px)") {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export function useCountdown(seconds, onEnd) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);
  useEffect(() => {
    if (remaining <= 0) { onEnd?.(); return; }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining, onEnd]);
  const reset = useCallback(() => setRemaining(seconds), [seconds]);
  return { remaining, reset };
}
