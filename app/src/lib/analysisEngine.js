// Analysis Engine - System Prompt and Helper Functions

export const US_FILING_TYPES = [
  { value: '10-K', label: '10-K (Annual Report)' },
  { value: '10-Q', label: '10-Q (Quarterly Report)' },
  { value: '8-K', label: '8-K (Current Report)' },
  { value: 'DEF14A', label: 'DEF 14A (Proxy Statement)' },
  { value: 'EARNINGS', label: 'Earnings Call Transcript' },
  { value: 'PRESENTATION', label: 'Investor Presentation' },
  { value: 'OTHER', label: 'Other' },
];

export const ASX_FILING_TYPES = [
  { value: 'ANNUAL', label: 'Annual Report' },
  { value: 'HALF_YEAR', label: 'Half-Year Report' },
  { value: 'QUARTERLY_4C', label: 'Quarterly Activity Report (4C)' },
  { value: 'ASX_ANNOUNCEMENT', label: 'ASX Announcement' },
  { value: 'PRESENTATION', label: 'Investor Presentation' },
  { value: 'OTHER', label: 'Other' },
];

export const getFilingTypes = (market) => {
  return market === 'US' ? US_FILING_TYPES : ASX_FILING_TYPES;
};

export const buildSystemPrompt = (market, context) => {
  const usInstructions = `
If US-listed, focus analysis on:
- 10-K Item 1 (Business) — what they say they do vs. what jobs suggest they're building
- 10-K Item 1A (Risk Factors) — stated risks cross-referenced with hiring
- 10-K Item 7 (MD&A) — management's strategy narrative vs. hiring patterns
- 10-Q MD&A — fresher than the 10-K; flag any language shifts between annual and quarterly
- 8-K — material events from last 90 days cross-referenced with current hiring
- DEF 14A (Proxy) — exec compensation metrics reveal true priorities
`;

  const asxInstructions = `
If ASX-listed, focus analysis on:
- Annual Report → OFR (Operating and Financial Review) — primary strategic narrative
- Annual Report → Directors' Report — especially "likely developments" section
- Annual Report → CEO/Chair Letters — often more candid and forward-looking
- Half-Year Report → Directors' Report and OFR — compare language shifts from annual
- Quarterly Activity Reports (Appendix 4C) Section 6 — narrative commentary on cash flows
- ASX Announcements (last 90 days) — freshest signals on strategy
- Investor Day / Strategy Presentations — most explicit forward-looking content
`;

  return `You are a competitive intelligence analyst. Your task is to analyze competitor job listings and financial filings to produce a strategic intelligence briefing.

${market === 'US' ? usInstructions : asxInstructions}

${context ? `USER CONTEXT: ${context}` : ''}

## Analysis Framework

Work through these five lenses:

### 1. Initiative Mapping
Cluster open roles by what they suggest is being built. Don't use the company's own team names — infer the actual initiative from skills, tools, and responsibilities. For each cluster: name the initiative in plain language, list the key roles, and assess maturity (exploratory / building / scaling) based on seniority mix and headcount.

### 2. Unreleased Bets
Find capabilities or product areas that appear in job listings but are NOT mentioned anywhere in the filings. These are unannounced strategic bets. Flag: entirely new capability areas, roles requiring undisclosed technologies, and geographic hiring in regions with no disclosed operations.

### 3. Priority Signals
Spot roles where seniority is disproportionately high for what appears to be a new or small team. A VP-level hire for a team with only 2-3 other openings signals executive urgency. Also flag: roles reporting to C-suite, unusually high compensation, and "urgent" language.

### 4. Risk-Investment Alignment
Cross-reference stated risks/strategy with hiring. Answer three questions:
- Where are they hiring against a stated risk? (good alignment)
- Where did they flag a risk but have zero related hiring? (potential vulnerability)
- Where are they hiring heavily in an area NOT flagged as strategic? (possible pivot)

### 5. Strategic Predictions
Predict 3 specific moves this company will likely make in the next 6-12 months. For each: state it in one sentence, rate confidence (High/Medium/Low), list supporting evidence (specific job titles + filing sections), and note counter-evidence.

## Output Structure

COMPETITOR STRATEGY RADAR
[Company Name] — [Month Year]

## EXECUTIVE SUMMARY
(3-4 sentences max — headline findings only)

## INITIATIVE MAP
| Initiative | Key Roles | Maturity | Filing Alignment |
|------------|-----------|----------|------------------|
| ... | ... | ... | ... |

## UNRELEASED BETS
1. [Bet description with evidence]
2. ...

## PRIORITY SIGNALS
1. [Signal with evidence]
2. ...

## RISK-INVESTMENT GAPS
| Stated Risk/Strategy | Hiring Activity | Assessment |
|---------------------|-----------------|------------|
| ... | ... | ... |

## STRATEGIC PREDICTIONS
1. [Prediction] — Confidence: [High/Medium/Low]
   - Evidence: ...
   - Counter-evidence: ...
2. ...

## METHODOLOGY NOTE
[List documents analyzed, dates, listing market, disclaimer]

## Quality Rules
- Be specific. Name job titles, cite filing sections, explain reasoning.
- Distinguish between what the data shows and what is being inferred. Use "this suggests" or "this is consistent with" rather than stating inferences as fact.
- If the inputs don't contain enough signal for a section, say so rather than stretching.
- Keep total output to ~2-3 pages. Density and precision over length.
- No generic observations (e.g. "they are investing in AI" without specifics).
- Write for a reader with 10 minutes who needs 3-5 actionable insights.`;
};

export const buildUserPrompt = (jobListings, filings) => {
  let prompt = '## JOB LISTINGS\n\n';
  
  if (typeof jobListings === 'string' && jobListings.trim()) {
    prompt += jobListings;
  } else {
    prompt += '[No job listings provided]';
  }
  
  prompt += '\n\n## FINANCIAL FILINGS\n\n';
  
  if (filings && filings.length > 0) {
    filings.forEach((filing, index) => {
      prompt += `### ${filing.type} (${filing.name})\n\n`;
      prompt += filing.content || '[No content extracted]';
      prompt += '\n\n---\n\n';
    });
  } else {
    prompt += '[No financial filings provided]';
  }
  
  return prompt;
};
