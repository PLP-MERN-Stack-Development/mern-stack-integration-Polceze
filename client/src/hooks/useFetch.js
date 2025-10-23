import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch data from an asynchronous service function.
 * @param {Function} serviceFn - The async function from api.js (e.g., postService.getAllPosts)
 * @param {Array} dependencies - Dependencies to re-run the fetch (like useEffect dependencies)
 * @returns {{data: any, loading: boolean, error: string, setData: Function}}
 */
const useFetch = (serviceFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  // Convert dependencies array to a string for comparison
  const depsString = JSON.stringify(dependencies);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await serviceFn();
        
        if (isMounted) {
          setData(result.data || result); 
        }
      } catch (err) {
        if (isMounted) {
          console.error("Fetch error:", err);
          setError(err.response?.data?.error || err.message || 'Failed to fetch data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [serviceFn, depsString]); // Use stringified dependencies

  return { data, loading, error, setData };
};

export default useFetch;