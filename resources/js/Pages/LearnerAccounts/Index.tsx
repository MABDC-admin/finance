import React, { useState } from 'react';
import FinanceLayout from '@/Layouts/FinanceLayout';
import { Head, Link, router } from '@inertiajs/react';

const fmt = (n: number | string) =>
    parseFloat(String(n)).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    'Cleared':        { bg: 'bg-[#e2f0d9]', text: 'text-[#385723]', dot: 'bg-[#4caf50]' },
    'Partially Paid': { bg: 'bg-amber-50',   text: 'text-amber-700', dot: 'bg-amber-400' },
    'Unpaid':         { bg: 'bg-red-50',     text: 'text-red-700',   dot: 'bg-red-500'   },
    'No Assessment':  { bg: 'bg-slate-100',  text: 'text-slate-500', dot: 'bg-slate-400' },
};

const STATUS_PILLS = ['', 'Cleared', 'Partially Paid', 'Unpaid', 'No Assessment'];

function getInitials(name: string) {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Index({ enrollments, levels = [], filters }: any) {
    const [search, setSearch]           = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [levelFilter, setLevelFilter]   = useState(filters.level || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('learner-accounts.index'), { search, status: statusFilter, level: levelFilter }, { preserveState: true });
    };

    const handleStatusFilter = (s: string) => {
        setStatusFilter(s);
        router.get(route('learner-accounts.index'), { search, status: s, level: levelFilter }, { preserveState: true });
    };

    const handleLevelFilter = (l: string) => {
        setLevelFilter(l);
        router.get(route('learner-accounts.index'), { search, status: statusFilter, level: l }, { preserveState: true });
    };

    return (
        <FinanceLayout
            header={
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#005f3d]/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#005f3d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-extrabold text-xl text-slate-800 leading-tight">Learner Accounts</h2>
                        <p className="text-xs text-slate-400 font-semibold">{enrollments.total} total accounts</p>
                    </div>
                </div>
            }
        >
            <Head title="Learner Accounts" />

            <div className="py-8">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-5">

                    {/* ── Filter Bar ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

                        {/* Status Pills */}
                        <div className="flex flex-wrap gap-2">
                            {STATUS_PILLS.map((s) => {
                                const active = statusFilter === s;
                                const cfg = s ? STATUS_CONFIG[s] : null;
                                return (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusFilter(s)}
                                        className={`text-sm px-6 py-2.5 rounded-xl font-black uppercase tracking-wider transition-all duration-150 flex items-center gap-2 shadow-sm border ${
                                            active
                                                ? 'bg-[#005f3d] text-white border-[#005f3d] ring-2 ring-[#005f3d]/20 scale-[1.03]'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                    >
                                        {cfg && (
                                            <span className={`w-2 h-2 rounded-full ${active ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]' : cfg.dot}`} />
                                        )}
                                        {s === '' ? 'All' : s}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right: Level + Search */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Level Dropdown */}
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 010 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h10a1 1 0 010 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h6a1 1 0 010 2H4a1 1 0 01-1-1z" />
                                </svg>
                                <select
                                    value={levelFilter}
                                    onChange={(e) => handleLevelFilter(e.target.value)}
                                    className="text-sm rounded-lg border-slate-300 focus:border-[#005f3d] focus:ring-[#005f3d] bg-white font-semibold text-slate-700 py-1.5"
                                >
                                    <option value="">All Levels</option>
                                    {levels.map((lvl: string) => (
                                        <option key={lvl} value={lvl}>{lvl}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Search */}
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search by name or LRN..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 pr-4 py-2 w-72 text-sm rounded-lg border border-slate-300 focus:border-[#005f3d] focus:ring-1 focus:ring-[#005f3d] outline-none transition"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#005f3d] hover:bg-[#004d31] text-white font-extrabold text-xs uppercase px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                                    </svg>
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Table Card ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-[#005f3d]">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-white uppercase tracking-wider">Learner</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-white uppercase tracking-wider">LRN</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-white uppercase tracking-wider">Grade</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-white uppercase tracking-wider">Academic Year</th>
                                    <th className="px-6 py-4 text-left text-xs font-extrabold text-white uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-extrabold text-white uppercase tracking-wider">Outstanding Balance</th>
                                    <th className="px-6 py-4 text-right text-xs font-extrabold text-white uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {enrollments.data.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </div>
                                                <p className="font-bold text-slate-500">No learner accounts found.</p>
                                                <p className="text-xs">Try adjusting the filters or search query.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {enrollments.data.map((e: any) => {
                                    const cfg = STATUS_CONFIG[e.status] || STATUS_CONFIG['No Assessment'];
                                    const balance = parseFloat(e.balance);
                                    const hasBalance = balance > 0;

                                    return (
                                        <tr
                                            key={e.id}
                                            onClick={() => router.get(route('learner-accounts.show', e.id))}
                                            className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                                        >
                                            {/* Learner Name + Avatar */}
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-[#005f3d] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                                                        {getInitials(e.learner_name)}
                                                    </div>
                                                    <span className="text-sm font-extrabold text-slate-800 group-hover:text-[#005f3d] transition-colors">
                                                        {e.learner_name}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* LRN */}
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                                    {e.lrn}
                                                </span>
                                            </td>

                                            {/* Grade */}
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#005f3d] text-white text-xs font-black shadow-sm">
                                                    {e.grade_level}
                                                </span>
                                            </td>

                                            {/* Academic Year */}
                                            <td className="px-6 py-3.5 whitespace-nowrap text-sm font-semibold text-slate-500">
                                                {e.academic_year}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-3.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                    {e.status}
                                                </span>
                                            </td>

                                            {/* Balance */}
                                            <td className="px-6 py-3.5 whitespace-nowrap text-right">
                                                <span className={`text-sm font-black ${hasBalance ? 'text-red-600' : 'text-[#385723]'}`}>
                                                    AED {fmt(e.balance)}
                                                </span>
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-3.5 whitespace-nowrap text-right" onClick={(ev) => ev.stopPropagation()}>
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('learner-accounts.show', e.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-black text-[#005f3d] hover:text-white hover:bg-[#005f3d] border border-[#005f3d] px-3 py-1.5 rounded-lg transition-all uppercase tracking-wide"
                                                    >
                                                        View Ledger
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            const emails = [e.receipt_email, e.mother_email, e.father_email].filter(Boolean);
                                                            if (emails.length === 0) {
                                                                alert("No email address configured for this student. Please add a receipt email or parent contact details.");
                                                                return;
                                                            }
                                                            if (confirm(`Send Statement of Account to parents (${emails.join(', ')})?`)) {
                                                                router.post(route('learner-accounts.email-statement', e.id), {}, { preserveScroll: true });
                                                            }
                                                        }}
                                                        className={`inline-flex items-center justify-center p-2.5 rounded-lg border transition-all shadow-xs
                                                            ${e.statement_sent 
                                                                ? 'bg-[#e2f0d9] border-[#c5e0b4] text-[#385723] hover:bg-[#c5e0b4]' 
                                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-white hover:bg-[#005f3d] hover:border-[#005f3d]'
                                                            }`}
                                                        title={e.statement_sent ? "Statement Sent ✓ (Click to Resend)" : "Email Statement to Parent"}
                                                    >
                                                        {e.statement_sent ? (
                                                            <div className="relative flex items-center justify-center">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-green-600 rounded-full flex items-center justify-center text-[7px] text-white font-extrabold border border-white">
                                                                    ✓
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* ── Pagination ── */}
                        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <p className="text-xs font-bold text-slate-400">
                                Showing page <span className="text-slate-700">{enrollments.current_page}</span> of <span className="text-slate-700">{enrollments.last_page}</span>
                                <span className="mx-1.5 text-slate-300">·</span>
                                <span className="text-slate-700">{enrollments.total}</span> total accounts
                            </p>
                            <div className="flex gap-2">
                                {enrollments.prev_page_url ? (
                                    <Link
                                        href={enrollments.prev_page_url}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wide text-[#005f3d] border border-[#005f3d] rounded-lg hover:bg-[#005f3d] hover:text-white transition-all"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Prev
                                    </Link>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-300 border border-slate-200 rounded-lg cursor-not-allowed">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Prev
                                    </span>
                                )}
                                {enrollments.next_page_url ? (
                                    <Link
                                        href={enrollments.next_page_url}
                                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wide text-white bg-[#005f3d] hover:bg-[#004d31] rounded-lg transition-all shadow-sm"
                                    >
                                        Next
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wide text-slate-300 border border-slate-200 rounded-lg cursor-not-allowed">
                                        Next
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </FinanceLayout>
    );
}
