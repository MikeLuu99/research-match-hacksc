import assert from "node:assert/strict";
import test from "node:test";
import {
  authErrorMessage,
  normalizeEmail,
  validateCredentials,
} from "./auth-validation.ts";

test("email identifiers normalize consistently across sign-in and sign-up", () => {
  assert.equal(normalizeEmail("  Student@USC.edu  "), "student@usc.edu");
  assert.equal(
    validateCredentials(
      "Student@USC.edu",
      "unique research passphrase",
      "unique research passphrase",
    ),
    null,
  );
});

test("sign-up rejects invalid email, short passwords and mismatched confirmation", () => {
  assert.match(
    validateCredentials(
      "invalid",
      "a long enough password",
      "a long enough password",
    )!,
    /email/,
  );
  assert.match(validateCredentials("a@usc.edu", "short", "short")!, /12/);
  assert.match(
    validateCredentials(
      "a@usc.edu",
      "long enough password",
      "different password",
    )!,
    /match/,
  );
  assert.match(
    validateCredentials(
      "a@usc.edu",
      " a long passphrase",
      " a long passphrase",
    )!,
    /space/,
  );
});

test("sign-in accepts existing passwords without imposing new sign-up requirements", () => {
  assert.equal(validateCredentials("a@usc.edu", "existing"), null);
  assert.match(validateCredentials("a@usc.edu", "")!, /password/);
});

test("sign-in errors do not reveal which credential was wrong or expose backend details", () => {
  assert.equal(
    authErrorMessage({ error: "USER_NOT_FOUND" }),
    authErrorMessage({ error: "INVALID_EMAIL_OR_PASSWORD" }),
  );
  assert.match(authErrorMessage({ error: "TOO_MANY_REQUESTS" }), /wait/);
  assert.match(authErrorMessage({ error: "OTHER_ERROR" }), /try again/);
});
