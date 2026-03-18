# Competitive Intelligence Product - Implementation Plan

## MVP Scope
**Core Value:** A web app that analyzes competitor job listings + financial filings to produce a structured intelligence briefing predicting strategic moves.

---

## User Flow (MVP)

### Step 1: Company Setup
- [ ] Company name input (text field)
- [ ] Listing market selector (ASX or US/SEC)
- [ ] Optional context field (free-text for user context)

### Step 2: Data Input
- [ ] **Job Listings Panel** - Paste text OR upload file (.csv, .json, .txt, .pdf)
- [ ] **Financial Filings Panel** - Upload documents (.pdf, .txt, .html)
  - [ ] Filing type dropdown per file (10-K, 10-Q, 8-K, etc. for US; Annual Report, Half-Year, 4C, etc. for ASX)
  - [ ] Support multiple files

### Step 3: Analysis Generation
- [ ] "Generate Briefing" button
- [ ] Progress indicator (30-60 sec)
- [ ] Call Claude API with structured system prompt

### Step 4: Report Output
- [ ] Structured report display
- [ ] Collapsible sections
- [ ] Export: copy to clipboard, download as .md
- [ ] Confidence badges (High/Medium/Low with colors)

---

## Analysis Engine (System Prompt)

### Filing-Aware Routing
**US-listed focus:**
- 10-K Item 1 (Business), Item 1A (Risks), Item 7 (MD&A)
- 10-Q MD&A (fresh language shifts)
- 8-K (material events, last 90 days)
- DEF 14A (Proxy - exec compensation)

**ASX-listed focus:**
- Annual Report → OFR, Directors' Report, CEO/Chair Letters
- Half-Year Report → Directors' Report and OFR
- Quarterly 4C Section 6 (cash flow narrative)
- ASX Announcements (last 90 days)
- Investor Presentations

### 5 Analysis Lenses
1. **Initiative Mapping** - Cluster roles by inferred initiative, assess maturity
2. **Unreleased Bets** - Jobs without filing mentions = unannounced bets
3. **Priority Signals** - Seniority spikes, C-suite reporting, urgent language
4. **Risk-Investment Alignment** - Cross-ref stated risks with hiring
5. **Strategic Predictions** - 3 predictions for next 6-12 months with confidence

### Output Structure
```
COMPANY NAME — Month Year
EXECUTIVE SUMMARY
INITIATIVE MAP (table)
UNRELEASED BETS (numbered)
PRIORITY SIGNALS (numbered)
RISK-INVESTMENT GAPS (table)
STRATEGIC PREDICTIONS (numbered + confidence)
METHODOLOGY NOTE
```

---

## Tech Stack (MVP)
- **Frontend:** React (single page app)
- **File handling:** Client-side PDF text extraction (pdf.js)
- **State:** Local state only (no backend, no auth)
- **Export:** Markdown copy-to-clipboard
- **Styling:** Dark mode, monospace typography, Bloomberg-terminal aesthetic

---

## Out of Scope
- Auto-fetching from careers pages / EDGAR / ASX
- Saved analyses / history
- Multi-company comparison
- User accounts / auth
- Scheduling / alerts

---

## Progress

- [x] Repo initialized
- [x] MVP scope defined
- [x] Brief received
- [x] Set up React project with Vite
- [x] Build Company Setup form
- [x] Build Job Listings input panel
- [x] Build Financial Filings input panel with dropdowns
- [x] Implement PDF text extraction
- [x] Create Claude API integration
- [x] Build Analysis Engine system prompt
- [x] Build Report output with collapsible sections
- [x] Add export functionality (clipboard + .md)
- [x] Style: dark mode, monospace, confidence badges
- [x] Build production bundle (verified working)
- [ ] Deploy to Vercel (Jeff handling)
- [ ] Test end-to-end flow

## Status: ✅ MVP Complete

The app is fully built and ready for deployment. Run `npm run build` in `/competitive-intelligence/app` to verify.

---

*Last updated: 2026-03-18*
