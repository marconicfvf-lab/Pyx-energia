import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
import Home from "@/pages/Home";
import Empresas from "@/pages/Empresas";
import Privacidade from "@/pages/Privacidade";
import NotFound from "@/pages/not-found";
import { pages } from "@/lib/seo";

export { pages as seoPages };

function staticLocation(path: string) {
  return () => [path, () => {}] as [string, (to: string) => void];
}

/** HTML da página pública, sem Clerk e sem o banner de cookies. */
export function render(url: string): string {
  const pathname = (url.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });

  return renderToString(
    <QueryClientProvider client={queryClient}>
      <Router hook={staticLocation(pathname)}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/empresas" component={Empresas} />
          <Route path="/privacidade" component={Privacidade} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </QueryClientProvider>,
  );
}
