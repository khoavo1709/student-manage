import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../services/api";

// Tai du lieu tu API khi mount; tra ve setData de cap nhat lac quan sau khi them/sua/xoa.
export function useApiData<T>(fetcher: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      console.log("useApiData load failed", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    // fetcher la ham module-level on dinh (vd: studentApi.list) nen chi chay 1 lan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, setData, loading, error, reload };
}
