# Classification Engine Reference

## Pipeline: Input → Pre-Filter → LLM (Claude Sonnet, temp=0) → Validation → Multi-Reg → Gaps → Score

## Pre-Filter Hard Rules:
- profilesUsers=true → HIGH
- SOCIAL_SCORING + GOVERNMENT → UNACCEPTABLE
- no EU market → skip EU classification
- no decisions + no personal data + no profiling + not high-risk domain → MINIMAL

## LLM: model=claude-sonnet-4-20250514, temperature=0, structured JSON output

## Output schema: riskLevel, annexIIICategory (§1-§8), exceptionApplies, providerOrDeployer, reasoning, confidenceScore, transparencyObligations

## Validation: valid enum, HIGH needs category, profiling override, confidence<0.7 → flagForReview

## Error handling: retry 3x exponential backoff, fallback PENDING_MANUAL_REVIEW

## Score: weights CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1; status COMPLETED=1, IN_PROGRESS=0.5, NOT_STARTED=0

## Vendor risk: start 100, deduct for training data use(-25), US processing(-15), no DPA(-20), no model card(-10), no AI Act support(-10), undocumented subprocessors(-15)

## Test cases: HR recruitment→HIGH §4, FAQ chatbot→LIMITED, profiling→HIGH override, credit scoring→HIGH §5, analytics dashboard→MINIMAL
