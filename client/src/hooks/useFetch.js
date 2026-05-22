import { useEffect, useState } from 'react';

// Placeholder generic fetch hook
// Example usage:
// const { data, loading, error } = useFetch(() => api.get('/...'));

export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetcher();
        if (!ignore) setData(res?.data ?? res);
      } catch (e) {
        if (!ignore) setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}

