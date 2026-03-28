import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { persistLastRegisteredEmail, readLastRegisteredEmail } from '../lib/lastRegisteredEmail';

export const useLastRegisteredEmail = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const paramEmail = searchParams.get('email');

    if (paramEmail) {
      setEmail(paramEmail);
      persistLastRegisteredEmail(paramEmail);
      return;
    }

    setEmail(readLastRegisteredEmail());
  }, [searchParams]);

  return { email };
};
