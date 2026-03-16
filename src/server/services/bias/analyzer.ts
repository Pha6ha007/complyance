/**
 * Bias & Fairness Analysis Engine
 *
 * Computes Disparate Impact (DI) and Statistical Parity Difference (SPD)
 * for EU AI Act Article 10 (Data Governance) and Article 15 (Accuracy & Robustness).
 *
 * Implements the EEOC 4/5 rule: DI ratio < 0.8 indicates potential discrimination.
 * SPD threshold: |SPD| < 0.1 indicates acceptable parity.
 *
 * No Python/AIF360 dependency — the core metrics are arithmetic on group rates.
 */

export interface BiasAnalysisInput {
  /** CSV rows as objects — keys are column names, values are strings */
  rows: Record<string, string>[];
  /** Column containing the binary outcome (0/1) */
  labelColumn: string;
  /** Column containing the protected attribute (gender, race, age_group) */
  protectedAttribute: string;
  /** Value in protected attribute column that represents the privileged group */
  privilegedValue: string;
  /** Value in label column that represents a favorable outcome (default '1') */
  favorableLabel?: string;
}

export interface GroupStatistics {
  count: number;
  positiveCount: number;
  positiveRate: number;
}

export interface BiasRecommendation {
  issue: string | null;
  description: string;
  action: string;
  article: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface BiasAnalysisResult {
  success: true;
  metrics: {
    disparateImpact: number;
    statisticalParityDifference: number;
    rowsAnalyzed: number;
    protectedAttribute: string;
    privilegedValue: string;
    favorableLabel: string;
  };
  compliance: {
    disparateImpactCompliant: boolean;
    statisticalParityCompliant: boolean;
    overallCompliant: boolean;
    euActArticles: string;
    thresholdUsed: string;
  };
  groupStatistics: {
    privileged: GroupStatistics;
    unprivileged: GroupStatistics;
  };
  recommendations: BiasRecommendation[];
  disclaimer: string;
}

export interface BiasAnalysisError {
  success: false;
  error: string;
}

export type BiasResult = BiasAnalysisResult | BiasAnalysisError;

const DISCLAIMER =
  'This bias analysis is for informational purposes only and does not constitute legal advice. ' +
  'Results should be reviewed by qualified experts before making compliance decisions.';

/**
 * Analyze a dataset for algorithmic bias using Disparate Impact and Statistical Parity.
 */
export function analyzeBias(input: BiasAnalysisInput): BiasResult {
  const { rows, labelColumn, protectedAttribute, privilegedValue, favorableLabel = '1' } = input;

  // Validation
  if (!rows.length) {
    return { success: false, error: 'Dataset is empty' };
  }

  const columns = Object.keys(rows[0]);
  if (!columns.includes(labelColumn)) {
    return { success: false, error: `Column '${labelColumn}' not found. Available: ${columns.join(', ')}` };
  }
  if (!columns.includes(protectedAttribute)) {
    return { success: false, error: `Column '${protectedAttribute}' not found. Available: ${columns.join(', ')}` };
  }

  // Split into privileged and unprivileged groups
  const privileged: { label: string }[] = [];
  const unprivileged: { label: string }[] = [];

  for (const row of rows) {
    const attrValue = String(row[protectedAttribute]).trim();
    const labelValue = String(row[labelColumn]).trim();

    if (attrValue === privilegedValue) {
      privileged.push({ label: labelValue });
    } else {
      unprivileged.push({ label: labelValue });
    }
  }

  if (privileged.length === 0) {
    return {
      success: false,
      error: `No rows found with ${protectedAttribute} = '${privilegedValue}'. Check your privileged value.`,
    };
  }
  if (unprivileged.length === 0) {
    return {
      success: false,
      error: `All rows have ${protectedAttribute} = '${privilegedValue}'. Need at least two groups for comparison.`,
    };
  }

  // Compute positive rates
  const privPositive = privileged.filter((r) => r.label === favorableLabel).length;
  const unprivPositive = unprivileged.filter((r) => r.label === favorableLabel).length;

  const privRate = privPositive / privileged.length;
  const unprivRate = unprivPositive / unprivileged.length;

  // Disparate Impact = unprivileged positive rate / privileged positive rate
  // If privileged rate is 0, DI is infinity (or we return a special case)
  const disparateImpact = privRate > 0 ? unprivRate / privRate : unprivRate > 0 ? Infinity : 1;

  // Statistical Parity Difference = unprivileged rate - privileged rate
  const statisticalParityDifference = unprivRate - privRate;

  // EU AI Act compliance assessment
  // EEOC 4/5 rule: DI should be between 0.8 and 1.25
  const diCompliant = disparateImpact >= 0.8 && disparateImpact <= 1.25;
  // SPD threshold: |SPD| < 0.1
  const spdCompliant = Math.abs(statisticalParityDifference) < 0.1;
  const overallCompliant = diCompliant && spdCompliant;

  // Build recommendations
  const recommendations: BiasRecommendation[] = [];

  if (!diCompliant) {
    const direction = disparateImpact < 0.8 ? 'below' : 'above';
    recommendations.push({
      issue: 'Disparate Impact violation',
      description: `DI ratio ${round(disparateImpact)} is ${direction} acceptable range [0.8, 1.25]`,
      action: 'Review training data for underrepresentation of protected groups. Consider resampling or applying fairness constraints.',
      article: 'Article 10 — Data Governance',
      priority: 'HIGH',
    });
  }

  if (!spdCompliant) {
    const direction = statisticalParityDifference < 0 ? 'lower' : 'higher';
    recommendations.push({
      issue: 'Statistical Parity violation',
      description: `Unprivileged group has ${direction} positive outcome rate (diff: ${round(statisticalParityDifference)})`,
      action: 'Apply fairness constraints or re-sample training data to equalize outcome rates between groups.',
      article: 'Article 15 — Accuracy & Robustness',
      priority: 'MEDIUM',
    });
  }

  if (overallCompliant) {
    recommendations.push({
      issue: null,
      description: 'System meets basic fairness thresholds for EU AI Act compliance',
      action: 'Continue monitoring for drift over time. Document this analysis as evidence.',
      article: 'Article 72 — Post-Market Monitoring',
      priority: 'LOW',
    });
  }

  // Warn about small sample sizes
  if (privileged.length < 30 || unprivileged.length < 30) {
    recommendations.push({
      issue: 'Small sample size',
      description: `Groups have ${privileged.length} and ${unprivileged.length} samples. Results may not be statistically significant.`,
      action: 'Gather more data for reliable bias assessment. Minimum 30 samples per group recommended.',
      article: 'Article 10 — Data Governance',
      priority: 'MEDIUM',
    });
  }

  return {
    success: true,
    metrics: {
      disparateImpact: round(disparateImpact),
      statisticalParityDifference: round(statisticalParityDifference),
      rowsAnalyzed: rows.length,
      protectedAttribute,
      privilegedValue,
      favorableLabel,
    },
    compliance: {
      disparateImpactCompliant: diCompliant,
      statisticalParityCompliant: spdCompliant,
      overallCompliant,
      euActArticles: 'Article 10, Article 15',
      thresholdUsed: 'EEOC 4/5 Rule (DI ≥ 0.8) + SPD < 0.1',
    },
    groupStatistics: {
      privileged: {
        count: privileged.length,
        positiveCount: privPositive,
        positiveRate: round(privRate),
      },
      unprivileged: {
        count: unprivileged.length,
        positiveCount: unprivPositive,
        positiveRate: round(unprivRate),
      },
    },
    recommendations,
    disclaimer: DISCLAIMER,
  };
}

function round(n: number, decimals = 4): number {
  if (!isFinite(n)) return n;
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

/**
 * Parse a CSV string into rows. Simple parser for well-formed CSV.
 * Handles quoted fields with commas inside them.
 */
export function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length !== headers.length) continue; // skip malformed rows

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j];
    }
    rows.push(row);
  }

  return rows;
}

/** Parse a single CSV line, respecting quoted fields */
function parseLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}
