import { lazy, Suspense, useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, Route, Switch, useLocation } from "wouter";

const Dashboard = lazy(() => import("@/pages/Dashboard"));

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#1B6B3A",
    colorForeground: "#111827",
    colorMutedForeground: "#527565",
    colorDanger: "#b42318",
    colorBackground: "#ffffff",
    colorInput: "#ffffff",
    colorInputForeground: "#111827",
    colorNeutral: "#d6e6dc",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-gray-900 font-display",
    headerSubtitle: "text-gray-600",
    socialButtonsBlockButtonText: "text-gray-800",
    formFieldLabel: "text-gray-800",
    footerActionLink: "text-primary font-semibold",
    footerActionText: "text-gray-600",
    dividerText: "text-gray-500",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-primary",
    alertText: "text-gray-800",
    logoBox: "h-12",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton: "border-gray-200 bg-white hover:bg-muted",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white",
    formFieldInput: "border-gray-200 bg-white text-gray-900",
    footerAction: "text-gray-700",
    dividerLine: "bg-gray-200",
    alert: "border-gray-200",
    otpCodeFieldInput: "border-gray-200",
    formFieldRow: "text-gray-800",
    main: "bg-white",
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const client = useQueryClient();
  const previousUser = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (previousUser.current !== undefined && previousUser.current !== userId) {
        client.clear();
      }
      previousUser.current = userId;
    });
    return unsubscribe;
  }, [addListener, client]);
  return null;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-8">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-muted/30 px-4 py-8">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ProtectedDashboard() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <div className="min-h-screen bg-background" />;
  return isSignedIn ? <Dashboard /> : <Redirect to="/sign-in" />;
}

function useAuthTitle() {
  const [location] = useLocation();
  useEffect(() => {
    if (location.startsWith("/sign-in")) document.title = "Entrar | PYX Energia";
    else if (location.startsWith("/sign-up")) document.title = "Criar conta | PYX Energia";
    else if (location.startsWith("/painel")) document.title = "Painel | PYX Energia";
  }, [location]);
}

/**
 * Clerk só entra nas rotas de autenticação. O publishable key continua vindo de
 * VITE_CLERK_PUBLISHABLE_KEY (pk_live_ no domínio de produção, configurado na Vercel).
 */
export default function AuthShell() {
  const [, setLocation] = useLocation();
  useAuthTitle();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bem-vindo de volta",
            subtitle: "Entre para acessar o painel PYX",
          },
        },
        signUp: {
          start: {
            title: "Crie sua conta PYX",
            subtitle: "Comece a acompanhar seus clientes",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Switch>
          <Route path="/painel" component={ProtectedDashboard} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
        </Switch>
      </Suspense>
    </ClerkProvider>
  );
}
