import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useLastRegisteredEmail = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const paramEmail = searchParams.get('email');
    if (paramEmail) {
      setEmail(paramEmail);
      try {
        sessionStorage.setItem('lastRegisteredEmail', paramEmail);
      } catch {
        // no-op
      }
      return;
    }

    try {
      const stored = sessionStorage.getItem('lastRegisteredEmail');
      setEmail(stored);
    } catch {
      setEmail(null);
    }
  }, [searchParams]);

  return { email };
};
