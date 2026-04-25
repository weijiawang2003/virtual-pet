import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createRuntimeProviders, type RuntimeProviders } from './runtime-providers';

const RuntimeProvidersContext = createContext<RuntimeProviders | null>(null);

interface RuntimeProvidersProviderProps {
  readonly children: ReactNode;
  readonly value?: RuntimeProviders;
}

export function RuntimeProvidersProvider({
  children,
  value,
}: RuntimeProvidersProviderProps): React.JSX.Element {
  const providers = useMemo(() => value ?? createRuntimeProviders(), [value]);
  return (
    <RuntimeProvidersContext.Provider value={providers}>
      {children}
    </RuntimeProvidersContext.Provider>
  );
}

export function useRuntimeProviders(): RuntimeProviders {
  const ctx = useContext(RuntimeProvidersContext);
  if (ctx === null) {
    throw new Error('useRuntimeProviders called outside <RuntimeProvidersProvider>');
  }
  return ctx;
}
