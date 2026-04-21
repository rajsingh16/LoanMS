import { useEffect, useState } from 'react';
import { pincodeService, Pincode } from '../services/pincodeService';

export function usePincodeLookup(pincode: string) {
  const [match, setMatch] = useState<Pincode | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sanitized = pincode.trim();

    if (!/^\d{6}$/.test(sanitized)) {
      setMatch(null);
      setLoading(false);
      setError('');
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const result = await pincodeService.lookupPincode(sanitized);
        if (!cancelled) {
          setMatch(result);
        }
      } catch (lookupError) {
        if (!cancelled) {
          setMatch(null);
          setError(lookupError instanceof Error ? lookupError.message : 'Failed to lookup pincode');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pincode]);

  return { match, loading, error };
}
