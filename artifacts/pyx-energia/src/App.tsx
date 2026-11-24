import { type ReactNode, Suspense, lazy, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { ConsentBanner } from "@/components/ConsentBanner";
import { trackPageView } from "@/lib/tracking";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import Home from "@/pages/Home";
import Empresas from "@/pages/Empresas";
import Privacidade from "@/pages/Privacidade";
import EnergiaSolarPorAssinatura from "@/pages/EnergiaSolarPorAssinatura";
import Recife from "@/pages/Recife";
import Fortaleza from "@/pages/Fortaleza";
import NotFound from "@/pages/not-found";

const AuthShell = lazy(() => import("@/auth-shell"));

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function useCleanLocation() {
  const [location, navigate] = useBrowserLocation();
  const clean = location.length > 1 ? location.replace(/\/+$/, "") : location;
  return [clean, navigate] as [string, typeof navigate];
}

function clerkSessionActive(): boolean {
  const raw = document.cookie.split("; ").find((part) => part.startsWith("__client_uat="));
  const value = raw?.slice("__client_uat=".length);
  return Boolean(value && value !== "0");
}

/** A home pública renderiza na hora. Quem já tem sessão do Clerk segue para o painel sem bloquear o primeiro paint. */
function HomeRoute() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (clerkSessionActive()) setLocation("/painel");
  }, [setLocation]);
  return <Home />;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Routes() {
  return (
    <RoutedErrorBoundary>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Switch>
          <Route path="/" component={HomeRoute} />
          <Route path="/empresas" component={Empresas} />
          <Route path="/privacidade" component={Privacidade} />
          <Route path="/energia-solar-por-assinatura" component={EnergiaSolarPorAssinatura} />
          <Route path="/recife" component={Recife} />
          <Route path="/fortaleza" component={Fortaleza} />
          <Route path="/painel" component={AuthShell} />
          <Route path="/sign-in/*?" component={AuthShell} />
          <Route path="/sign-up/*?" component={AuthShell} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </RoutedErrorBoundary>
  );
}

function PageTracker() {
  const [location] = useLocation();
  const first = useRef(true);
  useEffect(() => {
    // O primeiro PageView já sai no carregamento do pixel; só navegações internas.
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView(location);
  }, [location]);
  return null;
}

function App() {
  return (
    <WouterRouter base={basePath} hook={useCleanLocation}>
      <QueryClientProvider client={queryClient}>
        <Routes />
        <PageTracker />
        <ConsentBanner />
        <Toaster />
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
