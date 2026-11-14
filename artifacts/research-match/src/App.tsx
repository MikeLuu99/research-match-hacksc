import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import {
  Redirect,
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import { StoreProvider } from "@/lib/store";
import Discovery from "@/pages/discovery";
import Saved from "@/pages/saved";
import Applications from "@/pages/applications";
import Profile from "@/pages/profile";
import Faculty from "@/pages/faculty";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth";
import { AccountProvider, useAccount } from "@/lib/auth";

const queryClient = new QueryClient();

// Faculty workspace and data controls are faculty-only. Signed-in students
// are redirected instead of shown another side's tooling.
function StudentRouteGate({ children }: { children: ReactNode }) {
  const [loc] = useLocation();
  const account = useAccount();
  const isFacultyOnly =
    loc.startsWith("/faculty") || loc.startsWith("/settings");
  if (
    account.isAuthenticated &&
    account.viewer?.accountType !== "faculty" &&
    isFacultyOnly
  )
    return <Redirect to="~/app" replace />;
  return <>{children}</>;
}

function WorkspaceRoutes() {
  return (
    <RoutedErrorBoundary>
      <StudentRouteGate>
        <Switch>
          <Route path="/" component={Discovery} />
          <Route path="/saved" component={Saved} />
          <Route path="/applications" component={Applications} />
          <Route path="/profile" component={Profile} />
          <Route path="/faculty" component={Faculty} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </StudentRouteGate>
    </RoutedErrorBoundary>
  );
}

function PrivateWorkspace() {
  const account = useAccount();
  if (account.isLoading)
    return (
      <p role="status" className="p-12">
        Loading your workspace…
      </p>
    );
  if (!account.isAuthenticated) return <Redirect to="~/sign-in" replace />;
  if (!account.viewer?.accountType)
    return <Redirect to="~/onboarding" replace />;
  return (
    <StoreProvider
      key={account.viewer.id}
      accountId={account.viewer.id}
      accountName={account.viewer.name ?? undefined}
    >
      <WorkspaceRoutes />
    </StoreProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/sign-in">
        {() => <AuthPage key="sign-in" mode="sign-in" />}
      </Route>
      <Route path="/sign-up">
        {() => <AuthPage key="sign-up" mode="sign-up" />}
      </Route>
      <Route path="/onboarding">
        {() => <AuthPage key="onboarding" mode="onboarding" />}
      </Route>
      <Route path="/demo" nest>
        <StoreProvider>
          <WorkspaceRoutes />
        </StoreProvider>
      </Route>
      <Route path="/app" nest>
        <PrivateWorkspace />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccountProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AccountProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
