# M004: AIF360 Bias Testing — Context

## Scope
Add bias & fairness testing for EU AI Act compliance. Original master plan called for a Python FastAPI microservice with IBM AIF360. Decided on TypeScript-only implementation (D013) — the core metrics (Disparate Impact, Statistical Parity Difference) are simple arithmetic on group means, no ML needed.

## Goals
- Compute DI and SPD from uploaded CSV datasets
- Map results to EU AI Act Article 10 (Data Governance) and Article 15 (Accuracy & Robustness)
- Store results as Evidence entries for audit trail
- Plan-gate to Professional+ using existing `PLAN_LIMITS[plan].biasTesting` field

## Constraints
- No new Python service or dependency
- No schema changes required (reuses Evidence model with type 'TEST_RESULT')
- Must work with existing Evidence Vault infrastructure
