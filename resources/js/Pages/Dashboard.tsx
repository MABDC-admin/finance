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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            Registrar Dashboard
                        </h1>
                        <p className="mt-3 text-base font-medium text-slate-500">
                            Central overview of enrollment, admissions, and compliance.
                        </p>
                    </div>
                    <div className="inline-flex items-center rounded-xl bg-green-50 px-4 py-3 text-sm font-black text-green-900 ring-1 ring-green-100">
                        {activeYear?.name ?? 'No active school year'}
                    </div>
                </div>
            }
        >
            <Head title="Registrar Dashboard" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-none space-y-7">
                    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        <StatCard
                            icon={<PeopleIcon />}
                            label="Total Enrolled Learners"
                            value={totals.learners}
                            helper={`${totals.enrollments.toLocaleString()} active enrollments`}
                            trend="up"
                        />
                        <StatCard
                            icon={<ApplicationIcon />}
                            label="New Applications"
                            value={totals.new_applications}
                            helper="Pending admission review"
                            trend="flat"
                        />
                        <StatCard
                            icon={<DocumentIcon />}
                            label="Pending Document Reviews"
                            value={pendingDocuments}
                            helper={`${documentTotals.missing.toLocaleString()} missing requirements`}
                            trend={pendingDocuments > 0 ? 'down' : 'flat'}
                        />
                        <StatCard
                            icon={<AssessmentIcon />}
                            label="Learners for Assessment"
                            value={totals.for_assessment}
                            helper="Awaiting interview/testing"
                            trend="flat"
                        />
                        <StatCard
                            icon={<BuildingIcon />}
                            label="Programs & Levels"
                            value={byLevel.length}
                            helper="Active grade levels"
                            trend="flat"
                        />
                        <StatCard
                            icon={<TransferIcon />}
                            label="Withdrawn & Transferred"
                            value={totals.withdrawn_transferred}
                            helper="Learners leaving the institution"
                            trend="flat"
                        />
                    </section>

                    <section className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <Panel
                            title="Enrollment by Level"
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
                                                'rounded-full px-3 py-1.5 text-xs font-black transition ' +
                                                (registrationPage === page
                                                    ? 'bg-green-700 text-white shadow-sm'
                                                    : 'bg-green-50 text-green-800 hover:bg-green-100')
                                            }
                                        >
                                            Page {page + 1}
                                        </button>
                                    ))}
                                    <Link
                                        href={route('learners.index')}
                                        className="text-sm font-black text-green-800 hover:text-green-950"
                                    >
                                        View All
                                    </Link>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-[#005f3d] text-white">
                                        <tr className="text-left text-sm font-bold">
                                            <th className="px-4 py-4 rounded-l-lg">
                                                #
                                            </th>
                                            <th className="px-4 py-4">
                                                Level
                                            </th>
                                            <th className="px-4 py-4">
                                                Students
                                            </th>
                                            <th className="px-4 py-4">
                                                Share
                                            </th>
                                            <th className="rounded-r-lg px-4 py-4">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {visibleRegistrationRows.map(
                                            (item, index) => (
                                                <tr key={item.level}>
                                                    <td className="px-4 py-4 text-sm font-bold text-slate-500">
                                                        {pageOffset +
                                                            index +
                                                            1}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-black text-slate-800">
                                                        {item.level}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-semibold text-slate-600">
                                                        {item.learners.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <LevelProgress
                                                            value={
                                                                item.learners
                                                            }
                                                            max={Math.max(
                                                                ...byLevel.map(
                                                                    (level) =>
                                                                        level.learners,
                                                                ),
                                                                1,
                                                            )}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                                                            Active
                                                        </span>
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                        {visibleRegistrationRows.length ===
                                            0 && (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-8 text-center text-sm font-bold text-slate-400"
                                                >
                                                    No levels on this page.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Panel>

                        <Panel title="Recent Activities" elevated>
                            <div className="space-y-4">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex gap-4 border-b border-green-600/20 pb-4 last:border-0 last:pb-0">
                                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-300 shadow-[0_0_8px_rgba(134,239,172,0.8)]" />
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {activity.actor} <span className="font-normal text-green-100">performed</span> {activity.event_type.replace('_', ' ')}
                                                </p>
                                                <p className="mt-1 text-xs font-medium text-green-200">
                                                    on {activity.subject_type} • {activity.created_at}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm font-semibold text-green-100">No recent activities logged.</p>
                                )}
                                <div className="pt-2">
                                    <Link href="#" className="text-xs font-black text-green-300 hover:text-white uppercase tracking-wider">
                                        View Audit Trail &rarr;
                                    </Link>
                                </div>
                            </div>
                        </Panel>
                    </section>

                    <section className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <Panel title="Requirements & Document Status">
                            <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
                                <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border-[22px] border-emerald-500 bg-white shadow-inner">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-slate-950">
                                            {documentTotals.verified.toLocaleString()}
                                        </p>
                                        <p className="text-sm font-semibold text-slate-500">
                                            Verified
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <LegendRow
                                        color="bg-emerald-500"
                                        label="Verified"
                                        value={documentTotals.verified}
                                        total={documentTotal}
                                    />
                                    <LegendRow
                                        color="bg-amber-500"
                                        label="Pending Verification"
                                        value={documentTotals.pending_verification}
                                        total={documentTotal}
                                    />
                                    <LegendRow
                                        color="bg-blue-500"
                                        label="Submitted"
                                        value={documentTotals.submitted}
                                        total={documentTotal}
                                    />
                                    <LegendRow
                                        color="bg-rose-500"
                                        label="Missing"
                                        value={documentTotals.missing}
                                        total={documentTotal}
                                    />
                                </div>
                            </div>
                        </Panel>

                        <Panel
                            title="Important Alerts & Deadlines"
                            action={
                                <Link
                                    href={route('imports.index')}
                                    className="text-sm font-black text-green-800 hover:text-green-950"
                                >
                                    Review All
                                </Link>
                            }
                        >
                            <div className="divide-y divide-slate-100">
                                <Announcement
                                    title="Enrollment records are ready for review."
                                    date={activeYear?.name ?? 'Current year'}
                                    type="info"
                                />
                                {duplicateLrnWarnings.length > 0 ? (
                                    duplicateLrnWarnings
                                        .slice(0, 2)
                                        .map((warning, index) => (
                                            <Announcement
                                                key={`${warning.row}-${index}`}
                                                title={warning.message}
                                                date={`Row ${warning.row ?? 'unknown'}`}
                                                type="warning"
                                            />
                                        ))
                                ) : (
                                    <Announcement
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

function Panel({
    title,
    action,
    elevated = false,
    children,
}: {
    title: string;
    action?: React.ReactNode;
    elevated?: boolean;
    children: React.ReactNode;
}) {
    return (
        <section
            className={
                'overflow-hidden rounded-2xl bg-white shadow-[0_15px_36px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 ' +
                (elevated ? 'border-t-4 border-emerald-500' : '')
            }
        >
            <div
                className={
                    'flex items-center justify-between gap-4 px-6 py-5 ' +
                    (elevated
                        ? 'bg-slate-950 text-white'
                        : 'border-b border-slate-100')
                }
            >
                <h2
                    className={
                        'text-xl font-black ' +
                        (elevated ? 'text-white' : 'text-slate-900')
                    }
                >
                    {title}
                </h2>
                {action}
            </div>
            <div className={elevated ? 'bg-slate-900 p-6' : 'p-6'}>{children}</div>
        </section>
    );
}

function StatCard({
    icon,
    label,
    value,
    helper,
    trend,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    helper: string;
    trend: 'up' | 'down' | 'flat';
}) {
    return (
        <section className="rounded-2xl bg-white p-6 shadow-premium ring-1 ring-slate-200/50 transition hover:shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
            <div className="flex items-start gap-5">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                        {value.toLocaleString()}
                    </p>
                    <p
                        className={
                            'mt-3 text-xs font-black uppercase tracking-wide ' +
                            (trend === 'down'
                                ? 'text-rose-600'
                                : trend === 'up'
                                  ? 'text-emerald-600'
                                  : 'text-slate-400')
                        }
                    >
                        {trend === 'up' && 'Up '}
                        {trend === 'down' && 'Action needed '}
                        {trend === 'flat' && 'No change '}
                        <span className="font-semibold text-slate-400 ml-1 normal-case tracking-normal">
                            • {helper}
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
}

function LevelProgress({ value, max }: { value: number; max: number }) {
    return (
        <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-100">
            <div
                className="h-full rounded-full bg-emerald-500 shadow-glow"
                style={{ width: `${Math.max((value / max) * 100, 8)}%` }}
            />
        </div>
    );
}

function QuickAction({
    href,
    icon,
    label,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-4 rounded-xl px-3 py-3 font-black text-emerald-900 transition hover:bg-emerald-50"
        >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                {icon}
            </span>
            {label}
        </Link>
    );
}

function LegendRow({
    color,
    label,
    value,
    total,
}: {
    color: string;
    label: string;
    value: number;
    total: number;
}) {
    const percent = total === 0 ? 0 : Math.round((value / total) * 100);

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <span className={`h-4 w-4 rounded-full ${color}`} />
                <span className="font-bold text-slate-700">{label}</span>
            </div>
            <span className="font-black text-slate-900">
                {value.toLocaleString()} <span className="text-slate-400 text-sm font-semibold ml-1">({percent}%)</span>
            </span>
        </div>
    );
}

function Announcement({ title, date, type }: { title: string; date: string; type: 'info' | 'warning' | 'success' }) {
    const colors = {
        info: 'bg-blue-500',
        warning: 'bg-amber-500',
        success: 'bg-emerald-500'
    };
    
    return (
        <div className="flex gap-4 py-4 first:pt-0 last:pb-0 hover:bg-slate-50 transition -mx-6 px-6 cursor-pointer">
            <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${colors[type]}`} />
            <div>
                <p className="font-bold leading-6 text-slate-900">
                    {title}
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {date}
                </p>
            </div>
        </div>
    );
}

function IconShell({ children }: { children: React.ReactNode }) {
    return (
        <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
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
