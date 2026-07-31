import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

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

type DocumentRequirement = {
    id: number;
    document_type: string;
    label: string;
    status: string;
    verified_at: string | null;
    expires_on: string | null;
    notes: string | null;
};

type LearnerProfile = {
    id: number;
    lrn: string | null;
    full_name: string;
    birth_date: string | null;
    gender: string | null;
    mother_contact_number: string | null;
    mother_maiden_name: string | null;
    father_contact_number: string | null;
    father_name: string | null;
    philippine_address: string | null;
    uae_address: string | null;
    previous_school: string | null;
    current_enrollment: EnrollmentSummary;
    document_summary: DocumentSummary;
    document_requirements: DocumentRequirement[];
};

type Props = {
    activeYear: ActiveYear;
    learner: LearnerProfile;
};

export default function LearnersShow({ activeYear, learner }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Link
                            href={route('learners.index')}
                            className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
                        >
                            Back to learners
                        </Link>
                        <h2 className="mt-1 text-xl font-semibold leading-tight text-gray-900">
                            {learner.full_name}
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
            <Head title={learner.full_name} />

            <div className="py-8">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
                    <main className="space-y-6">
                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Learner profile
                                </h3>
                            </div>
                            <div className="grid gap-5 p-6 sm:grid-cols-2">
                                <Field label="LRN" value={learner.lrn} />
                                <Field
                                    label="Birth date"
                                    value={learner.birth_date}
                                />
                                <Field label="Gender" value={learner.gender} />
                                <Field
                                    label="Previous school"
                                    value={learner.previous_school}
                                />
                                <Field
                                    label="UAE address"
                                    value={learner.uae_address}
                                    wide
                                />
                                <Field
                                    label="Philippine address"
                                    value={learner.philippine_address}
                                    wide
                                />
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Parent and guardian contacts
                                </h3>
                            </div>
                            <div className="grid gap-5 p-6 sm:grid-cols-2">
                                <Field
                                    label="Mother"
                                    value={learner.mother_maiden_name}
                                />
                                <Field
                                    label="Mother contact"
                                    value={learner.mother_contact_number}
                                />
                                <Field
                                    label="Father"
                                    value={learner.father_name}
                                />
                                <Field
                                    label="Father contact"
                                    value={learner.father_contact_number}
                                />
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-base font-semibold text-gray-900">
                                    Document requirements
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {learner.document_requirements.map(
                                    (document) => (
                                        <div
                                            key={document.id}
                                            className="grid gap-3 px-6 py-4 sm:grid-cols-[minmax(0,1fr)_160px]"
                                        >
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {document.label}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {document.notes ??
                                                        'No notes recorded'}
                                                </p>
                                            </div>
                                            <div className="sm:text-right">
                                                <StatusBadge
                                                    status={document.status}
                                                />
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Expires:{' '}
                                                    {document.expires_on ??
                                                        'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>
                        </section>
                    </main>

                    <aside className="space-y-6">
                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-900">
                                Current enrollment
                            </h3>
                            <div className="mt-4 space-y-4">
                                <Metric
                                    label="Level"
                                    value={
                                        learner.current_enrollment?.level ??
                                        'Unassigned'
                                    }
                                />
                                <Metric
                                    label="Status"
                                    value={
                                        learner.current_enrollment?.status ??
                                        'No status'
                                    }
                                />
                                <Metric
                                    label="Academic year"
                                    value={
                                        learner.current_enrollment
                                            ?.academic_year ?? 'Not set'
                                    }
                                />
                            </div>
                        </section>

                        <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-900">
                                Compliance snapshot
                            </h3>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <SmallMetric
                                    label="OK"
                                    value={learner.document_summary.ok}
                                />
                                <SmallMetric
                                    label="Missing"
                                    value={learner.document_summary.missing}
                                    tone="warn"
                                />
                                <SmallMetric
                                    label="Expired"
                                    value={learner.document_summary.expired}
                                    tone="warn"
                                />
                                <SmallMetric
                                    label="Pending"
                                    value={
                                        learner.document_summary.pending_review
                                    }
                                />
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Field({
    label,
    value,
    wide = false,
}: {
    label: string;
    value: string | null;
    wide?: boolean;
}) {
    return (
        <div className={wide ? 'sm:col-span-2' : ''}>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900">
                {value ?? 'Not recorded'}
            </p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
        </div>
    );
}

function SmallMetric({
    label,
    value,
    tone = 'default',
}: {
    label: string;
    value: number;
    tone?: 'default' | 'warn';
}) {
    return (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <p
                className={
                    'text-2xl font-semibold ' +
                    (tone === 'warn' && value > 0
                        ? 'text-amber-700'
                        : 'text-gray-900')
                }
            >
                {value}
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const clean = status === 'ok';

    return (
        <span
            className={
                'inline-flex rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ' +
                (clean
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-800')
            }
        >
            {status.replaceAll('_', ' ')}
        </span>
    );
}
