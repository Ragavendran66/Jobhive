import { useSession } from "@clerk/clerk-react";
import { useState } from "react";

const useFetch = (cb) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { session } = useSession();

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const token = await session.getToken({
        template: "supabase",
      });

      const response = await cb(token, ...args); // ✅ just spread args directly

      setData(response);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;