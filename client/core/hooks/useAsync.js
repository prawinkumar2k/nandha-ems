import { useState, useCallback } from "react";

/**
 * useAsync – wraps any async fn and tracks loading/error/data state.
 */
export function useAsync(asyncFn, opts = {}) {
  const { onSuccess, onError } = opts;
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err.message || "Error occurred");
        onError?.(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { data, isLoading, error, execute, reset };
}
