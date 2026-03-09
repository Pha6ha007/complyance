export const DOCUMENT_ANALYSIS_PROMPT = `You are an EU AI Act compliance analyst. Analyze the following product documentation and extract all information relevant to AI risk classification.

Focus on finding:
1. What type of AI/ML is used (models, algorithms, LLMs, rule-based systems, hybrid approaches)
2. What domain the AI operates in (HR, finance, healthcare, education, law enforcement, biometrics, etc.)
3. Whether the system makes or influences decisions affecting people
4. Whether personal data is processed (names, emails, behavior, biometrics, location, etc.)
5. Whether users are profiled (behavior tracking, personalization, scoring, recommendations)
6. Who the end users are (consumers, businesses, employees, government)
7. Which markets the product serves (look for mentions of EU, GDPR, specific countries, regions)

CRITICAL: Look for hidden risks the company might not be aware of:
- "personalized experience" or "recommendations" = likely profiling
- "automated scoring" or "ranking" = likely automated decisions
- "user behavior" or "analytics" or "tracking" = likely personal data processing
- "screening" or "filtering candidates" or "HR" or "recruitment" = employment AI (high-risk)
- "credit" or "loan" or "creditworthiness" = financial AI (high-risk)
- "face" or "facial recognition" or "biometric" or "emotion detection" = biometric AI (high-risk)
- "law enforcement" or "predictive policing" or "crime" = law enforcement AI (high-risk)
- "medical" or "diagnosis" or "health" or "patient" = healthcare AI (may be high-risk)

For each finding, provide the EXACT QUOTE from the document as evidence.

Respond ONLY with valid JSON matching this exact structure:
{
  "systemName": string | null,
  "description": string | null,
  "aiType": "ML_MODEL" | "LLM" | "RULE_BASED" | "HYBRID" | null,
  "domain": string | null,
  "makesDecisions": boolean | null,
  "processesPersonalData": boolean | null,
  "profilesUsers": boolean | null,
  "endUsers": string[],
  "markets": string[],
  "detectedRisks": [
    {
      "category": string,
      "description": string,
      "sourceFile": string,
      "quote": string,
      "severity": "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "extractedQuotes": [
    {
      "text": string,
      "sourceFile": string,
      "relevance": string
    }
  ],
  "confidence": number (0-1)
}

If you cannot find information for a field, set it to null (for strings/booleans) or empty array (for arrays).
Set confidence based on how complete and clear the documentation is (0.0 = very unclear, 1.0 = very clear and complete).`;
