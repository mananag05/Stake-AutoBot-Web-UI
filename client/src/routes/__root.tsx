import { Outlet, createRootRoute } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

export const Route = createRootRoute({
  component: RootComponent,
});

const QueryCleint = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function RootComponent() {
  return (
    <>
      <QueryClientProvider client={QueryCleint}>
        <div className="h-screen overflow-hidden">
          <Outlet />
          {/* <TanStackRouterDevtools position="bottom-right" /> */}
        </div>
      </QueryClientProvider>
      <Toaster 
        gutter={10}
        position="top-right"
      />
    </>
  );
}
