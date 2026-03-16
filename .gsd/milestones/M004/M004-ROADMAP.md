# M004: AIF360 Bias Testing

**Vision:** Add bias & fairness testing as a paid module (Professional+) for EU AI Act Article 10/15 compliance.

## Success Criteria

- User can upload CSV, select columns, and run bias analysis
- Disparate Impact and Statistical Parity metrics computed correctly
- Results stored as Evidence for audit trail
- Plan-gated to Professional+
- Dashboard page accessible from sidebar navigation
- All 7 locales have bias testing i18n keys

## Key Risks / Unknowns

- Original plan called for Python/AIF360 microservice — decided TypeScript-only (D013)

## Slices

- [x] **S01: Bias analysis engine + tRPC router + Evidence integration + Dashboard UI** `risk:low` `depends:[]`
  > After this: Professional+ users can upload CSV, run bias analysis, see DI/SPD metrics with EU AI Act compliance assessment, results stored in Evidence Vault
