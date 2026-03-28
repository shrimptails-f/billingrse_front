import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { persistLastRegisteredEmail, readLastRegisteredEmail } from '../lib/lastRegisteredEmail';

const resolveLastRegisteredEmail = (searchParams: URLSearchParams): string | null => {
  return searchParams.get('email') ?? readLastRegisteredEmail();
};

export const useLastRegisteredEmail = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string | null>(() => resolveLastRegisteredEmail(searchParams));

  useEffect(() => {
    const paramEmail = searchParams.get('email');

    if (paramEmail) {
      setEmail(paramEmail);
      persistLastRegisteredEmail(paramEmail);
      return;
    }

    setEmail(resolveLastRegisteredEmail(searchParams));
  }, [searchParams]);

  return { email };
};
