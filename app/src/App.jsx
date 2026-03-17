import { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { buildSystemPrompt, buildUserPrompt, getFilingTypes } from './lib/analysisEngine';
import { analyzeWithClaude } from './lib/api';
import './App.css';

// Set worker path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [market, setMarket] = useState('US');
  const [context, setContext] = useState('');
  const [jobListingsText, setJobListingsText] = useState('');
  const [jobFile, setJobFile] = useState(null);
  const [filings, setFilings] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  
  const jobFileInputRef = useRef(null);
  const filingInputRef = useRef(null);

  const filingTypes = getFilingTypes(market);

  const handleJobFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setJobFile(file);
    
    try {
      if (file.type === 'application/pdf') {
        const text = await extractTextFromPDF(file);
        setJobListingsText(text);
      } else {
        const text = await file.text();
        setJobListingsText(text);
      }
    } catch (err) {
      setError('Failed to read file: ' + err.message);
    }
  };

  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      text += pageText + '\n';
    }
    
    return text;
  };

  const handleFilingUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setError('');
    
    for (const file of files) {
      try {
        let content = '';
        let type = 'OTHER';
        
        if (file.type === 'application/pdf') {
          content = await extractTextFromPDF(file);
        } else {
          content = await file.text();
        }
        
        setFilings(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          type,
          content
        }]);
      } catch (err) {
        setError('Failed to read file: ' + err.message);
      }
    }
  };

  const updateFilingType = (id, type) => {
    setFilings(prev => prev.map(f => 
      f.id === id ? { ...f, type } : f
    ));
  };

  const removeFiling = (id) => {
    setFilings(prev => prev.filter(f => f.id !== id));
  };

  const handleGenerateBriefing = async () => {
    if (!apiKey.trim()) {
      setError('Please enter your Claude API key');
      return;
    }
    if (!companyName.trim()) {
      setError('Please enter a company name');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setProgress('');

    try {
      const systemPrompt = buildSystemPrompt(market, context);
      const userPrompt = buildUserPrompt(jobListingsText, filings);
      
      const result = await analyzeWithClaude(
        systemPrompt,
        userPrompt,
        apiKey,
        setProgress
      );
      
      setReport(result);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(report);
    alert('Copied to clipboard!');
  };

  const downloadMarkdown = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.replace(/\s+/g, '-')}-strategy-radar.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderReport = () => {
    if (!report) return null;
    
    const sections = report.split(/^## /m);
    
    return sections.map((section, index) => {
      if (!section.trim()) return null;
      
      const [title, ...contentParts] = section.split('\n');
      const content = contentParts.join('\n').trim();
      const sectionKey = title?.toLowerCase().replace(/\s+/g, '-') || `section-${index}`;
      const isExpanded = expandedSections[sectionKey] !== false;
      
      return (
        <div key={sectionKey} className="report-section">
          <div 
            className="section-header"
            onClick={() => toggleSection(sectionKey)}
          >
            <span className="section-toggle">{isExpanded ? '▼' : '▶'}</span>
            <h3>{title}</h3>
          </div>
          {isExpanded && (
            <div className="section-content">
              <pre>{content}</pre>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Competitor Strategy Radar</h1>
        <div className="step-indicator">
          <span className={step >= 1 ? 'active' : ''}>1. Setup</span>
          <span className={step >= 2 ? 'active' : ''}>2. Data</span>
          <span className={step >= 3 ? 'active' : ''}>3. Analyze</span>
          <span className={step >= 4 ? 'active' : ''}>4. Report</span>
        </div>
      </header>

      <main className="main">
        {/* Step 1: Company Setup */}
        {step === 1 && (
          <div className="step step-1">
            <h2>Company Setup</h2>
            
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Atlassian, Salesforce"
              />
            </div>

            <div className="form-group">
              <label>Listing Market</label>
              <select value={market} onChange={(e) => setMarket(e.target.value)}>
                <option value="US">US (SEC)</option>
                <option value="ASX">ASX (Australia)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Context (Optional)</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="What do you already know? What specifically interests you?"
                rows={4}
              />
            </div>

            <button 
              className="btn-primary"
              onClick={() => setStep(2)}
              disabled={!companyName.trim()}
            >
              Continue to Data Input →
            </button>
          </div>
        )}

        {/* Step 2: Data Input */}
        {step === 2 && (
          <div className="step step-2">
            <h2>Data Input</h2>
            
            <div className="data-panels">
              <div className="panel">
                <h3>Job Listings</h3>
                <p className="panel-hint">Paste job postings or upload file</p>
                
                <textarea
                  value={jobListingsText}
                  onChange={(e) => setJobListingsText(e.target.value)}
                  placeholder="Paste job listings here..."
                  rows={10}
                />
                
                <div className="file-upload">
                  <input
                    ref={jobFileInputRef}
                    type="file"
                    accept=".txt,.json,.csv,.pdf"
                    onChange={handleJobFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button 
                    className="btn-secondary"
                    onClick={() => jobFileInputRef.current?.click()}
                  >
                    📎 Upload File
                  </button>
                  {jobFile && <span className="file-name">{jobFile.name}</span>}
                </div>
              </div>

              <div className="panel">
                <h3>Financial Filings</h3>
                <p className="panel-hint">Upload PDF, TXT, or HTML files</p>
                
                <input
                  ref={filingInputRef}
                  type="file"
                  accept=".pdf,.txt,.html"
                  multiple
                  onChange={handleFilingUpload}
                  style={{ display: 'none' }}
                />
                <button 
                  className="btn-secondary"
                  onClick={() => filingInputRef.current?.click()}
                >
                  📎 Upload Filings
                </button>

                {filings.length > 0 && (
                  <div className="filings-list">
                    {filings.map((filing) => (
                      <div key={filing.id} className="filing-item">
                        <span className="filing-name">{filing.name}</span>
                        <select
                          value={filing.type}
                          onChange={(e) => updateFilingType(filing.id, e.target.value)}
                        >
                          {filingTypes.map(ft => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </select>
                        <button 
                          className="btn-remove"
                          onClick={() => removeFiling(filing.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button 
                className="btn-primary"
                onClick={() => setStep(3)}
              >
                Continue to Analysis →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Analysis */}
        {step === 3 && (
          <div className="step step-3">
            <h2>Generate Briefing</h2>
            
            <div className="form-group">
              <label>Claude API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-api03-..."
              />
              <p className="hint">Your API key is used locally and never stored</p>
            </div>

            <div className="summary">
              <h3>Analysis Summary</h3>
              <p><strong>Company:</strong> {companyName}</p>
              <p><strong>Market:</strong> {market}</p>
              <p><strong>Job Listings:</strong> {jobListingsText ? `${jobListingsText.length} characters` : 'None'}</p>
              <p><strong>Filings:</strong> {filings.length} file(s)</p>
              {context && <p><strong>Context:</strong> {context}</p>}
            </div>

            {error && <div className="error">{error}</div>}

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(2)}>
                ← Back
              </button>
              <button 
                className="btn-primary"
                onClick={handleGenerateBriefing}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Generate Briefing'}
              </button>
            </div>

            {isAnalyzing && (
              <div className="progress">
                <div className="progress-bar"></div>
                <p>{progress || 'Processing...'}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Report */}
        {step === 4 && (
          <div className="step step-4">
            <div className="report-header">
              <h2>Strategy Radar: {companyName}</h2>
              <div className="export-actions">
                <button className="btn-secondary" onClick={copyToClipboard}>
                  📋 Copy
                </button>
                <button className="btn-secondary" onClick={downloadMarkdown}>
                  ⬇ Download .md
                </button>
              </div>
            </div>

            <div className="report-output">
              {renderReport()}
            </div>

            <div className="step-actions">
              <button className="btn-secondary" onClick={() => setStep(3)}>
                ← New Analysis
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
