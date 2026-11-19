# Partner Prevalidation Implementation Plan

> **For agentic workers:** REQUIRED: apply TDD and verify before completion.

Scope: isolated prototype; no migrations, no production deployment.

1. Add tests for SIRET normalization/checksum and official-record prevalidation. RED.
2. Implement public enterprise lookup using existing dataGouv search, matching establishment SIRET and active status; no auto-approval. GREEN.
3. Add a partner-facing reusable verification form that reports public identity check separately from human review of banking/regulatory documents. Preserve password auth and existing private storage.
4. Add return-home navigation in partner catalog and hide CSV/Excel import UI, preserving interactive product/photo editor.
5. Run focused tests, typecheck and build; record gaps. Never push or deploy.

Security: public company data is advisory; RIB, food hygiene and alcohol licenses require human verification. Do not store banking details in public metadata.
