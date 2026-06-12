import { useState, useEffect, useCallback } from "react";

const DEBOUNCE_DELAY = 400;

export function useSearch(searchFn, delay = DEBOUNCE_DELAY) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const doSearch = useCallback(
    async (q) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setIsSearching(true);
      setError(null);
      try {
        const data = await searchFn(q);
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsSearching(false);
      }
    },
    [searchFn]
  );

  useEffect(() => {
    const handler = setTimeout(() => doSearch(query), delay);
    return () => clearTimeout(handler);
  }, [query, doSearch, delay]);

  return { query, setQuery, results, isSearching, error };
}

export default useSearch;
