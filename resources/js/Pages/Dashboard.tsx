import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

type ActiveYear = {
    id: number;
    name: string;
} | null;

type Totals = {
    learners: number;
    enrollments: number;
    withdrawn_transferred: number;
    new_applications: number;
    for_assessment: number;
    document_requirements: number;
};

type DocumentTotals = {
    verified: number;
    missing: number;
    pending_verification: number;
    submitted: number;
    not_applicable: number;
};

type LevelCount = {
    level: string;
    learners: number;
};

type ImportWarning = {
    row: number | null;
    code: string;
    message: string;
};

type LatestImport = {
    id: number;
    original_filename: string;
    imported_rows: number;
    skipped_rows: number;
    warning_count: number;
    status: string;
    created_at: string;
} | null;

type RecentActivity = {
    id: number;
    actor: string;
    event_type: string;
    subject_type: string;
    created_at: string;
};

type Props = {
    activeYear: ActiveYear;
    totals: Totals;
    documentTotals: DocumentTotals;
    byLevel: LevelCount[];
    recentActivities: RecentActivity[];
    latestImport: LatestImport;
    duplicateLrnWarnings: ImportWarning[];
};

export default function Dashboard({
    activeYear,
    totals,
    documentTotals,
    byLevel,
    recentActivities,
    latestImport,
    duplicateLrnWarnings,
}: Props) {
    const [registrationPage, setRegistrationPage] = useState(0);
    const documentTotal = Object.values(documentTotals).reduce(
        (sum, value) => sum + value,
        0,
    );
    const pendingDocuments =
        documentTotals.missing +
        documentTotals.pending_verification + 
        documentTotals.submitted;

    const registrationPages = useMemo(() => {
        const pageSize = Math.max(1, Math.ceil(byLevel.length / 2));

        return [
            byLevel.slice(0, pageSize),
            byLevel.slice(pageSize),
        ];
    }, [byLevel]);
    
    const visibleRegistrationRows =
        registrationPages[registrationPage] ?? registrationPages[0];
    const pageOffset = registrationPage === 0
        ? 0
        : registrationPages[0].length;

    const completionRate = totals.learners > 0 
        ? Math.round((documentTotals.verified / Math.max(documentTotal, 1)) * 100) 
        : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
                            🏫 Registrar Command Center
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            Dashboard Overview
                        </h1>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                            Real-time institutional metrics and academic operations.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#005f3d] to-[#007a4d] px-4 py-2.5 text-sm font-black text-white shadow-md">
                            <svg className="w-4 h-4 text-emerald-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {activeYear?.name ?? 'No active school year'}
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Registrar Dashboard" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-none space-y-8">

                    {/* ── Hero Stat Cards ── */}
                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        <HeroStatCard
                            icon={<PeopleIcon />}
                            label="Total Enrolled Learners"
                            value={totals.learners}
                            sub={`${totals.enrollments.toLocaleString()} active enrollments`}
                            gradient="from-slate-900 via-slate-800 to-slate-900"
                            accentColor="text-emerald-400"
                            iconBg="bg-emerald-500/10 border-emerald-500/20"
                            glowColor="bg-emerald-500/10"
                        />
                        <HeroStatCard
                            icon={<ApplicationIcon />}
                            label="New Applications"
                            value={totals.new_applications}
                            sub="Pending admission review"
                            gradient="from-indigo-950 via-indigo-900 to-indigo-950"
                            accentColor="text-indigo-400"
                            iconBg="bg-indigo-500/10 border-indigo-500/20"
                            glowColor="bg-indigo-500/10"
                        />
                        <HeroStatCard
                            icon={<DocumentIcon />}
                            label="Pending Documents"
                            value={pendingDocuments}
                            sub={`${documentTotals.missing.toLocaleString()} missing requirements`}
                            gradient="from-amber-950 via-amber-900 to-amber-950"
                            accentColor="text-amber-400"
                            iconBg="bg-amber-500/10 border-amber-500/20"
                            glowColor="bg-amber-500/10"
                            alert={pendingDocuments > 0}
                        />
                        <HeroStatCard
                            icon={<AssessmentIcon />}
                            label="Learners for Assessment"
                            value={totals.for_assessment}
                            sub="Awaiting interview/testing"
                            gradient="from-teal-950 via-teal-900 to-teal-950"
                            accentColor="text-teal-400"
                            iconBg="bg-teal-500/10 border-teal-500/20"
                            glowColor="bg-teal-500/10"
                        />
                        <HeroStatCard
                            icon={<BuildingIcon />}
                            label="Programs & Levels"
                            value={byLevel.length}
                            sub="Active grade levels"
                            gradient="from-violet-950 via-violet-900 to-violet-950"
                            accentColor="text-violet-400"
                            iconBg="bg-violet-500/10 border-violet-500/20"
                            glowColor="bg-violet-500/10"
                        />
                        <HeroStatCard
                            icon={<TransferIcon />}
                            label="Withdrawn & Transferred"
                            value={totals.withdrawn_transferred}
                            sub="Learners leaving the institution"
                            gradient="from-rose-950 via-rose-900 to-rose-950"
                            accentColor="text-rose-400"
                            iconBg="bg-rose-500/10 border-rose-500/20"
                            glowColor="bg-rose-500/10"
                        />
                    </section>

                    {/* ── Enrollment Table + Recent Activities ── */}
                    <section className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_380px]">
                        <Panel
                            title="Enrollment by Grade Level"
                            icon={
                                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            }
                            action={
                                <div className="flex flex-wrap items-center gap-2">
                                    {[0, 1].map((page) => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() =>
                                                setRegistrationPage(page)
                                            }
                                            className={
                                                'rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition ' +
                                                (registrationPage === page
                                                    ? 'bg-[#005f3d] text-white shadow-sm'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                                            }
                                        >
                                            Page {page + 1}
                                        </button>
                                    ))}
                                    <Link
                                        href={route('learners.index')}
                                        className="text-[10px] font-black text-emerald-700 hover:text-emerald-900 uppercase tracking-wider"
                                    >
                                        View All →
                                    </Link>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-[#005f3d] text-white">
                                        <tr className="text-left text-[10px] font-black uppercase tracking-widest">
                                            <th className="px-4 py-3.5 rounded-l-lg">#</th>
                                            <th className="px-4 py-3.5">Level</th>
                                            <th className="px-4 py-3.5">Students</th>
                                            <th className="px-4 py-3.5">Distribution</th>
                                            <th className="rounded-r-lg px-4 py-3.5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {visibleRegistrationRows.map(
                                            (item, index) => (
                                                <tr key={item.level} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-4 py-3.5 text-xs font-bold text-slate-400">
                                                        {pageOffset + index + 1}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="text-xs font-black text-slate-800 uppercase">{item.level}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs font-black text-slate-700">
                                                        {item.learners.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <LevelProgress
                                                            value={item.learners}
                                                            max={Math.max(
                                                                ...byLevel.map(
                                                                    (level) => level.learners,
                                                                ),
                                                                1,
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[9px] font-black text-emerald-700 border border-emerald-100 uppercase">
                                                            Active
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        {visibleRegistrationRows.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                    No levels on this page.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>

                        {/* Recent Activities — Dark Theme */}
                        <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl overflow-hidden relative">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_60%)] pointer-events-none" />
                            <div className="px-6 py-5 border-b border-slate-800/60 flex items-center gap-3 relative z-10">
                                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="text-sm font-black text-white uppercase tracking-wider">Recent Activities</h2>
                            </div>
                            <div className="p-6 space-y-4 relative z-10">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex gap-3 pb-4 border-b border-slate-800/50 last:border-0 last:pb-0">
                                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                                                    <span className="font-black text-white">{activity.actor}</span>{' '}
                                                    <span className="text-slate-400">performed</span>{' '}
                                                    <span className="text-emerald-300 font-bold">{activity.event_type.replace('_', ' ')}</span>
                                                </p>
                                                <p className="mt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                    on {activity.subject_type} • {activity.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs font-bold text-slate-500">No recent activities logged.</p>
                                )}
                                <div className="pt-2">
                                    <Link href="#" className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors">
                                        View Full Audit Trail →
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Document Compliance + Quick Actions + Alerts ── */}
                    <section className="grid gap-7 xl:grid-cols-3">
                        {/* Document Compliance Ring */}
                        <Panel
                            title="Document Compliance"
                            icon={
                                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            }
                        >
                            <div className="flex flex-col items-center gap-5">
                                {/* Compliance Circle */}
                                <div className="relative h-40 w-40">
                                    <svg className="h-40 w-40 -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="50" fill="none" strokeWidth="12" className="stroke-slate-100" />
                                        <circle
                                            cx="60" cy="60" r="50" fill="none" strokeWidth="12"
                                            strokeLinecap="round"
                                            className="stroke-emerald-500"
                                            strokeDasharray={`${completionRate * 3.14} ${314 - completionRate * 3.14}`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black text-slate-900">{completionRate}%</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>
                                <div className="w-full space-y-3">
                                    <DocLegend color="bg-emerald-500" label="Verified" value={documentTotals.verified} total={documentTotal} />
                                    <DocLegend color="bg-amber-500" label="Pending" value={documentTotals.pending_verification} total={documentTotal} />
                                    <DocLegend color="bg-blue-500" label="Submitted" value={documentTotals.submitted} total={documentTotal} />
                                    <DocLegend color="bg-rose-500" label="Missing" value={documentTotals.missing} total={documentTotal} />
                                </div>
                            </div>
                        </Panel>

                        {/* Quick Navigation */}
                        <Panel
                            title="Quick Navigation"
                            icon={
                                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            }
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <QuickNavCard href={route('learners.index')} label="Student Records" emoji="👤" color="bg-indigo-50 border-indigo-100 hover:border-indigo-300" />
                                <QuickNavCard href={route('admissions.index')} label="Admissions" emoji="📋" color="bg-amber-50 border-amber-100 hover:border-amber-300" />
                                <QuickNavCard href={route('classes.index')} label="Sectioning" emoji="🏫" color="bg-emerald-50 border-emerald-100 hover:border-emerald-300" />
                                <QuickNavCard href={route('transfers.index')} label="Transfers" emoji="🔄" color="bg-rose-50 border-rose-100 hover:border-rose-300" />
                                <QuickNavCard href={route('enrollments.index')} label="Enrollment" emoji="📝" color="bg-teal-50 border-teal-100 hover:border-teal-300" />
                                <QuickNavCard href={route('imports.index')} label="Data Import" emoji="📂" color="bg-violet-50 border-violet-100 hover:border-violet-300" />
                            </div>
                        </Panel>

                        {/* Alerts & Deadlines */}
                        <Panel
                            title="Alerts & Deadlines"
                            icon={
                                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            }
                            action={
                                <Link
                                    href={route('imports.index')}
                                    className="text-[10px] font-black text-emerald-700 hover:text-emerald-900 uppercase tracking-wider"
                                >
                                    Review All →
                                </Link>
                            }
                        >
                            <div className="divide-y divide-slate-100 space-y-0">
                                <AlertItem
                                    title="Enrollment records are ready for review."
                                    date={activeYear?.name ?? 'Current year'}
                                    type="info"
                                />
                                {duplicateLrnWarnings.length > 0 ? (
                                    duplicateLrnWarnings
                                        .slice(0, 3)
                                        .map((warning, index) => (
                                            <AlertItem
                                                key={`${warning.row}-${index}`}
                                                title={warning.message}
                                                date={`Row ${warning.row ?? 'unknown'}`}
                                                type="warning"
                                            />
                                        ))
                                ) : (
                                    <AlertItem
                                        title="No critical alerts at this time."
                                        date="System check"
                                        type="success"
                                    />
                                )}
                            </div>
                        </Panel>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

/* ── Sub-Components ── */

function HeroStatCard({
    icon,
    label,
    value,
    sub,
    gradient,
    accentColor,
    iconBg,
    glowColor,
    alert = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    sub: string;
    gradient: string;
    accentColor: string;
    iconBg: string;
    glowColor: string;
    alert?: boolean;
}) {
    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-2xl border border-white/5 p-5 shadow-lg group hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${glowColor} blur-2xl pointer-events-none`} />
            <div className="flex items-center justify-between relative z-10">
                <div className="space-y-2">
                    <span className={`text-[9px] font-black ${accentColor} block tracking-widest uppercase`}>{label}</span>
                    <span className="text-3xl font-black text-white block tracking-tight">{value.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-slate-400 block">{sub}</span>
                </div>
                <div className={`h-11 w-11 rounded-xl ${iconBg} border ${accentColor} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <div className={accentColor}>{icon}</div>
                </div>
            </div>
            {alert && (
                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            )}
        </div>
    );
}

function Panel({
    title,
    icon,
    action,
    children,
}: {
    title: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                    {icon && <div className="flex-none">{icon}</div>}
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">{title}</h2>
                </div>
                {action}
            </div>
            <div className="p-6">{children}</div>
        </section>
    );
}

function LevelProgress({ value, max }: { value: number; max: number }) {
    const pct = Math.max((value / max) * 100, 8);
    return (
        <div className="flex items-center gap-2">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-[9px] font-black text-slate-400">{Math.round(pct)}%</span>
        </div>
    );
}

function QuickNavCard({ href, label, emoji, color }: { href: string; label: string; emoji: string; color: string }) {
    return (
        <Link
            href={href}
            className={`${color} border rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:shadow-md group`}
        >
            <span className="text-2xl group-hover:scale-110 transition-transform">{emoji}</span>
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider text-center">{label}</span>
        </Link>
    );
}

function DocLegend({ color, label, value, total }: { color: string; label: string; value: number; total: number }) {
    const pct = total === 0 ? 0 : Math.round((value / total) * 100);
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${color} shadow-sm`} />
                <span className="text-xs font-bold text-slate-600">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800">{value.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-slate-400">({pct}%)</span>
            </div>
        </div>
    );
}

function AlertItem({ title, date, type }: { title: string; date: string; type: 'info' | 'warning' | 'success' }) {
    const styles = {
        info: { dot: 'bg-blue-500', bg: 'hover:bg-blue-50/50' },
        warning: { dot: 'bg-amber-500', bg: 'hover:bg-amber-50/50' },
        success: { dot: 'bg-emerald-500', bg: 'hover:bg-emerald-50/50' },
    };
    const s = styles[type];
    
    return (
        <div className={`flex gap-3 py-3.5 first:pt-0 last:pb-0 ${s.bg} transition-colors -mx-6 px-6 cursor-pointer`}>
            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${s.dot} shadow-sm`} />
            <div className="min-w-0">
                <p className="text-xs font-bold leading-relaxed text-slate-800">{title}</p>
                <p className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{date}</p>
            </div>
        </div>
    );
}

/* ── SVG Icons ── */

function IconShell({ children }: { children: React.ReactNode }) {
    return (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {children}
        </svg>
    );
}

function PeopleIcon() {
    return (
        <IconShell>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </IconShell>
    );
}

function DocumentIcon() {
    return (
        <IconShell>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
            <path d="M14 2v6h6" />
            <path d="M9 15h6" />
            <path d="M9 18h6" />
        </IconShell>
    );
}

function BuildingIcon() {
    return (
        <IconShell>
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-6h6v6" />
        </IconShell>
    );
}

function ApplicationIcon() {
    return (
        <IconShell>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 14h6" />
            <path d="M9 10h6" />
        </IconShell>
    );
}

function AssessmentIcon() {
    return (
        <IconShell>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </IconShell>
    );
}

function TransferIcon() {
    return (
        <IconShell>
            <path d="M16 3h5v5" />
            <path d="M8 3H3v5" />
            <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
            <path d="m15 9 6-6" />
        </IconShell>
    );
}
