# Data Layer Reference

## Required Models (17): Organization, User, AISystem, ComplianceGap, Vendor, SystemVendorLink, Document, Evidence, Incident, RegulatoryUpdate, ReferralCode, ReferralReward, Regulation, RiskCategory, RiskException, Obligation, RegulationUpdate

## Required Enums (15): Plan, UserRole, AIType, RiskLevel, GapStatus, Priority, VendorRisk, DocType, DocStatus, Severity, IncidentStatus, ReferralRewardType, ReferralRewardStatus, RegulationStatus, ChangeType

## Key fields to verify:
- Organization: bonusSystems Int @default(0)
- User: referredByCode String?
- ReferralCode: code String @unique, userId String @unique
- ReferralReward: @@unique([referrerId, referredId])
- SystemVendorLink: @@unique([systemId, vendorId])
- RiskCategory: @@unique([regulationId, code])
- Obligation: @@unique([regulationId, article])

## Validation:
```bash
node -e "const s=require('fs').readFileSync('prisma/schema.prisma','utf8');['Organization','User','AISystem','ComplianceGap','Vendor','SystemVendorLink','Document','Evidence','Incident','RegulatoryUpdate','ReferralCode','ReferralReward','Regulation','RiskCategory','RiskException','Obligation','RegulationUpdate'].forEach(m=>console.log(s.includes('model '+m+' ')?'✅ '+m:'❌ '+m))"
```
