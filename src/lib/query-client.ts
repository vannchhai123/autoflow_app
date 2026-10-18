import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        retry: (count, error) => {
          const status = (error as { status?: number }).status ?? 0;
          if (status >= 400 && status < 500) return false;
          return count < 2;
        },
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/** New client per request on the server, singleton in the browser. */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  return (browserClient ??= makeQueryClient());
}
