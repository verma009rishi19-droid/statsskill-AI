import React, { useState } from 'react';
import { virtualLabApi } from '../services/api';
import {
  Terminal, Play, RefreshCw, AlertCircle, Clock, Shield,
  Database, Calculator, Code, ChevronDown, Trash2
} from 'lucide-react';

type LabTab = 'sql_sandbox' | 'cpi_calculator' | 'python_validator';

const SQL_SAMPLES = [
  { label: 'List Price Index Data (Top 10)', code: 'SELECT * FROM price_index_data LIMIT 10;' },
  { label: 'Average Index by Category', code: 'SELECT category, AVG(index_value) AS avg_index\nFROM price_index_data\nGROUP BY category\nORDER BY avg_index DESC;' },
  { label: 'Survey Responses by State', code: 'SELECT state, COUNT(*) AS total_responses\nFROM survey_responses\nGROUP BY state\nORDER BY total_responses DESC;' },
  { label: 'Monthly CPI Trend', code: "SELECT month, year, cpi_value\nFROM cpi_monthly\nWHERE year >= 2023\nORDER BY year, month;" },
];

const PYTHON_SAMPLES = [
  { label: 'Data Quality Check', code: `import pandas as pd

# Sample statistical data quality checks
data = {
    'state': ['UP', 'MH', 'KA', 'TN', None, 'DL'],
    'population': [200000000, 120000000, 65000000, 72000000, -500, 19000000],
    'literacy_rate': [67.7, 82.3, 75.4, 80.1, 150.0, 86.2]
}
df = pd.DataFrame(data)

print("=== Data Quality Report ===")
print(f"Total records: {len(df)}")
print(f"Missing values:\\n{df.isnull().sum()}")
print(f"\\nNegative values in population: {(df['population'] < 0).sum()}")
print(f"Out-of-range literacy rates (>100): {(df['literacy_rate'] > 100).sum()}")
print(f"\\nValid records: {len(df.dropna()) - (df['population'] < 0).sum()}")` },
  { label: 'Outlier Detection', code: `import numpy as np

# IQR-based outlier detection for statistical surveys
data = [45, 48, 52, 55, 58, 62, 65, 200, 70, 72, 75, 3, 78, 80]
print(f"Dataset: {data}")

q1 = np.percentile(data, 25)
q3 = np.percentile(data, 75)
iqr = q3 - q1
lower = q1 - 1.5 * iqr
upper = q3 + 1.5 * iqr

outliers = [x for x in data if x < lower or x > upper]
clean = [x for x in data if lower <= x <= upper]

print(f"\\nQ1={q1:.1f}, Q3={q3:.1f}, IQR={iqr:.1f}")
print(f"Bounds: [{lower:.1f}, {upper:.1f}]")
print(f"Outliers detected: {outliers}")
print(f"Clean data mean: {np.mean(clean):.2f}")` },
  { label: 'Missing Value Analysis', code: `import pandas as pd
import numpy as np

# Analyse missing data patterns in survey dataset
np.random.seed(42)
n = 100
df = pd.DataFrame({
    'district': [f'D{i}' for i in range(n)],
    'income': np.where(np.random.random(n) > 0.85, np.nan, np.random.normal(45000, 12000, n)),
    'expenditure': np.where(np.random.random(n) > 0.9, np.nan, np.random.normal(38000, 10000, n)),
    'household_size': np.where(np.random.random(n) > 0.95, np.nan, np.random.randint(1, 8, n).astype(float)),
})

print("=== Missing Value Analysis ===")
missing = df.isnull().sum()
pct = (missing / len(df) * 100).round(1)
for col in ['income', 'expenditure', 'household_size']:
    print(f"{col}: {missing[col]} missing ({pct[col]}%)")

print(f"\\nComplete cases: {df.dropna().shape[0]} / {len(df)}")
print(f"Rows with any missing: {df.isnull().any(axis=1).sum()}")` },
];

interface LabResult {
  success: boolean;
  output: string;
  error?: string;
  execution_time_ms: number;
  metadata?: Record<string, any>;
}

interface CpiItem {
  name: string;
  base_price: string;
  current_price: string;
  weight: string;
}

export const VirtualLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LabTab>('sql_sandbox');
  const [sqlCode, setSqlCode] = useState(SQL_SAMPLES[0].code);
  const [pythonCode, setPythonCode] = useState(PYTHON_SAMPLES[0].code);
  const [cpiItems, setCpiItems] = useState<CpiItem[]>([
    { name: 'Rice (kg)', base_price: '40', current_price: '55', weight: '25' },
    { name: 'Milk (litre)', base_price: '42', current_price: '60', weight: '20' },
    { name: 'Cooking Oil (litre)', base_price: '110', current_price: '150', weight: '15' },
  ]);
  const [baseYear, setBaseYear] = useState('2020');
  const [currentYear, setCurrentYear] = useState('2025');
  const [result, setResult] = useState<LabResult | null>(null);
  const [executing, setExecuting] = useState(false);

  const executeCode = async (labType: LabTab, code?: string, parameters?: any) => {
    setExecuting(true);
    setResult(null);
    try {
      const payload: any = { lab_type: labType };
      if (code) payload.code = code;
      if (parameters) payload.parameters = parameters;
      const res = await virtualLabApi.execute(payload);
      setResult(res.data);
    } catch (err: any) {
      setResult({
        success: false,
        output: '',
        error: err.response?.data?.detail || err.message || 'Execution failed',
        execution_time_ms: 0,
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSqlRun = () => executeCode('sql_sandbox', sqlCode);
  const handlePythonRun = () => executeCode('python_validator', pythonCode);
  const handleCpiCalculate = () => {
    const items = cpiItems.map(i => ({
      name: i.name,
      base_price: parseFloat(i.base_price) || 0,
      current_price: parseFloat(i.current_price) || 0,
      weight: parseFloat(i.weight) || 0,
    }));
    executeCode('cpi_calculator', undefined, { items, base_year: parseInt(baseYear), current_year: parseInt(currentYear) });
  };

  const updateCpiItem = (idx: number, field: keyof CpiItem, val: string) => {
    setCpiItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  };
  const addCpiItem = () => setCpiItems(prev => [...prev, { name: '', base_price: '', current_price: '', weight: '' }]);
  const removeCpiItem = (idx: number) => setCpiItems(prev => prev.filter((_, i) => i !== idx));

  const tabs: { key: LabTab; label: string; icon: React.ElementType; desc: string }[] = [
    { key: 'sql_sandbox', label: 'SQL Sandbox', icon: Database, desc: 'Practice statistical SQL queries' },
    { key: 'cpi_calculator', label: 'CPI Calculator', icon: Calculator, desc: 'Interactive price index computation' },
    { key: 'python_validator', label: 'Python Data Validator', icon: Code, desc: 'Run data validation scripts' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-gov-blue" />
              <h1 className="text-xl font-bold text-navy-900">Interactive Learning Labs</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Sandbox</span>
            </div>
            <p className="text-sm text-slate-600 mt-1">Practice statistical computing skills in a safe, sandboxed environment</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 font-medium">
            <Shield className="w-3.5 h-3.5" />
            Sandboxed Execution
          </div>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition border ${
                activeTab === t.key
                  ? 'bg-gov-blue text-white border-gov-blue shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
        <strong>{tabs.find(t => t.key === activeTab)?.label}:</strong>{' '}
        {tabs.find(t => t.key === activeTab)?.desc}. All code runs in an isolated sandbox — no access to production systems.
      </div>

      {/* SQL Sandbox Tab */}
      {activeTab === 'sql_sandbox' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-navy-900">SQL Query Editor</span>
              <select
                className="text-xs border border-slate-300 rounded-md px-2 py-1.5"
                onChange={e => { const s = SQL_SAMPLES[parseInt(e.target.value)]; if (s) setSqlCode(s.code); }}
                defaultValue=""
              >
                <option value="" disabled>Load sample query…</option>
                {SQL_SAMPLES.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
              </select>
            </div>
            <textarea
              value={sqlCode}
              onChange={e => setSqlCode(e.target.value)}
              rows={8}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-gov-blue resize-y"
              placeholder="Enter SQL query..."
              spellCheck={false}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={handleSqlRun}
                disabled={executing || !sqlCode.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute Query
              </button>
              <button onClick={() => setSqlCode('')} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CPI Calculator Tab */}
      {activeTab === 'cpi_calculator' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-navy-900 mb-1">Consumer Price Index — Laspeyres Method</h3>
            <p className="text-xs text-slate-600 mb-4">
              CPI = Σ(P₁/P₀ × W) / ΣW × 100, where P₀ = base period price, P₁ = current period price, W = item weight
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Base Year</label>
                <input type="number" value={baseYear} onChange={e => setBaseYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gov-blue focus:outline-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 mb-1 block">Current Year</label>
                <input type="number" value={currentYear} onChange={e => setCurrentYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gov-blue focus:outline-none" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="text-left px-3 py-2 font-semibold">Item Name</th>
                    <th className="text-left px-3 py-2 font-semibold">Base Price (₹)</th>
                    <th className="text-left px-3 py-2 font-semibold">Current Price (₹)</th>
                    <th className="text-left px-3 py-2 font-semibold">Weight (%)</th>
                    <th className="px-3 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {cpiItems.map((item, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-3 py-1.5">
                        <input type="text" value={item.name} onChange={e => updateCpiItem(idx, 'name', e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-gov-blue focus:outline-none" placeholder="Item name" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" value={item.base_price} onChange={e => updateCpiItem(idx, 'base_price', e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-gov-blue focus:outline-none" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" value={item.current_price} onChange={e => updateCpiItem(idx, 'current_price', e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-gov-blue focus:outline-none" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" value={item.weight} onChange={e => updateCpiItem(idx, 'weight', e.target.value)}
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-gov-blue focus:outline-none" />
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        {cpiItems.length > 1 && (
                          <button onClick={() => removeCpiItem(idx)} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-3">
              <button onClick={addCpiItem} className="text-xs text-gov-blue font-semibold hover:underline">+ Add Item</button>
              <button
                onClick={handleCpiCalculate}
                disabled={executing}
                className="flex items-center gap-2 px-4 py-2 bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
                Calculate CPI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Python Data Validator Tab */}
      {activeTab === 'python_validator' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-navy-900">Python Script Editor</span>
              <select
                className="text-xs border border-slate-300 rounded-md px-2 py-1.5"
                onChange={e => { const s = PYTHON_SAMPLES[parseInt(e.target.value)]; if (s) setPythonCode(s.code); }}
                defaultValue=""
              >
                <option value="" disabled>Load sample script…</option>
                {PYTHON_SAMPLES.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
              </select>
            </div>
            <textarea
              value={pythonCode}
              onChange={e => setPythonCode(e.target.value)}
              rows={14}
              className="w-full bg-slate-900 text-emerald-400 font-mono text-sm p-4 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-gov-blue resize-y"
              placeholder="Enter Python code..."
              spellCheck={false}
            />
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={handlePythonRun}
                disabled={executing || !pythonCode.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-gov-blue hover:bg-gov-darkblue text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
              >
                {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Execute Script
              </button>
              <button onClick={() => setPythonCode('')} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Result */}
      {result && (
        <div className={`bg-white rounded-xl border p-5 shadow-xs ${result.success ? 'border-emerald-200' : 'border-rose-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {result.success ? (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ Success</span>
              ) : (
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">✗ Error</span>
              )}
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {result.execution_time_ms}ms
              </span>
            </div>
          </div>

          {result.error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-800 font-mono mb-3">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              {result.error}
            </div>
          )}

          {result.output && (
            <pre className="bg-slate-900 text-slate-100 font-mono text-xs p-4 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-80 overflow-y-auto">
              {result.output}
            </pre>
          )}

          {result.metadata && Object.keys(result.metadata).length > 0 && (
            <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-700 block mb-2">Metadata</span>
              <pre className="text-xs text-slate-600 font-mono">{JSON.stringify(result.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
