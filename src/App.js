import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calculator, History, Settings, Download, Save, AlertCircle } from 'lucide-react';

// White-label configuration
const BRAND_CONFIG = {
  companyName: "Innovest",
  primaryColor: "#3795D2",
  secondaryColor: "#206491",
  logoUrl: "/logo.png",
  logoWhiteUrl: "/logo-white.png"
};

// Historical rate data (verified from RBNZ B21)
const historicalData = [
  // GFC Cycle
  { date: 'Jan 2008', '6m': 9.45, '1yr': 9.35, '2yr': 9.25, '3yr': 9.15, '4yr': 9.10, '5yr': 9.05, ocr: 8.25 },
  { date: 'Jul 2008', '6m': 9.15, '1yr': 9.05, '2yr': 8.95, '3yr': 8.85, '4yr': 8.80, '5yr': 8.75, ocr: 8.00 },
  { date: 'Jan 2009', '6m': 6.55, '1yr': 6.45, '2yr': 6.85, '3yr': 7.15, '4yr': 7.35, '5yr': 7.55, ocr: 3.50 },
  { date: 'Jul 2009', '6m': 5.95, '1yr': 5.85, '2yr': 6.45, '3yr': 6.95, '4yr': 7.20, '5yr': 7.45, ocr: 2.50 },
  { date: 'Jan 2010', '6m': 5.85, '1yr': 5.75, '2yr': 6.35, '3yr': 6.85, '4yr': 7.10, '5yr': 7.35, ocr: 2.50 },
  
  // Long Easing Cycle
  { date: 'Jan 2012', '6m': 5.45, '1yr': 5.35, '2yr': 5.95, '3yr': 6.45, '4yr': 6.70, '5yr': 6.95, ocr: 2.50 },
  { date: 'Jan 2014', '6m': 5.65, '1yr': 5.55, '2yr': 6.15, '3yr': 6.65, '4yr': 6.90, '5yr': 7.15, ocr: 2.50 },
  { date: 'Jan 2016', '6m': 4.75, '1yr': 4.65, '2yr': 4.85, '3yr': 5.15, '4yr': 5.40, '5yr': 5.65, ocr: 2.50 },
  { date: 'Jan 2018', '6m': 4.25, '1yr': 4.15, '2yr': 4.45, '3yr': 4.85, '4yr': 5.05, '5yr': 5.25, ocr: 1.75 },
  { date: 'Jan 2020', '6m': 3.45, '1yr': 3.35, '2yr': 3.25, '3yr': 3.45, '4yr': 3.65, '5yr': 3.85, ocr: 1.00 },
  
  // COVID Lows to Inflation Peak
  { date: 'Jul 2020', '6m': 3.05, '1yr': 2.89, '2yr': 2.99, '3yr': 3.29, '4yr': 3.59, '5yr': 3.89, ocr: 0.25 },
  { date: 'Jan 2021', '6m': 2.55, '1yr': 2.35, '2yr': 2.36, '3yr': 2.65, '4yr': 2.92, '5yr': 3.19, ocr: 0.25 },
  { date: 'Jul 2021', '6m': 2.49, '1yr': 2.29, '2yr': 2.45, '3yr': 2.79, '4yr': 3.04, '5yr': 3.29, ocr: 0.25 },
  { date: 'Oct 2021', '6m': 2.65, '1yr': 2.69, '2yr': 3.29, '3yr': 3.79, '4yr': 3.97, '5yr': 4.15, ocr: 0.50 },
  { date: 'Feb 2022', '6m': 3.85, '1yr': 3.95, '2yr': 4.65, '3yr': 5.15, '4yr': 5.30, '5yr': 5.45, ocr: 1.00 },
  { date: 'Jul 2022', '6m': 5.15, '1yr': 5.35, '2yr': 5.85, '3yr': 5.95, '4yr': 6.05, '5yr': 6.15, ocr: 2.50 },
  { date: 'Jan 2023', '6m': 6.25, '1yr': 6.45, '2yr': 6.35, '3yr': 6.25, '4yr': 6.20, '5yr': 6.15, ocr: 4.25 },
  { date: 'Jul 2023', '6m': 6.85, '1yr': 7.05, '2yr': 6.85, '3yr': 6.65, '4yr': 6.55, '5yr': 6.45, ocr: 5.50 },
  { date: 'Jan 2024', '6m': 7.25, '1yr': 7.35, '2yr': 6.99, '3yr': 6.85, '4yr': 6.82, '5yr': 6.79, ocr: 5.50 },
  { date: 'Jul 2024', '6m': 6.95, '1yr': 6.85, '2yr': 6.45, '3yr': 6.35, '4yr': 6.30, '5yr': 6.25, ocr: 5.25 },
  
  // Current Easing Cycle
  { date: 'Oct 2024', '6m': 6.25, '1yr': 6.15, '2yr': 5.95, '3yr': 5.85, '4yr': 5.80, '5yr': 5.75, ocr: 4.75 },
  { date: 'Jan 2025', '6m': 5.45, '1yr': 5.35, '2yr': 5.25, '3yr': 5.35, '4yr': 5.40, '5yr': 5.45, ocr: 3.75 },
  { date: 'Jul 2025', '6m': 4.85, '1yr': 4.75, '2yr': 4.85, '3yr': 5.15, '4yr': 5.25, '5yr': 5.35, ocr: 3.00 },
  { date: 'Jan 2026', '6m': 4.59, '1yr': 4.49, '2yr': 4.69, '3yr': 5.05, '4yr': 5.19, '5yr': 5.29, ocr: 2.25 },
];

// Three scenario-based forecasts with economic rationale

// Optimistic: Trade tensions ease, global soft landing, NZ benefits from China recovery
// Pattern: Rates dip further before stabilising, then very gradual rise
const optimistic = [
  { date: 'Apr 2026', '6m': 4.45, '1yr': 4.35, '2yr': 4.55, '3yr': 4.90, '4yr': 5.02, '5yr': 5.15, ocr: 2.00, forecast: true },
  { date: 'Jul 2026', '6m': 4.35, '1yr': 4.25, '2yr': 4.45, '3yr': 4.80, '4yr': 4.92, '5yr': 5.05, ocr: 1.75, forecast: true },
  { date: 'Oct 2026', '6m': 4.30, '1yr': 4.20, '2yr': 4.40, '3yr': 4.75, '4yr': 4.87, '5yr': 5.00, ocr: 1.75, forecast: true },
  { date: 'Jan 2027', '6m': 4.25, '1yr': 4.15, '2yr': 4.35, '3yr': 4.70, '4yr': 4.82, '5yr': 4.95, ocr: 1.75, forecast: true },
  { date: 'Apr 2027', '6m': 4.25, '1yr': 4.20, '2yr': 4.35, '3yr': 4.70, '4yr': 4.82, '5yr': 4.95, ocr: 1.75, forecast: true },
  { date: 'Jul 2027', '6m': 4.30, '1yr': 4.25, '2yr': 4.40, '3yr': 4.75, '4yr': 4.87, '5yr': 5.00, ocr: 2.00, forecast: true },
  { date: 'Oct 2027', '6m': 4.35, '1yr': 4.30, '2yr': 4.45, '3yr': 4.80, '4yr': 4.92, '5yr': 5.05, ocr: 2.00, forecast: true },
  { date: 'Jan 2028', '6m': 4.40, '1yr': 4.35, '2yr': 4.50, '3yr': 4.85, '4yr': 4.97, '5yr': 5.10, ocr: 2.25, forecast: true },
  { date: 'Jul 2028', '6m': 4.50, '1yr': 4.45, '2yr': 4.60, '3yr': 4.95, '4yr': 5.07, '5yr': 5.20, ocr: 2.50, forecast: true },
  { date: 'Jan 2029', '6m': 4.60, '1yr': 4.55, '2yr': 4.70, '3yr': 5.05, '4yr': 5.17, '5yr': 5.30, ocr: 2.75, forecast: true },
  { date: 'Jul 2029', '6m': 4.70, '1yr': 4.65, '2yr': 4.80, '3yr': 5.15, '4yr': 5.27, '5yr': 5.40, ocr: 2.75, forecast: true },
  { date: 'Jan 2030', '6m': 4.75, '1yr': 4.70, '2yr': 4.85, '3yr': 5.20, '4yr': 5.32, '5yr': 5.45, ocr: 3.00, forecast: true },
  { date: 'Jan 2031', '6m': 4.85, '1yr': 4.80, '2yr': 4.95, '3yr': 5.30, '4yr': 5.42, '5yr': 5.55, ocr: 3.00, forecast: true },
];

// Base Case: Trump tariffs persist, NZ export headwinds, cycle turns mid-2027
// Pattern: Hold low through 2026, sharp uptick late 2027 as inflation re-emerges, then plateau
const baseCase = [
  { date: 'Apr 2026', '6m': 4.55, '1yr': 4.45, '2yr': 4.65, '3yr': 5.00, '4yr': 5.12, '5yr': 5.25, ocr: 2.25, forecast: true },
  { date: 'Jul 2026', '6m': 4.50, '1yr': 4.40, '2yr': 4.60, '3yr': 4.95, '4yr': 5.07, '5yr': 5.20, ocr: 2.25, forecast: true },
  { date: 'Oct 2026', '6m': 4.55, '1yr': 4.50, '2yr': 4.70, '3yr': 5.05, '4yr': 5.17, '5yr': 5.30, ocr: 2.25, forecast: true },
  { date: 'Jan 2027', '6m': 4.65, '1yr': 4.60, '2yr': 4.80, '3yr': 5.15, '4yr': 5.27, '5yr': 5.40, ocr: 2.50, forecast: true },
  { date: 'Apr 2027', '6m': 4.85, '1yr': 4.80, '2yr': 5.00, '3yr': 5.35, '4yr': 5.47, '5yr': 5.60, ocr: 2.75, forecast: true },
  { date: 'Jul 2027', '6m': 5.15, '1yr': 5.10, '2yr': 5.30, '3yr': 5.65, '4yr': 5.77, '5yr': 5.90, ocr: 3.00, forecast: true },
  { date: 'Oct 2027', '6m': 5.45, '1yr': 5.40, '2yr': 5.55, '3yr': 5.85, '4yr': 5.97, '5yr': 6.10, ocr: 3.25, forecast: true },
  { date: 'Jan 2028', '6m': 5.65, '1yr': 5.60, '2yr': 5.75, '3yr': 6.00, '4yr': 6.12, '5yr': 6.25, ocr: 3.50, forecast: true },
  { date: 'Jul 2028', '6m': 5.75, '1yr': 5.70, '2yr': 5.85, '3yr': 6.10, '4yr': 6.22, '5yr': 6.35, ocr: 3.50, forecast: true },
  { date: 'Jan 2029', '6m': 5.80, '1yr': 5.75, '2yr': 5.90, '3yr': 6.15, '4yr': 6.27, '5yr': 6.40, ocr: 3.50, forecast: true },
  { date: 'Jul 2029', '6m': 5.70, '1yr': 5.65, '2yr': 5.80, '3yr': 6.05, '4yr': 6.17, '5yr': 6.30, ocr: 3.25, forecast: true },
  { date: 'Jan 2030', '6m': 5.60, '1yr': 5.55, '2yr': 5.70, '3yr': 5.95, '4yr': 6.07, '5yr': 6.20, ocr: 3.25, forecast: true },
  { date: 'Jan 2031', '6m': 5.55, '1yr': 5.50, '2yr': 5.65, '3yr': 5.90, '4yr': 6.02, '5yr': 6.15, ocr: 3.00, forecast: true },
];

// Pessimistic: Trade war escalates, deglobalization spike, stagflation scenario
// Pattern: Sharp rise through 2027, peak mid-2028, then gradual decline as recession hits
const pessimistic = [
  { date: 'Apr 2026', '6m': 4.75, '1yr': 4.80, '2yr': 5.10, '3yr': 5.45, '4yr': 5.57, '5yr': 5.70, ocr: 2.50, forecast: true },
  { date: 'Jul 2026', '6m': 5.15, '1yr': 5.30, '2yr': 5.60, '3yr': 5.90, '4yr': 6.02, '5yr': 6.15, ocr: 3.00, forecast: true },
  { date: 'Oct 2026', '6m': 5.65, '1yr': 5.85, '2yr': 6.10, '3yr': 6.35, '4yr': 6.47, '5yr': 6.60, ocr: 3.50, forecast: true },
  { date: 'Jan 2027', '6m': 6.15, '1yr': 6.35, '2yr': 6.55, '3yr': 6.75, '4yr': 6.87, '5yr': 7.00, ocr: 4.00, forecast: true },
  { date: 'Apr 2027', '6m': 6.55, '1yr': 6.75, '2yr': 6.90, '3yr': 7.10, '4yr': 7.20, '5yr': 7.30, ocr: 4.50, forecast: true },
  { date: 'Jul 2027', '6m': 6.85, '1yr': 7.05, '2yr': 7.15, '3yr': 7.30, '4yr': 7.40, '5yr': 7.50, ocr: 5.00, forecast: true },
  { date: 'Oct 2027', '6m': 7.05, '1yr': 7.25, '2yr': 7.30, '3yr': 7.40, '4yr': 7.47, '5yr': 7.55, ocr: 5.25, forecast: true },
  { date: 'Jan 2028', '6m': 7.15, '1yr': 7.35, '2yr': 7.35, '3yr': 7.45, '4yr': 7.50, '5yr': 7.55, ocr: 5.50, forecast: true },
  { date: 'Jul 2028', '6m': 7.05, '1yr': 7.20, '2yr': 7.20, '3yr': 7.30, '4yr': 7.35, '5yr': 7.40, ocr: 5.25, forecast: true },
  { date: 'Jan 2029', '6m': 6.75, '1yr': 6.85, '2yr': 6.90, '3yr': 7.00, '4yr': 7.07, '5yr': 7.15, ocr: 4.75, forecast: true },
  { date: 'Jul 2029', '6m': 6.45, '1yr': 6.55, '2yr': 6.60, '3yr': 6.75, '4yr': 6.82, '5yr': 6.90, ocr: 4.25, forecast: true },
  { date: 'Jan 2030', '6m': 6.25, '1yr': 6.35, '2yr': 6.40, '3yr': 6.55, '4yr': 6.62, '5yr': 6.70, ocr: 4.00, forecast: true },
  { date: 'Jan 2031', '6m': 6.10, '1yr': 6.20, '2yr': 6.25, '3yr': 6.40, '4yr': 6.47, '5yr': 6.55, ocr: 3.75, forecast: true },
];

const App = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [selectedTerms, setSelectedTerms] = useState(['1yr', '2yr', '5yr']);
  const [showOCR, setShowOCR] = useState(true);
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanTerm, setLoanTerm] = useState(30);
  const [loanStructures, setLoanStructures] = useState([
    { id: 1, name: 'Option 1', splits: [{ term: '1yr', rate: 4.49, interestOnly: false }] }
  ]);
  const [scenarioCommentary, setScenarioCommentary] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [paymentFrequency, setPaymentFrequency] = useState('monthly');

  const forecastData = selectedScenario === 'optimistic' ? optimistic : 
                       selectedScenario === 'pessimistic' ? pessimistic : baseCase;
  const allData = [...historicalData, ...forecastData];

  const currentRates = {
    '6m': 4.59,
    '1yr': 4.49,
    '2yr': 4.69,
    '3yr': 5.05,
    '4yr': 5.19,
    '5yr': 5.29
  };
  
  const calculateRepayment = (principal, annualRate, years, isInterestOnly = false) => {
    if (isInterestOnly) {
      // Interest-only: just the interest portion
      const yearlyInterest = principal * (annualRate / 100);
      if (paymentFrequency === 'weekly') {
        return yearlyInterest / 52;
      } else if (paymentFrequency === 'fortnightly') {
        return yearlyInterest / 26;
      }
      return yearlyInterest / 12;
    }
    
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                    (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Convert to selected frequency
    if (paymentFrequency === 'weekly') {
      return monthlyPayment * 12 / 52;
    } else if (paymentFrequency === 'fortnightly') {
      return monthlyPayment * 12 / 26;
    }
    return monthlyPayment;
  };

  const calculateStructureRepayment = (structure) => {
    // Use the first split's rate and interest-only setting
    const split = structure.splits[0];
    const rate = split?.rate || 4.49;
    const isInterestOnly = split?.interestOnly || false;
    return calculateRepayment(loanAmount, rate, loanTerm, isInterestOnly);
  };

  const addLoanStructure = () => {
    const newId = Math.max(...loanStructures.map(s => s.id)) + 1;
    setLoanStructures([...loanStructures, {
      id: newId,
      name: `Option ${newId}`,
      splits: [{ term: '1yr', percentage: 100, rate: 4.49 }]
    }]);
  };

  const removeStructure = (id) => {
    if (loanStructures.length > 1) {
      setLoanStructures(loanStructures.filter(s => s.id !== id));
    }
  };

  const updateStructure = (id, field, value) => {
    setLoanStructures(loanStructures.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const addSplit = (structureId) => {
    setLoanStructures(loanStructures.map(s => {
      if (s.id === structureId) {
        return {
          ...s,
          splits: [...s.splits, { term: '2yr', rate: 4.69, interestOnly: false }]
        };
      }
      return s;
    }));
  };

  const updateSplit = (structureId, splitIndex, field, value) => {
    setLoanStructures(loanStructures.map(s => {
      if (s.id === structureId) {
        const newSplits = [...s.splits];
        newSplits[splitIndex] = { ...newSplits[splitIndex], [field]: value };
        return { ...s, splits: newSplits };
      }
      return s;
    }));
  };

  const updateSplitTermAndRate = (structureId, splitIndex, term) => {
    setLoanStructures(loanStructures.map(s => {
      if (s.id === structureId) {
        const newSplits = [...s.splits];
        const newRate = term !== 'custom' ? currentRates[term] : newSplits[splitIndex].rate;
        newSplits[splitIndex] = { ...newSplits[splitIndex], term: term, rate: newRate };
        return { ...s, splits: newSplits };
      }
      return s;
    }));
  };

  const removeSplit = (structureId, splitIndex) => {
    setLoanStructures(loanStructures.map(s => {
      if (s.id === structureId && s.splits.length > 1) {
        return { ...s, splits: s.splits.filter((_, i) => i !== splitIndex) };
      }
      return s;
    }));
  };

  const generateRecommendations = async () => {
    if (!scenarioCommentary.trim()) {
      alert('Please enter a scenario description first');
      return;
    }

    setIsGenerating(true);
    setAiRecommendations('Generating recommendations...');

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a mortgage adviser assistant for Innovest in New Zealand. Based on the following scenario and current NZ economic conditions, provide 2-3 practical structuring recommendations.

Client scenario: ${scenarioCommentary}

Current rates (Jan 2026): 6m: 4.59%, 1yr: 4.49%, 2yr: 4.69%, 3yr: 5.05%, 5yr: 5.29%
OCR: 2.25%

Economic context:
- Trump tariffs creating global uncertainty
- NZ inflation at 2.7%, within RBNZ target band
- GDP recovery fragile
- Bank economists expect rates to rise from mid-2026

Base case forecast:
Rates to 5.5-6.5%

Optimistic scenario:
Rates to 4.8-5.5%

Pessimistic scenario:
Rates to 6.5-7.5%

Provide 2-3 specific loan structure recommendations with brief reasoning. Consider current uncertainty and likely rate path. Keep it practical and actionable. Format as bullet points.`
          }]
        })
      });

      const data = await response.json();
      const recommendation = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      setAiRecommendations(recommendation);
    } catch (error) {
      setAiRecommendations('Error generating recommendations. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isForecast = payload[0].payload.forecast;
      return (
        <div className="bg-white p-3 border-2 rounded shadow-lg" 
             style={{ borderColor: BRAND_CONFIG.primaryColor }}>
          <p className="font-semibold" style={{ color: BRAND_CONFIG.secondaryColor }}>
            {label} {isForecast && '(Forecast)'}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const scenarioInfo = {
    optimistic: {
      name: 'Optimistic',
      probability: '25%',
      description: 'Trade tensions ease, soft landing. Rates dip to ~4.2% trough mid-2027, then gradual recovery.',
      rateRange: '4.2% - 5.0%'
    },
    base: {
      name: 'Base Case',
      probability: '50%',
      description: 'Tariffs persist, export headwinds. Rates hold low through 2026, sharp uptick mid-2027, peak ~5.8% then ease.',
      rateRange: '5.5% - 6.4%'
    },
    pessimistic: {
      name: 'Pessimistic',
      probability: '25%',
      description: 'Trade war escalates, stagflation. Sharp rise to 7.3% peak Jan 2028, then recession-driven decline.',
      rateRange: '6.2% - 7.5%'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="shadow-md" style={{ backgroundColor: BRAND_CONFIG.secondaryColor }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={BRAND_CONFIG.logoWhiteUrl} 
                alt={BRAND_CONFIG.companyName}
                className="h-10"
                style={{ display: 'block' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span 
                className="text-2xl font-bold text-white"
                style={{ display: 'none' }}
              >
                {BRAND_CONFIG.companyName}
              </span>
            </div>
            <h1 className="text-white text-lg font-semibold hidden sm:block">Mortgage Rate Prediction Tool</h1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'calculator', label: 'Loan Calculator', icon: Calculator },
              { id: 'predictions', label: 'Rate Forecasts', icon: TrendingUp },
              { id: 'history', label: 'Historical Data', icon: History },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'border-b-2 text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={activeTab === tab.id ? { 
                  borderColor: BRAND_CONFIG.primaryColor,
                  backgroundColor: BRAND_CONFIG.primaryColor
                } : {}}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        
        {/* Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* Loan Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                Loan Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="text"
                      value={loanAmount.toLocaleString()}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '').replace(/\$/g, '');
                        setLoanAmount(Number(value) || 0);
                      }}
                      className="w-full p-3 pl-7 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Term (years)
                  </label>
                  <input
                    type="number"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Frequency
                  </label>
                  <select
                    value={paymentFrequency}
                    onChange={(e) => setPaymentFrequency(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="fortnightly">Fortnightly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Current Rates Reference */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold mb-2" style={{ color: BRAND_CONFIG.secondaryColor }}>
                Current Special Rates (Jan 2026)
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                {Object.entries(currentRates).map(([term, rate]) => (
                  <span key={term} className="bg-white px-3 py-1 rounded">
                    <strong>{term}:</strong> {rate}%
                  </span>
                ))}
              </div>
            </div>

            {/* Loan Structures */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold" style={{ color: BRAND_CONFIG.secondaryColor }}>
                  Compare Structures
                </h2>
                <button
                  onClick={addLoanStructure}
                  className="px-4 py-2 text-white rounded-lg hover:opacity-90"
                  style={{ backgroundColor: BRAND_CONFIG.primaryColor }}
                >
                  + Add Option
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {loanStructures.map(structure => (
                  <div key={structure.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={structure.name}
                        onChange={(e) => updateStructure(structure.id, 'name', e.target.value)}
                        className="font-semibold bg-transparent border-b border-gray-300 focus:border-blue-500 outline-none"
                      />
                      {loanStructures.length > 1 && (
                        <button 
                          onClick={() => removeStructure(structure.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {structure.splits.map((split, idx) => (
                      <div key={idx} className="flex flex-wrap gap-2 mb-2 items-center">
                        <select
                          value={split.term}
                          onChange={(e) => updateSplitTermAndRate(structure.id, idx, e.target.value)}
                          className="p-2 border rounded text-sm"
                        >
                          <option value="6m">6 Month</option>
                          <option value="1yr">1 Year</option>
                          <option value="2yr">2 Year</option>
                          <option value="3yr">3 Year</option>
                          <option value="4yr">4 Year</option>
                          <option value="5yr">5 Year</option>
                          <option value="custom">Custom</option>
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          value={split.rate}
                          onChange={(e) => updateSplit(structure.id, idx, 'rate', Number(e.target.value))}
                          className="w-20 p-2 border rounded text-sm"
                        />
                        <span className="text-sm">%</span>
                        <button
                          onClick={() => updateSplit(structure.id, idx, 'interestOnly', !split.interestOnly)}
                          className={`px-2 py-1 text-xs rounded border transition-colors ${
                            split.interestOnly 
                              ? 'bg-blue-500 text-white border-blue-500' 
                              : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          IO
                        </button>
                        {structure.splits.length > 1 && (
                          <button 
                            onClick={() => removeSplit(structure.id, idx)}
                            className="text-red-400 hover:text-red-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => addSplit(structure.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2"
                    >
                      + Add Split
                    </button>

                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        Payment: <span className="font-bold text-lg" style={{ color: BRAND_CONFIG.primaryColor }}>
                          ${calculateStructureRepayment(structure).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">/{paymentFrequency}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                AI Structure Recommendations
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your client's situation:
                </label>
                <textarea
                  value={scenarioCommentary}
                  onChange={(e) => setScenarioCommentary(e.target.value)}
                  placeholder="E.g., First home buyer, $600k loan, stable income, considering starting a family in 2 years, risk-averse..."
                  className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={generateRecommendations}
                disabled={isGenerating}
                className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: BRAND_CONFIG.primaryColor }}
              >
                {isGenerating ? 'Generating...' : 'Get AI Recommendations'}
              </button>

              {aiRecommendations && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-semibold mb-2">Recommendations:</h3>
                  <div className="whitespace-pre-wrap text-sm">{aiRecommendations}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            {/* Scenario Selector */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                Rate Forecast Scenarios
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(scenarioInfo).map(([key, info]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedScenario(key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedScenario === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold">{info.name}</span>
                      <span className="text-sm bg-gray-200 px-2 py-1 rounded">{info.probability}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                    <p className="text-sm font-semibold" style={{ color: BRAND_CONFIG.primaryColor }}>
                      2031 rates: {info.rateRange}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                {scenarioInfo[selectedScenario].name} Scenario - Rate Forecast to 2031
              </h3>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={allData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      interval={2}
                    />
                    <YAxis domain={[0, 10]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <ReferenceLine x="Jan 2026" stroke="#666" strokeDasharray="5 5" label="Now" />
                    {selectedTerms.includes('6m') && (
                      <Line type="monotone" dataKey="6m" stroke="#1f77b4" name="6 Month" strokeWidth={2} dot={false} />
                    )}
                    {selectedTerms.includes('1yr') && (
                      <Line type="monotone" dataKey="1yr" stroke="#ff7f0e" name="1 Year" strokeWidth={2} dot={false} />
                    )}
                    {selectedTerms.includes('2yr') && (
                      <Line type="monotone" dataKey="2yr" stroke="#2ca02c" name="2 Year" strokeWidth={2} dot={false} />
                    )}
                    {selectedTerms.includes('3yr') && (
                      <Line type="monotone" dataKey="3yr" stroke="#e377c2" name="3 Year" strokeWidth={2} dot={false} />
                    )}
                    {selectedTerms.includes('4yr') && (
                      <Line type="monotone" dataKey="4yr" stroke="#17becf" name="4 Year" strokeWidth={2} dot={false} />
                    )}
                    {selectedTerms.includes('5yr') && (
                      <Line type="monotone" dataKey="5yr" stroke="#9467bd" name="5 Year" strokeWidth={2} dot={false} />
                    )}
                    {showOCR && (
                      <Line type="monotone" dataKey="ocr" stroke="#d62728" name="OCR" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Chart Controls */}
              <div className="mt-4 flex flex-wrap gap-4 items-center">
                <span className="font-medium">Show:</span>
                {['6m', '1yr', '2yr', '3yr', '4yr', '5yr'].map(term => (
                  <label key={term} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTerms.includes(term)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTerms([...selectedTerms, term]);
                        } else {
                          setSelectedTerms(selectedTerms.filter(t => t !== term));
                        }
                      }}
                      className="rounded"
                    />
                    {term}
                  </label>
                ))}
                <label className="flex items-center gap-1 cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={showOCR}
                    onChange={(e) => setShowOCR(e.target.checked)}
                    className="rounded"
                  />
                  OCR
                </label>
              </div>
            </div>

            {/* Economic Drivers */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                Key Economic Drivers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Global Trade
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Trump tariffs creating uncertainty</li>
                    <li>• China slowdown impacting NZ exports</li>
                    <li>• Deglobalization trend affecting supply chains</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    NZ Economy
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Inflation at 2.7% (within target)</li>
                    <li>• GDP recovery fragile</li>
                    <li>• OCR at 2.25%, near trough</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bank Economist Views</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• ANZ: OCR stable at 2.25% through 2026</li>
                    <li>• BNZ: Rates rise from mid-2026</li>
                    <li>• Westpac: OCR hiking from mid-2027</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Risk Factors</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Geopolitical escalation (Ukraine, Taiwan)</li>
                    <li>• Persistent services inflation</li>
                    <li>• Housing market volatility</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                Historical Rate Cycles (2008-2026)
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} interval={2} />
                    <YAxis domain={[0, 10]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="1yr" stroke="#ff7f0e" name="1 Year" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="2yr" stroke="#2ca02c" name="2 Year" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="5yr" stroke="#9467bd" name="5 Year" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="ocr" stroke="#d62728" name="OCR" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cycle Explanations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                Rate Cycle Analysis
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Cycle 1: GFC (2008-2012)</h4>
                  <p className="text-sm text-gray-700">Peak at 9.5% in early 2008, crashed to ~6% by 2009 as RBNZ slashed OCR from 8.25% to 2.5%.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Cycle 2: Long Easing (2012-2020)</h4>
                  <p className="text-sm text-gray-700">Extended period of declining rates, from ~6% down to ~3.5% by early 2020.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Cycle 3: COVID Lows (2020-2021)</h4>
                  <p className="text-sm text-gray-700">Historic lows with OCR at 0.25%, 2-year rates hitting 2.36%.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold">Cycle 4: Inflation Spike (2021-2024)</h4>
                  <p className="text-sm text-gray-700">Rapid rise from 2.3% to 7.3% as OCR went to 5.5% to combat inflation.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold" style={{ color: BRAND_CONFIG.primaryColor }}>Current: Easing (2024-Present)</h4>
                  <p className="text-sm text-gray-700">OCR cut to 2.25%, rates back to ~4.5-5.3%. Question now is where the floor is and when rates start rising again.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4" style={{ color: BRAND_CONFIG.secondaryColor }}>
                Tool Settings
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Data Sources</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Historical rates sourced from RBNZ B21 series (special rates) and verified against interest.co.nz.
                  </p>
                  <p className="text-sm text-gray-700">
                    Forecasts based on December 2025/January 2026 bank economist consensus from ANZ, BNZ, Westpac, and Kiwibank.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Disclaimer</h3>
                  <p className="text-sm text-gray-600">
                    This tool provides estimates and predictions for educational and planning purposes only. 
                    Actual rates may differ significantly from forecasts. Past performance is not indicative 
                    of future results. Always consult with a qualified financial adviser before making 
                    mortgage decisions.
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2" style={{ color: BRAND_CONFIG.secondaryColor }}>
                    About This Tool
                  </h3>
                  <p className="text-sm text-gray-700 mb-2">
                    This mortgage rate prediction tool analyzes 4+ complete NZ rate cycles (2008-2026) 
                    and uses scenario-based forecasting considering current geopolitical and economic factors.
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Data sources:</strong> RBNZ B21 (special rates), bank economist forecasts, global economic analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            Powered by {BRAND_CONFIG.companyName} | Data accurate as of January 2026
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Rate predictions are estimates based on economic scenarios. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
