const LAST_REGISTERED_EMAIL_STORAGE_KEY = 'lastRegisteredEmail';

export const persistLastRegisteredEmail = (email: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(LAST_REGISTERED_EMAIL_STORAGE_KEY, email);
  } catch {
    // no-op
  }
};

export const readLastRegisteredEmail = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return sessionStorage.getItem(LAST_REGISTERED_EMAIL_STORAGE_KEY);
  } catch {
    return null;
  }
};
