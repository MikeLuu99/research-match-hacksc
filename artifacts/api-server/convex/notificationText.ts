// Notification wording. Pure helpers only, so they can be unit tested
// without a Convex backend.

export type InterestStatus =
  | "interested"
  | "conversation"
  | "accepted"
  | "declined"
  | "withdrawn";

export const STATUS_TEXT: Record<InterestStatus, string> = {
  interested: "interest received",
  conversation: "in conversation",
  accepted: "accepted",
  declined: "declined",
  withdrawn: "withdrawn",
};

export type NotificationDraft = {
  kind: "new_interest" | "interest_withdrawn" | "status_changed";
  title: string;
  body: string;
  href: string;
};

/** Faculty: a student sent (or re-sent) interest in their listing. */
export function newInterestNotice(
  studentName: string,
  projectTitle: string,
): NotificationDraft {
  return {
    kind: "new_interest",
    title: `${studentName} is interested in your lab`,
    body: `New interest in "${projectTitle}". Review their profile in your interest inbox.`,
    href: "/faculty/inbox",
  };
}

/** Faculty: a student withdrew interest. */
export function withdrawnNotice(
  studentName: string,
  projectTitle: string,
): NotificationDraft {
  return {
    kind: "interest_withdrawn",
    title: `${studentName} withdrew their interest`,
    body: `They are no longer interested in "${projectTitle}".`,
    href: "/faculty/inbox",
  };
}

/** Student: faculty changed the status of their interest. */
export function statusChangedNotice(
  projectTitle: string,
  status: InterestStatus,
): NotificationDraft {
  const headline: Record<InterestStatus, string> = {
    interested: `Your interest in "${projectTitle}" was reopened`,
    conversation: `"${projectTitle}" wants to talk`,
    accepted: `You were accepted to "${projectTitle}"`,
    declined: `Update on "${projectTitle}"`,
    withdrawn: `Your interest in "${projectTitle}" was withdrawn`,
  };
  return {
    kind: "status_changed",
    title: headline[status],
    body: `Status changed to ${STATUS_TEXT[status]}. See the details in your interest tracker.`,
    href: "/applications",
  };
}
