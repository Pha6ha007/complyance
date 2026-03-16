# M005: AgentGuard → Complyance SDK Integration

**Vision:** Create SDK webhook infrastructure so customers can auto-log AI call metadata as compliance evidence via a Python decorator.

## Success Criteria

- Webhook endpoint receives SDK events and stores as Evidence
- API key generation/revocation via tRPC
- Dashboard page with API key management and quick-start guide
- Plan-gated to Professional+
- All 7 locales have SDK i18n keys

## Key Risks / Unknowns

- Organization model needed apiKey field — schema change approved and applied

## Slices

- [x] **S01: Schema change + webhook + API key management + Dashboard UI** `risk:medium` `depends:[]`
  > After this: Professional+ users can generate API keys, see integration guide, and webhook endpoint accepts SDK events stored as Evidence
