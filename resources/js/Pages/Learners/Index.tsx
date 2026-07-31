import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

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
    mother_contact_number: string | null;
    father_contact_number: string | null;
    uae_address: string | null;
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

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Registrar records
                        </p>
                        <h2 className="text-xl font-semibold leading-tight text-gray-900">
                            Learner Directory
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
            <Head title="Learner Directory" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto]"
                    >
                        <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Search
                            </span>
                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Name or LRN"
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Level
                            </span>
                            <select
                                value={level}
                                onChange={(event) =>
                                    setLevel(event.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Status
                            </span>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="mt-1 block w-full rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                                className="inline-flex h-10 items-center rounded-md bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Apply
                            </button>
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-10 items-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Clear
                            </button>
                        </div>
                    </form>

                    <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                    Current learner records
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Showing {learners.from ?? 0}-
                                    {learners.to ?? 0} of {learners.total}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={learnerExportUrl}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Export learners
                                </a>
                                <a
                                    href={missingDocumentsExportUrl}
                                    className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                                >
                                    Missing docs
                                </a>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <HeaderCell>Learner</HeaderCell>
                                        <HeaderCell>Level</HeaderCell>
                                        <HeaderCell>Contacts</HeaderCell>
                                        <HeaderCell>Documents</HeaderCell>
                                        <HeaderCell>Address</HeaderCell>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {learners.data.map((learner) => (
                                        <tr
                                            key={learner.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <Link
                                                    href={route(
                                                        'learners.show',
                                                        learner.id,
                                                    )}
                                                    className="font-semibold text-gray-900 hover:text-indigo-700"
                                                >
                                                    {learner.full_name}
                                                </Link>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    LRN {learner.lrn ?? 'None'} ·{' '}
                                                    {learner.gender ?? 'No gender'}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                <span className="font-semibold">
                                                    {learner.current_enrollment
                                                        ?.level ?? 'Unassigned'}
                                                </span>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {learner.current_enrollment
                                                        ?.status ?? 'No status'}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                                                <p>
                                                    M:{' '}
                                                    {learner.mother_contact_number ??
                                                        'Missing'}
                                                </p>
                                                <p className="mt-1">
                                                    F:{' '}
                                                    {learner.father_contact_number ??
                                                        'Missing'}
                                                </p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <DocumentPill
                                                    summary={
                                                        learner.document_summary
                                                    }
                                                />
                                            </td>
                                            <td className="max-w-xs truncate px-5 py-4 text-sm text-gray-700">
                                                {learner.uae_address ??
                                                    'No UAE address'}
                                            </td>
                                        </tr>
                                    ))}
                                    {learners.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-5 py-10 text-center text-sm text-gray-500"
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
                            <div className="flex flex-wrap gap-2 border-t border-gray-200 px-5 py-4">
                                {learners.links.map((link) => (
                                    <Link
                                        key={link.label}
                                        href={link.url ?? '#'}
                                        preserveScroll
                                        className={
                                            'rounded-md border px-3 py-1 text-sm ' +
                                            (link.active
                                                ? 'border-gray-900 bg-gray-900 text-white'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50') +
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
        </AuthenticatedLayout>
    );
}

function HeaderCell({ children }: { children: string }) {
    return (
        <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            {children}
        </th>
    );
}

function DocumentPill({ summary }: { summary: DocumentSummary }) {
    const clean = summary.missing === 0 && summary.expired === 0;

    return (
        <div
            className={
                'inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ' +
                (clean
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-800')
            }
        >
            {summary.ok}/{summary.total} ok
            {!clean && ` · ${summary.missing + summary.expired} needs review`}
        </div>
    );
}
