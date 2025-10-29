// useFetch.js - UPDATED VERSION
import { useState, useEffect, useRef } from 'react';

const useFetch = (serviceFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    // Only fetch if we haven't already fetched successfully
    if (hasFetched.current && !dependencies.some(Boolean)) {
      return;
    }

    const fetchData = async () => {
      if (!isMounted.current) return;
      
      setLoading(true);
      setError(null);

      try {
        const result = await serviceFn();
        
        if (isMounted.current) {
          setData(result.data || result);
          hasFetched.current = true; // Mark as successfully fetched
        }
      } catch (err) {
        if (isMounted.current) {
          console.error("Fetch error:", err);
          setError(err.response?.data?.error || err.message || 'Failed to fetch data');
          // Don't mark as fetched on error, so we can retry
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, setData };
};

export default useFetch;