import { describe, expect, it } from "vitest";
import {
  newInterestNotice,
  statusChangedNotice,
  withdrawnNotice,
} from "./notificationText";

describe("notification text", () => {
  it("tells faculty about new interest and links to the inbox", () => {
    const n = newInterestNotice("Ada Lovelace", "Clinical ML");
    expect(n.kind).toBe("new_interest");
    expect(n.title).toContain("Ada Lovelace");
    expect(n.body).toContain("Clinical ML");
    expect(n.href).toBe("/faculty/inbox");
  });

  it("tells faculty when interest is withdrawn", () => {
    const n = withdrawnNotice("Ada Lovelace", "Clinical ML");
    expect(n.kind).toBe("interest_withdrawn");
    expect(n.title).toContain("withdrew");
    expect(n.href).toBe("/faculty/inbox");
  });

  it("tells students about each status change and links to the tracker", () => {
    for (const status of [
      "interested",
      "conversation",
      "accepted",
      "declined",
      "withdrawn",
    ] as const) {
      const n = statusChangedNotice("Clinical ML", status);
      expect(n.kind).toBe("status_changed");
      expect(n.title).toContain("Clinical ML");
      expect(n.href).toBe("/applications");
    }
    expect(statusChangedNotice("Clinical ML", "accepted").title).toMatch(/accepted/);
  });
});
