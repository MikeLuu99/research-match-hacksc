import { useMutation, useQuery } from "@/lib/backend";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, Inbox, LoaderCircle, Send, UserMinus } from "lucide-react";
import { Layout, PageHeader, EmptyState } from "@/components/layout";
import { OnboardingTour } from "@/components/onboarding-tour";
import { api } from "@/lib/convex-api";
import { useAccount } from "@/lib/auth";
import { cn } from "@/lib/utils";

const ICONS = {
  new_interest: Inbox,
  interest_withdrawn: UserMinus,
  status_changed: Send,
} as const;

export default function Notifications() {
  const account = useAccount();
  const [, navigate] = useLocation();
  const data = useQuery(
    api.notifications.mine,
    account.isAuthenticated ? {} : "skip",
  );
  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);

  if (!account.isAuthenticated)
    return (
      <Layout>
        <PageHeader eyebrow="Notifications" title="Notification">
          Notifications are tied to an account.
        </PageHeader>
        <div className="px-5 pb-12 md:px-10">
          <EmptyState
            title="Sign in to get notifications"
            body="Faculty hear about new interest in their listings, and students hear when a lab updates their status."
          />
        </div>
      </Layout>
    );

  return (
    <Layout>
      <PageHeader eyebrow="Notifications" title="Notification" tour="notifications-header">
        {account.viewer?.accountType === "faculty"
          ? "New and withdrawn interest in your listings."
          : "Status updates on the labs you sent interest to."}
      </PageHeader>
      <OnboardingTour
        tourId="notifications-tour"
        steps={[{
          selector: '[data-tour="notifications-header"]',
          title: "Notifications",
          body: "Interest and status updates for your account land here — new interest for faculty, faculty decisions for students.",
        }]}
      />
      <div className="max-w-3xl space-y-4 px-5 pb-12 md:px-10">
        {data === undefined ? (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <LoaderCircle className="animate-spin" size={16} /> Loading
            notifications…
          </p>
        ) : data.items.length === 0 ? (
          <EmptyState
            title="Nothing new yet"
            body="You'll see updates here when interest is sent, withdrawn or answered."
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-mono text-xs text-muted-foreground">
                {data.unread} unread
              </p>
              <button
                data-testid="button-mark-all-read"
                disabled={data.unread === 0}
                onClick={() => void markAllRead({})}
                className="inline-flex items-center gap-1.5 border border-primary/25 px-3 py-1.5 text-xs hover:bg-primary/5 disabled:opacity-40"
              >
                <CheckCheck size={14} /> Mark all as read
              </button>
            </div>
            <ul className="space-y-2">
              {data.items.map((n) => {
                const Icon = ICONS[n.kind];
                return (
                  <li key={n.id}>
                    <button
                      data-testid={`row-notification-${n.id}`}
                      onClick={async () => {
                        if (!n.read) await markRead({ id: n.id });
                        if (n.href) navigate(n.href);
                      }}
                      className={cn(
                        "flex w-full gap-3 border p-4 text-left transition-colors hover:border-primary/40",
                        n.read ? "bg-card/60" : "border-primary/30 bg-card",
                      )}
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          n.read ? "text-muted-foreground" : "text-primary",
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-sm",
                            !n.read && "font-semibold",
                          )}
                        >
                          {n.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {n.body}
                        </span>
                        <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </span>
                      {!n.read && (
                        <span
                          aria-label="Unread"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </Layout>
  );
}
