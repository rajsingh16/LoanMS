import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api';

type Kind = 'repayment-details' | 'due-vs-collection' | 'collection-details' | 'loan-summary';
const titles: Record<Kind, string> = { 'repayment-details': 'Repayment Details', 'due-vs-collection': 'Due vs Collection', 'collection-details': 'Collection Details', 'loan-summary': 'Loan Summary' };
const money = (value: unknown) => `₹${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AuthoritativeRepaymentReport({ kind }: { kind: Kind }) {
  const [from, setFrom] = useState(''); const [to, setTo] = useState('');
  const [data, setData] = useState<unknown[] | Record<string, unknown>>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const request = useRef(0);
  const load = async () => {
    const current = ++request.current; setLoading(true); setError('');
    const query = new URLSearchParams(); if (from) query.set('from', from); if (to) query.set('to', to); query.set('limit', '200');
    try { const response = await apiFetch(`/api/repayments/reports/${kind}?${query}`); const body = await response.json(); if (!response.ok) throw new Error(body?.error?.message || 'Failed to load report'); if (current === request.current) setData(body.data); }
    catch (cause) { if (current === request.current) { setData([]); setError(cause instanceof Error ? cause.message : 'Failed to load report'); } }
    finally { if (current === request.current) setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const rows = Array.isArray(data) ? data as Record<string, unknown>[] : [];
  return <div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{titles[kind]}</h1><p className="text-gray-600 dark:text-gray-400 mt-1">Authoritative Phase 8 schedule and payment ledger data.</p></div><div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 border rounded-lg p-3"><input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border rounded px-2 py-1 dark:bg-gray-700" /><input type="date" value={to} onChange={e => setTo(e.target.value)} className="border rounded px-2 py-1 dark:bg-gray-700" /><button onClick={() => void load()} className="bg-blue-600 text-white px-3 py-1 rounded">Apply</button></div>{loading ? <p>Loading report…</p> : error ? <div className="text-red-700"><p>{error}</p><button onClick={() => void load()} className="mt-2 bg-blue-600 text-white px-3 py-1 rounded">Retry</button></div> : kind === 'due-vs-collection' ? <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4">{Object.entries(data as Record<string, unknown>).filter(([key]) => !['from', 'to'].includes(key)).map(([key, value]) => <div key={key}><p className="text-sm text-gray-500">{key.replace(/_/g, ' ')}</p><p className="font-semibold">{key.includes('count') ? String(value) : money(value)}</p></div>)}</div> : rows.length === 0 ? <p className="bg-white dark:bg-gray-800 border rounded-lg p-5">No authoritative records match the selected scope.</p> : <div className="overflow-x-auto bg-white dark:bg-gray-800 border rounded-lg"><table className="min-w-full text-sm"><thead><tr>{Object.keys(rows[0]).map(key => <th key={key} className="p-2 text-left border-b">{key.replace(/_/g, ' ')}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id || index)}>{Object.entries(row).map(([key, value]) => <td key={key} className="p-2 border-b">{/(amount|principal|interest|fees|outstanding|paid|scheduled)/.test(key) ? money(value) : String(value ?? '—')}</td>)}</tr>)}</tbody></table></div>}</div>;
}
