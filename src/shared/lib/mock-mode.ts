const explicitMockMode = import.meta.env.VITE_ENABLE_MOCK_MODE;

export const isMockModeEnabled =
  explicitMockMode === 'true' ||
  (explicitMockMode !== 'false' &&
    import.meta.env.MODE !== 'test' &&
    !import.meta.env.VITE_BACKEND_API_URL);
