import { useState, useCallback } from "react";

/**
 * useApi – A generic hook that wraps any async function (typically an API service
 * call) and exposes loading / error / data / execute states.
 *
 * @param {Function} apiFn  - The async function to invoke (e.g. () => usersApi.getAll())
 * @param {Object}   opts   - { onSuccess, onError, immediate: false }
 */
export function useApi(apiFn, opts = {}) {
  const { onSuccess, onError, immediate = false } = opts;

  const [state, setState] = useState({
    data: null,
    isLoading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await apiFn(...args);
        setState({ data: result, isLoading: false, error: null });
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorMsg = err.message || "An unexpected error occurred.";
        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        onError?.(err);
        throw err;
      }
    },
    [apiFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

export default useApi;
