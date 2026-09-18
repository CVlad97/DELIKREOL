---
name: delikreol-partner-linking
description: Safely verify and link an existing DeliKreol vendor, driver, or relay record to an existing confirmed Supabase Auth account. Use when a partner sees “Accès partenaire requis”, has a database record without an email or user_id, or needs an existing email attached to the correct partner space.
---

# DeliKreol Partner Linking

Use this workflow only for the DeliKreol Supabase project. The goal is to restore legitimate access without guessing identities or widening RLS policies.

## Required input

Obtain the exact partner name/type and exact email. Treat email matching as case-insensitive. If either is ambiguous, stop and ask for clarification.

## Verification before mutation

1. Confirm the Supabase project is DeliKreol.
2. Find the Auth account by normalized email and require a non-null `email_confirmed_at`.
3. Find the intended vendor, driver, or relay record by exact identity; inspect its current `user_id`, email, status, and public/active state.
4. Check that the Auth user is not already linked to another partner and that the target record is not linked to another user.
5. Never create a password, disclose credentials, or create an Auth account on the partner’s behalf. If the account is absent or unconfirmed, give the official login/magic-link or password-reset path instead.

## Safe linking

Perform the smallest transactional update:

- set the target partner record’s normalized email and `user_id`;
- upsert the matching profile with the correct non-admin role (`vendor`, `driver`, or `relay_host`);
- preserve existing names and unrelated fields;
- never grant `admin`;
- do not change publication, verification, payment, or payout status unless separately authorized.

Use explicit record IDs in the mutation and include predicates that prevent overwriting a different existing owner. Roll back on any mismatch.

## Verification after mutation

Read the Auth user, profile, and partner record back in one query. Confirm:

- the same user UUID appears on the partner and profile;
- normalized emails agree;
- the profile role matches the partner type;
- the account remains email-confirmed;
- no duplicate ownership was introduced.

If the database is correct but the UI still shows “Accès partenaire requis”, verify the deployed code and service worker. The application must resolve the partner by `user_id` before falling back to a customer profile. Ask the partner to sign out and back in only after the production deployment is confirmed successful.

Report only the verified status and the correct login URL. Do not expose UUIDs, SQL, secrets, passwords, or other partners’ data to the user.
