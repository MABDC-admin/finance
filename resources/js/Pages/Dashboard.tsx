import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

type ActiveYear = {
    id: number;
    name: string;
} | null;

type Totals = {
    learners: number;
    enrollments: number;
    document_requirements: number;
};

type DocumentTotals = {
    ok: number;
    missing: number;
    expired: number;
    pending_review: number;
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

type Props = {
    activeYear: ActiveYear;
    totals: Totals;
    documentTotals: DocumentTotals;
    byLevel: LevelCount[];
    latestImport: LatestImport;
    duplicateLrnWarnings: ImportWarning[];
};

export default function Dashboard({
    activeYear,
    totals,
    documentTotals,
    byLevel,
    latestImport,
    duplicateLrnWarnings,
}: Props) {
    const documentTotal = Object.values(documentTotals).reduce(
        (sum, value) => sum + value,
        0,
    );
    const attentionTotal =
        documentTotals.missing +
        documentTotals.expired +
        documentTotals.pending_review;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Registrar operations
                        </p>
                        <h2 className="text-xl font-semibold leading-tight text-gray-900">
                            Dashboard
                        </h2>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        Active year:{' '}
                        <span className="text-gray-900">
                            {activeYear?.name ?? 'Not configured'}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="grid gap-4 md:grid-cols-3">
                        <MetricCard
                            label="Learners"
                            value={totals.learners}
                            helper={`${totals.enrollments.toLocaleString()} active-year enrollments`}
                        />
                        <MetricCard
                            label="Documents"
                            value={totals.document_requirements}
                            helper={`${attentionTotal.toLocaleString()} need registrar attention`}
                            tone={attentionTotal > 0 ? 'warn' : 'default'}
                        />
                        <MetricCard
                            label="Import warnings"
                            value={latestImport?.warning_count ?? 0}
                            helper={latestImport?.original_filename ?? 'No import yet'}
                            tone={
                                (latestImport?.warning_count ?? 0) > 0
                                    ? 'warn'
                                    : 'default'
                            }
                        />
                    </section>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Learners by level
                                </h3>
                            </div>
                            <div className="space-y-3 p-6">
                                {byLevel.map((item) => (
                                    <LevelBar
                                        key={item.level}
                                        level={item.level}
                                        count={item.learners}
                                        max={Math.max(
                                            ...byLevel.map(
                                                (level) => level.learners,
                                            ),
                                            1,
                                        )}
                                    />
                                ))}
                                {byLevel.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        No active-year enrollments found.
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Document compliance
                                </h3>
                            </div>
                            <div className="space-y-4 p-6">
                                <ComplianceRow
                                    label="OK"
                                    value={documentTotals.ok}
                                    total={documentTotal}
                                    tone="ok"
                                />
                                <ComplianceRow
                                    label="Missing"
                                    value={documentTotals.missing}
                                    total={documentTotal}
                                    tone="warn"
                                />
                                <ComplianceRow
                                    label="Expired"
                                    value={documentTotals.expired}
                                    total={documentTotal}
                                    tone="warn"
                                />
                                <ComplianceRow
                                    label="Pending review"
                                    value={documentTotals.pending_review}
                                    total={documentTotal}
                                    tone="neutral"
                                />
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        Latest workbook import
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Import health from the current school
                                        year.
                                    </p>
                                </div>
                                <Link
                                    href={route('imports.index')}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Open imports
                                </Link>
                            </div>
                            {latestImport ? (
                                <div className="grid gap-4 p-6 sm:grid-cols-3">
                                    <MiniStat
                                        label="Imported"
                                        value={latestImport.imported_rows}
                                    />
                                    <MiniStat
                                        label="Skipped"
                                        value={latestImport.skipped_rows}
                                    />
                                    <MiniStat
                                        label="Warnings"
                                        value={latestImport.warning_count}
                                        tone={
                                            latestImport.warning_count > 0
                                                ? 'warn'
                                                : 'default'
                                        }
                                    />
                                </div>
                            ) : (
                                <div className="p-6 text-sm text-gray-500">
                                    No workbook import has been recorded.
                                </div>
                            )}
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Duplicate LRN review
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Latest import rows that need manual
                                    identity review.
                                </p>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {duplicateLrnWarnings.slice(0, 5).map(
                                    (warning, index) => (
                                        <div
                                            key={`${warning.row}-${index}`}
                                            className="px-6 py-4"
                                        >
                                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                                                Row {warning.row ?? 'unknown'}
                                            </p>
                                            <p className="mt-1 text-sm text-gray-800">
                                                {warning.message}
                                            </p>
                                        </div>
                                    ),
                                )}
                                {duplicateLrnWarnings.length === 0 && (
                                    <div className="p-6 text-sm text-gray-500">
                                        No duplicate-LRN warnings in the latest
                                        import.
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function MetricCard({
    label,
    value,
    helper,
    tone = 'default',
}: {
    label: string;
    value: number;
    helper: string;
    tone?: 'default' | 'warn';
}) {
    return (
        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <p
                className={
                    'mt-2 text-3xl font-semibold ' +
                    (tone === 'warn' && value > 0
                        ? 'text-amber-700'
                        : 'text-gray-900')
                }
            >
                {value.toLocaleString()}
            </p>
            <p className="mt-2 truncate text-sm text-gray-500">{helper}</p>
        </section>
    );
}

function LevelBar({
    level,
    count,
    max,
}: {
    level: string;
    count: number;
    max: number;
}) {
    return (
        <div className="grid grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">{level}</span>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                    className="h-full rounded-full bg-indigo-600"
                    style={{ width: `${Math.max((count / max) * 100, 6)}%` }}
                />
            </div>
            <span className="text-right text-sm font-semibold text-gray-900">
                {count}
            </span>
        </div>
    );
}

function ComplianceRow({
    label,
    value,
    total,
    tone,
}: {
    label: string;
    value: number;
    total: number;
    tone: 'ok' | 'warn' | 'neutral';
}) {
    const width = total === 0 ? 0 : (value / total) * 100;
    const color =
        tone === 'ok'
            ? 'bg-emerald-600'
            : tone === 'warn'
              ? 'bg-amber-500'
              : 'bg-gray-500';

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-semibold text-gray-900">
                    {value.toLocaleString()}
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}

function MiniStat({
    label,
    value,
    tone = 'default',
}: {
    label: string;
    value: number;
    tone?: 'default' | 'warn';
}) {
    return (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <p
                className={
                    'text-2xl font-semibold ' +
                    (tone === 'warn' && value > 0
                        ? 'text-amber-700'
                        : 'text-gray-900')
                }
            >
                {value.toLocaleString()}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>
        </div>
    );
}
