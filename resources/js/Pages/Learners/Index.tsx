import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, ReactNode, useState } from 'react';

type ActiveYear = {
    id: number;
    name: string;
} | null;

type EnrollmentSummary = {
    id: number;
    level: string;
    status: string;
    academic_year: string | null;
} | null;

type DocumentSummary = {
    ok: number;
    missing: number;
    expired: number;
    pending_review: number;
    total: number;
};

type LearnerRow = {
    id: number;
    lrn: string | null;
    full_name: string;
    birth_date: string | null;
    gender: string | null;
    mother_maiden_name: string | null;
    mother_contact_number: string | null;
    mother_email: string | null;
    father_name: string | null;
    father_contact_number: string | null;
    father_email: string | null;
    uae_address: string | null;
    philippine_address: string | null;
    previous_school: string | null;
    current_enrollment: EnrollmentSummary;
    document_summary: DocumentSummary;
};

type PaginatedLearners = {
    data: LearnerRow[];
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    activeYear: ActiveYear;
    filters: {
        search: string;
        level: string;
        status: string;
    };
    learners: PaginatedLearners;
    levels: string[];
    statuses: string[];
};

export default function LearnersIndex({
    activeYear,
    filters,
    learners,
    levels,
    statuses,
}: Props) {
    const [search, setSearch] = useState(filters.search);
    const [level, setLevel] = useState(filters.level);
    const [status, setStatus] = useState(filters.status);
    const [selectedLearner, setSelectedLearner] = useState<LearnerRow | null>(
        null,
    );

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        router.get(
            route('learners.index'),
            { search, level, status },
            { preserveState: true, replace: true },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setLevel('');
        setStatus('');
        router.get(route('learners.index'), {}, { replace: true });
    };
    const learnerExportUrl = route('exports.learners', {
        search: filters.search,
        level: filters.level,
        status: filters.status,
    });
    const missingDocumentsExportUrl = route('exports.missing-documents', {
        level: filters.level,
    });
    const disableLearner = (learner: LearnerRow) => {
        if (
            !window.confirm(
                `Disable ${learner.full_name}? This will mark the learner's current enrollment as disabled.`,
            )
        ) {
            return;
        }

        router.patch(route('learners.disable', learner.id), {}, {
            preserveScroll: true,
        });
    };
    const deleteLearner = (learner: LearnerRow) => {
        if (
            !window.confirm(
                `Delete ${learner.full_name}? This permanently removes the learner record and related enrollment documents.`,
            )
        ) {
            return;
        }

        router.delete(route('learners.destroy', learner.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="ops-kicker">
                            Registrar records
                        </p>
                        <h2 className="ops-title text-3xl leading-tight">
                            Learner Directory
                        </h2>
                    </div>
                    <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-2 text-sm font-bold text-green-800">
                        Active year{' '}
                        <span className="text-green-950">
                            {activeYear?.name ?? 'Not configured'}
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Learner Directory" />

            <div className="py-8">
                <div className="mx-auto w-full max-w-none space-y-5 px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="ops-panel grid gap-3 rounded-xl p-4 lg:grid-cols-[minmax(280px,1fr)_180px_180px_auto]"
                    >
                        <label className="block">
                            <span className="ops-kicker">
                                Search
                            </span>
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Name or LRN"
                                className="ops-control mt-1 block w-full rounded-md text-sm shadow-sm"
                            />
                        </label>

                        <label className="block">
                            <span className="ops-kicker">
                                Level
                            </span>
                            <select
                                value={level}
                                onChange={(event) =>
                                    setLevel(event.target.value)
                                }
                                className="ops-control mt-1 block w-full rounded-md text-sm shadow-sm"
                            >
                                <option value="">All levels</option>
                                {levels.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block">
                            <span className="ops-kicker">
                                Status
                            </span>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="ops-control mt-1 block w-full rounded-md text-sm shadow-sm"
                            >
                                <option value="">All statuses</option>
                                {statuses.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="flex items-end gap-2">
                            <button
                                type="submit"
                                className="ops-button-primary inline-flex h-10 items-center rounded-md px-4 text-sm font-black"
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="ops-button-secondary inline-flex h-10 items-center rounded-md px-4 text-sm font-bold"
                            >
                                Clear
                            </button>
                        </div>
                    </form>

                    <section className="ops-panel-soft overflow-hidden rounded-xl">
                        <div className="flex flex-col gap-3 border-b border-slate-200 bg-gradient-to-r from-white via-green-50/80 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">
                                    Current learner records
                                </h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={learnerExportUrl}
                                    className="ops-button-secondary rounded-md px-3 py-1.5 text-sm font-bold"
                                >
                                    Export learners
                                </a>
                                <a
                                    href={missingDocumentsExportUrl}
                                    className="rounded-md border border-amber-300/40 bg-amber-400/10 px-3 py-1.5 text-sm font-bold text-amber-200 hover:bg-amber-400/15"
                                >
                                    Missing docs
                                </a>
                            </div>
                        </div>

                        <div className="max-h-[68vh] overflow-y-auto">
                            <table className="ops-table w-full table-fixed divide-y divide-green-200">
                                <colgroup>
                                    <col className="w-[3%]" />
                                    <col className="w-[7%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[5%]" />
                                    <col className="w-[6%]" />
                                    <col className="w-[7%]" />
                                    <col className="w-[5%]" />
                                    <col className="w-[10%]" />
                                    <col className="w-[8%]" />
                                    <col className="w-[18%]" />
                                    <col className="w-[6%]" />
                                    <col className="w-[11%]" />
                                </colgroup>
                                <thead className="sticky top-0 z-20">
                                    <tr>
                                        <HeaderCell>#</HeaderCell>
                                        <HeaderCell>LRN</HeaderCell>
                                        <HeaderCell>Learner name</HeaderCell>
                                        <HeaderCell>Level</HeaderCell>
                                        <HeaderCell>Status</HeaderCell>
                                        <HeaderCell>Birth date</HeaderCell>
                                        <HeaderCell>Gender</HeaderCell>
                                        <HeaderCell>Mother</HeaderCell>
                                        <HeaderCell>Mother contact</HeaderCell>
                                        <HeaderCell>UAE address</HeaderCell>
                                        <HeaderCell>Documents</HeaderCell>
                                        <HeaderCell sticky>Action</HeaderCell>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-green-100">
                                    {learners.data.map((learner, index) => (
                                        <tr
                                            key={learner.id}
                                            className="transition odd:bg-white even:bg-green-50/45 hover:bg-emerald-50"
                                        >
                                            <td className="px-2 py-4 text-xs font-black text-slate-500">
                                                {(learners.from ?? 1) + index}
                                            </td>
                                            <td className="break-words px-2 py-4 text-xs font-bold text-slate-700">
                                                {learner.lrn ?? 'Not recorded'}
                                            </td>
                                            <td className="break-words px-2 py-4 align-top">
                                                <Link
                                                    href={route(
                                                        'learners.show',
                                                        learner.id,
                                                    )}
                                                    className="text-xs font-black text-slate-950 hover:text-green-700"
                                                >
                                                    {learner.full_name}
                                                </Link>
                                            </td>
                                            <td className="px-2 py-4 text-xs text-slate-700">
                                                <span className="inline-flex rounded-md border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-bold uppercase text-green-700">
                                                    {learner.current_enrollment
                                                        ?.level ?? 'Unassigned'}
                                                </span>
                                            </td>
                                            <td className="break-words px-2 py-4 text-xs font-bold text-slate-700">
                                                {learner.current_enrollment
                                                    ?.status ?? 'No status'}
                                            </td>
                                            <td className="break-words px-2 py-4 text-xs text-slate-700">
                                                {learner.birth_date ??
                                                    'Not recorded'}
                                            </td>
                                            <td className="break-words px-2 py-4 text-xs text-slate-700">
                                                {learner.gender ??
                                                    'Not recorded'}
                                            </td>
                                            <td className="break-words px-2 py-4 text-xs text-slate-700">
                                                {learner.mother_maiden_name ??
                                                    'Not recorded'}
                                            </td>
                                            <td className="break-words px-2 py-4 text-xs text-slate-700">
                                                {learner.mother_contact_number ??
                                                    'Not recorded'}
                                            </td>
                                            <td className="break-words px-2 py-4 text-xs text-slate-700">
                                                {learner.uae_address ??
                                                    'Not recorded'}
                                            </td>
                                            <td className="px-2 py-4 align-top">
                                                <DocumentPill
                                                    summary={
                                                        learner.document_summary
                                                    }
                                                />
                                            </td>
                                            <td className="sticky right-0 border-l border-green-100 bg-inherit px-1 py-4 align-top shadow-[-12px_0_22px_rgba(15,23,42,0.04)]">
                                                <div className="flex min-w-0 items-center justify-end gap-1">
                                                    <ActionIconButton
                                                        label="View profile"
                                                        tone="primary"
                                                        onClick={() =>
                                                            setSelectedLearner(
                                                                learner,
                                                            )
                                                        }
                                                    >
                                                        <EyeIcon />
                                                    </ActionIconButton>
                                                    <ActionIconLink
                                                        label="Full record"
                                                        href={route(
                                                            'learners.show',
                                                            learner.id,
                                                        )}
                                                    >
                                                        <RecordIcon />
                                                    </ActionIconLink>
                                                    <ActionIconLink
                                                        label="Edit learner"
                                                        href={route(
                                                            'learners.edit',
                                                            learner.id,
                                                        )}
                                                        tone="edit"
                                                    >
                                                        <PencilIcon />
                                                    </ActionIconLink>
                                                    <ActionIconButton
                                                        label={
                                                            learner
                                                                .current_enrollment
                                                                ?.status ===
                                                            'disabled'
                                                                ? 'Already disabled'
                                                                : 'Disable learner'
                                                        }
                                                        tone="disable"
                                                        disabled={
                                                            learner
                                                                .current_enrollment
                                                                ?.status ===
                                                            'disabled'
                                                        }
                                                        onClick={() =>
                                                            disableLearner(
                                                                learner,
                                                            )
                                                        }
                                                    >
                                                        <ThumbDownIcon />
                                                    </ActionIconButton>
                                                    <ActionIconButton
                                                        label="Delete learner"
                                                        tone="danger"
                                                        onClick={() =>
                                                            deleteLearner(
                                                                learner,
                                                            )
                                                        }
                                                    >
                                                        <TrashIcon />
                                                    </ActionIconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {learners.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={12}
                                                className="px-5 py-10 text-center text-sm text-slate-400"
                                            >
                                                No learner records match the
                                                current filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {learners.links.length > 3 && (
                            <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4">
                                {learners.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        className={
                                            'rounded-md border px-3 py-1 text-sm font-semibold ' +
                                            (link.active
                                                ? 'border-green-600 bg-green-600 text-white'
                                                : 'border-slate-200 text-slate-600 hover:border-green-200 hover:bg-green-50') +
                                            (!link.url
                                                ? ' pointer-events-none opacity-40'
                                                : '')
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>

            <LearnerProfileModal
                learner={selectedLearner}
                onClose={() => setSelectedLearner(null)}
            />
        </AuthenticatedLayout>
    );
}

function HeaderCell({
    children,
    sticky = false,
}: {
    children: string;
    sticky?: boolean;
}) {
    return (
        <th
            className={
                'break-words bg-[#005f3d] px-2 py-3 text-left text-[11px] font-black uppercase tracking-wide text-white ' +
                (sticky
                    ? 'sticky right-0 z-30 border-l border-[#004d31] shadow-[-12px_0_22px_rgba(15,23,42,0.08)]'
                    : '')
            }
        >
            {children}
        </th>
    );
}

function ActionIconLink({
    href,
    label,
    children,
    tone = 'default',
}: {
    href: string;
    label: string;
    children: ReactNode;
    tone?: 'default' | 'edit';
}) {
    return (
        <Link
            href={href}
            title={label}
            aria-label={label}
            className={actionIconClasses(tone)}
        >
            {children}
        </Link>
    );
}

function ActionIconButton({
    label,
    children,
    onClick,
    tone = 'default',
    disabled = false,
}: {
    label: string;
    children: ReactNode;
    onClick: () => void;
    tone?: 'default' | 'primary' | 'disable' | 'danger';
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
            className={actionIconClasses(tone)}
        >
            {children}
        </button>
    );
}

function actionIconClasses(
    tone: 'default' | 'primary' | 'edit' | 'disable' | 'danger',
) {
    const tones = {
        default:
            'border-slate-200 bg-white text-slate-700 hover:border-green-200 hover:bg-green-50 hover:text-green-800',
        primary:
            'border-green-700 bg-green-600 text-white hover:bg-green-700',
        edit: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100',
        disable:
            'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300',
        danger: 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100',
    };

    return `inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border shadow-sm transition focus:outline-none focus:ring-2 focus:ring-green-500/30 disabled:cursor-not-allowed disabled:shadow-none ${tones[tone]}`;
}

function ActionSvg({ children }: { children: ReactNode }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-3.5 w-3.5"
        >
            {children}
        </svg>
    );
}

function EyeIcon() {
    return (
        <ActionSvg>
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
        </ActionSvg>
    );
}

function RecordIcon() {
    return (
        <ActionSvg>
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v5h5" />
            <path d="M10 13h6" />
            <path d="M10 17h4" />
        </ActionSvg>
    );
}

function PencilIcon() {
    return (
        <ActionSvg>
            <path d="m16 3 5 5L8 21H3v-5z" />
            <path d="m15 4 5 5" />
        </ActionSvg>
    );
}

function ThumbDownIcon() {
    return (
        <ActionSvg>
            <path d="M17 14V4" />
            <path d="M7 10.5V4" />
            <path d="M7 10.5 11 21l1.8-.5a2.7 2.7 0 0 0 1.9-3.2L14 14h4.4a3 3 0 0 0 2.9-3.7l-.9-3.8A3 3 0 0 0 17.5 4H5a2 2 0 0 0-2 2v2.5a2 2 0 0 0 2 2z" />
        </ActionSvg>
    );
}

function TrashIcon() {
    return (
        <ActionSvg>
            <path d="M4 7h16" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M6 7l1 14h10l1-14" />
            <path d="M9 7V4h6v3" />
        </ActionSvg>
    );
}

function LearnerProfileModal({
    learner,
    onClose,
}: {
    learner: LearnerRow | null;
    onClose: () => void;
}) {
    const documentTotal = learner?.document_summary.total ?? 0;
    const documentPercent =
        documentTotal === 0
            ? 0
            : Math.round(
                  ((learner?.document_summary.ok ?? 0) / documentTotal) * 100,
              );

    return (
        <Modal show={learner !== null} onClose={onClose} maxWidth="2xl">
            {learner && (
                <div className="bg-[#F8FAFC]">
                    {/* Premium Dark Header */}
                    <div className="relative overflow-hidden bg-slate-950 px-8 py-8 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-900/40" />
                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                    Learner profile
                                </p>
                                <h2 className="mt-1 text-3xl font-black tracking-tight text-white drop-shadow-md">
                                    {learner.full_name}
                                </h2>
                                <p className="mt-2 text-sm font-bold text-slate-400">
                                    LRN {learner.lrn || 'Not recorded'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm ring-1 ring-white/20 transition hover:bg-white/20 hover:ring-white/40"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-6 p-8 lg:grid-cols-1">
                        <main className="space-y-6">
                            <section className="grid gap-4 sm:grid-cols-3">
                                <ProfileMetric
                                    label="Level"
                                    value={
                                        learner.current_enrollment?.level ??
                                        'Unassigned'
                                    }
                                />
                                <ProfileMetric
                                    label="Status"
                                    value={
                                        learner.current_enrollment?.status ??
                                        'No status'
                                    }
                                />
                                <ProfileMetric
                                    label="Docs OK"
                                    value={`${documentPercent}%`}
                                    tone={
                                        documentPercent < 100
                                            ? 'warn'
                                            : 'default'
                                    }
                                />
                            </section>

                            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium transition duration-300 hover:shadow-lg">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Identity
                                </h3>
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <ProfileField
                                        label="Birth date"
                                        value={learner.birth_date}
                                    />
                                    <ProfileField
                                        label="Gender"
                                        value={learner.gender}
                                    />
                                    <ProfileField
                                        label="Academic year"
                                        value={
                                            learner.current_enrollment
                                                ?.academic_year
                                        }
                                    />
                                    <ProfileField
                                        label="Previous school"
                                        value={learner.previous_school}
                                    />
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium transition duration-300 hover:shadow-lg">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Family contacts
                                </h3>
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <FamilyBlock
                                        label="Mother"
                                        name={learner.mother_maiden_name}
                                        contact={
                                            learner.mother_contact_number
                                        }
                                        email={learner.mother_email}
                                    />
                                    <FamilyBlock
                                        label="Father"
                                        name={learner.father_name}
                                        contact={
                                            learner.father_contact_number
                                        }
                                        email={learner.father_email}
                                    />
                                </div>
                            </section>

                            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium transition duration-300 hover:shadow-lg">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Addresses
                                </h3>
                                <div className="mt-5 grid gap-4">
                                    <ProfileField
                                        label="UAE address"
                                        value={learner.uae_address}
                                    />
                                    <ProfileField
                                        label="Philippine address"
                                        value={learner.philippine_address}
                                    />
                                </div>
                            </section>
                        </main>

                        <aside className="space-y-6">
                            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-premium transition duration-300 hover:shadow-lg">
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Document summary
                                </h3>
                                <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/50">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-glow"
                                        style={{
                                            width: `${documentPercent}%`,
                                        }}
                                    />
                                </div>
                                <p className="mt-3 text-lg font-black text-slate-800">
                                    {documentPercent}% complete
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                    <DocStat
                                        label="OK"
                                        value={learner.document_summary.ok}
                                    />
                                    <DocStat
                                        label="Missing"
                                        value={
                                            learner.document_summary.missing
                                        }
                                        warn
                                    />
                                    <DocStat
                                        label="Expired"
                                        value={
                                            learner.document_summary.expired
                                        }
                                        warn
                                    />
                                    <DocStat
                                        label="Pending"
                                        value={
                                            learner.document_summary
                                                .pending_review
                                        }
                                    />
                                </div>
                            </section>

                            <Link
                                href={route('learners.show', learner.id)}
                                className="block rounded-xl bg-green-700 px-4 py-3 text-center text-sm font-black text-white shadow-sm hover:bg-green-800"
                            >
                                Open full record
                            </Link>
                        </aside>
                    </div>
                </div>
            )}
        </Modal>
    );
}

function ProfileMetric({
    label,
    value,
    tone = 'default',
}: {
    label: string;
    value: string;
    tone?: 'default' | 'warn';
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p
                className={
                    'mt-2 text-lg font-black ' +
                    (tone === 'warn' ? 'text-amber-700' : 'text-slate-900')
                }
            >
                {value}
            </p>
        </div>
    );
}

function ProfileField({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                {label}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
                {value || 'Not recorded'}
            </p>
        </div>
    );
}

function DetailLine({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <p className="grid grid-cols-[76px_minmax(0,1fr)] gap-2">
            <span className="font-bold uppercase text-slate-400">{label}</span>
            <span className="truncate font-semibold text-slate-700">
                {value || 'Not recorded'}
            </span>
        </p>
    );
}

function FamilyBlock({
    label,
    name,
    contact,
    email,
}: {
    label: string;
    name: string | null;
    contact: string | null;
    email?: string | null;
}) {
    return (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
            <p className="text-xs font-bold uppercase text-slate-400">
                {label}
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-800">
                {name || 'Name not recorded'}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
                {contact || 'Contact missing'}
            </p>
            {email && (
                <p className="mt-0.5 truncate text-xs font-bold text-[#005f3d]">
                    {email}
                </p>
            )}
        </div>
    );
}

function DocStat({
    label,
    value,
    warn = false,
}: {
    label: string;
    value: number;
    warn?: boolean;
}) {
    return (
        <div
            className={
                'rounded-md border px-2 py-1 ' +
                (warn && value > 0
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700')
            }
        >
            <span className="font-black">{value}</span>{' '}
            <span className="font-bold uppercase">{label}</span>
        </div>
    );
}

function DocumentPill({ summary }: { summary: DocumentSummary }) {
    const clean = summary.missing === 0 && summary.expired === 0;

    return (
        <div
            className={
                'inline-flex max-w-full flex-wrap items-center rounded-md px-1.5 py-1 text-[11px] font-bold leading-tight ' +
                (clean
                    ? 'ops-badge-ok'
                    : 'ops-badge-warn')
            }
        >
            {summary.ok}/{summary.total} ok
            {!clean && ` · ${summary.missing + summary.expired} needs review`}
        </div>
    );
}
