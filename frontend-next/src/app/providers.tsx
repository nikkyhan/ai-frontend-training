"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrimeReactProvider } from "primereact/api";
import { Toast, type ToastMessage } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { parseApiError } from "@/utils/api-error";

// ---- Toast context: any component can call useToast().show(...) ----
type ShowToast = (message: ToastMessage) => void;
const ToastContext = createContext<ShowToast>(() => {});
export const useToast = () => useContext(ToastContext);

/** App-wide providers: TanStack Query cache, PrimeReact config, one Toast and one ConfirmDialog. */
export function Providers({ children }: { children: ReactNode }) {
  // useState so the QueryClient is created once per browser tab, not on every render
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Retry once for network / server errors only; a 4xx (e.g. 404) will not change on retry
            retry: (failureCount, error) => {
              const status = parseApiError(error).status;
              return failureCount < 1 && (status === null || status >= 500);
            },
          },
        },
      }),
  );

  const toastRef = useRef<Toast>(null);
  const showToast = useCallback<ShowToast>((message) => toastRef.current?.show({ life: 3000, ...message }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <PrimeReactProvider value={{ ripple: true }}>
        <ToastContext.Provider value={showToast}>
          {children}
          <Toast ref={toastRef} position="top-right" />
          <ConfirmDialog />
        </ToastContext.Provider>
      </PrimeReactProvider>
    </QueryClientProvider>
  );
}
